<?php

namespace Tests\Feature;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use App\Services\BalanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BalanceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private AmmunitionType $ammunitionType;
    private BalanceService $balanceService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
        ]);
        $this->balanceService = app(BalanceService::class);
    }

    public function test_balances_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/balances');

        $response->assertStatus(200);
    }

    public function test_balance_is_calculated_correctly(): void
    {
        // Create acquisition (+100)
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
        ]);

        // Create consumption (-30)
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => -30,
        ]);

        $balance = $this->balanceService->getCurrentBalance($this->user, $this->ammunitionType);

        $this->assertEquals(70, $balance);
    }

    public function test_balance_at_date_is_calculated_correctly(): void
    {
        // Day 1: acquisition (+100)
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2024-01-01',
        ]);

        // Day 2: consumption (-30)
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => -30,
            'event_date' => '2024-01-02',
        ]);

        // Day 3: consumption (-20)
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => -20,
            'event_date' => '2024-01-03',
        ]);

        // Check balance at different dates
        $this->assertEquals(
            100,
            $this->balanceService->getBalanceAtDate($this->user, $this->ammunitionType, '2024-01-01')
        );
        $this->assertEquals(
            70,
            $this->balanceService->getBalanceAtDate($this->user, $this->ammunitionType, '2024-01-02')
        );
        $this->assertEquals(
            50,
            $this->balanceService->getBalanceAtDate($this->user, $this->ammunitionType, '2024-01-03')
        );
    }
}
