<?php

namespace Tests\Feature;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use App\Services\TransactionHashService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IntegrityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private AmmunitionType $ammunitionType;
    private TransactionHashService $hashService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
        ]);
        $this->hashService = app(TransactionHashService::class);
    }

    public function test_integrity_check_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/integrity-check');

        $response->assertStatus(200);
    }

    public function test_valid_chain_passes_verification(): void
    {
        // Create transactions through the proper action to ensure valid hashes
        $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'consumption',
                'quantity' => 30,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $result = $this->hashService->verifyChain($this->user);

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
    }
}
