<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use App\Services\BalanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BalanceServiceTest extends TestCase
{
    use RefreshDatabase;

    private BalanceService $service;
    private User $user;
    private AmmunitionType $ammunitionType;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BalanceService();
        $this->user = User::factory()->create();
        $this->ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);
    }

    public function test_get_current_balance_returns_zero_when_no_events(): void
    {
        $balance = $this->service->getCurrentBalance($this->user, $this->ammunitionType);

        $this->assertEquals(0, $balance);
    }

    public function test_get_current_balance_sums_all_quantities(): void
    {
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => 100,
            'event_type' => 'acquisition',
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => -30,
            'event_type' => 'consumption',
        ]);

        $balance = $this->service->getCurrentBalance($this->user, $this->ammunitionType);

        $this->assertEquals(70, $balance);
    }

    public function test_get_current_balance_can_be_negative(): void
    {
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => -50,
            'event_type' => 'consumption',
        ]);

        $balance = $this->service->getCurrentBalance($this->user, $this->ammunitionType);

        $this->assertEquals(-50, $balance);
    }

    public function test_get_current_balance_excludes_other_users(): void
    {
        $otherUser = User::factory()->create();

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => 100,
            'event_type' => 'acquisition',
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $otherUser->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => 200,
            'event_type' => 'acquisition',
        ]);

        $balance = $this->service->getCurrentBalance($this->user, $this->ammunitionType);

        $this->assertEquals(100, $balance);
    }

    public function test_get_balance_at_date_includes_events_up_to_date(): void
    {
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => 100,
            'event_type' => 'acquisition',
            'event_date' => '2024-01-01',
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => -30,
            'event_type' => 'consumption',
            'event_date' => '2024-01-15',
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => -20,
            'event_type' => 'consumption',
            'event_date' => '2024-02-01',
        ]);

        // Balance at Jan 10 should only include first event
        $balance1 = $this->service->getBalanceAtDate($this->user, $this->ammunitionType, '2024-01-10');
        $this->assertEquals(100, $balance1);

        // Balance at Jan 20 should include first two events
        $balance2 = $this->service->getBalanceAtDate($this->user, $this->ammunitionType, '2024-01-20');
        $this->assertEquals(70, $balance2);

        // Balance at Feb 5 should include all events
        $balance3 = $this->service->getBalanceAtDate($this->user, $this->ammunitionType, '2024-02-05');
        $this->assertEquals(50, $balance3);
    }

    public function test_get_all_current_balances_returns_all_active_types(): void
    {
        $ammunitionType2 = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);

        $inactiveType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
            'is_active' => false,
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => 100,
            'event_type' => 'acquisition',
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $ammunitionType2->id,
            'quantity' => 50,
            'event_type' => 'acquisition',
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $inactiveType->id,
            'quantity' => 200,
            'event_type' => 'acquisition',
        ]);

        $balances = $this->service->getAllCurrentBalances($this->user);

        $this->assertCount(2, $balances); // Only active types
        $this->assertEquals(100, $balances->firstWhere('ammunition_type.id', $this->ammunitionType->id)['balance']);
        $this->assertEquals(50, $balances->firstWhere('ammunition_type.id', $ammunitionType2->id)['balance']);
    }

    public function test_get_all_current_balances_includes_last_event_date(): void
    {
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => 100,
            'event_type' => 'acquisition',
            'event_date' => '2024-01-01',
        ]);

        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => -30,
            'event_type' => 'consumption',
            'event_date' => '2024-06-15',
        ]);

        $balances = $this->service->getAllCurrentBalances($this->user);
        $balance = $balances->first();

        // last_event_date may be Carbon object or string
        $lastEventDate = $balance['last_event_date'];
        if ($lastEventDate instanceof \Carbon\Carbon) {
            $lastEventDate = $lastEventDate->format('Y-m-d');
        }
        $this->assertEquals('2024-06-15', $lastEventDate);
    }

    public function test_get_balance_history_returns_collection(): void
    {
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => 100,
            'event_type' => 'acquisition',
            'event_date' => '2024-01-01',
        ]);

        $history = $this->service->getBalanceHistory(
            $this->user,
            $this->ammunitionType,
            '2024-01-01',
            '2024-01-05'
        );

        // Returns a collection with entries
        $this->assertInstanceOf(\Illuminate\Support\Collection::class, $history);
        $this->assertNotEmpty($history);
    }

    public function test_get_balance_history_has_date_and_balance_keys(): void
    {
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'quantity' => 100,
            'event_type' => 'acquisition',
            'event_date' => '2024-01-01',
        ]);

        $history = $this->service->getBalanceHistory(
            $this->user,
            $this->ammunitionType,
            '2024-01-01',
            '2024-01-03'
        );

        // Each entry should have date and balance
        $entry = $history->first();
        $this->assertArrayHasKey('date', $entry);
        $this->assertArrayHasKey('balance', $entry);
    }
}
