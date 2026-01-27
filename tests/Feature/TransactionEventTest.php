<?php

namespace Tests\Feature;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionEventTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private AmmunitionType $ammunitionType;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
        ]);
    }

    public function test_transactions_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/transactions');

        $response->assertStatus(200);
    }

    public function test_transaction_can_be_created(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
                'counterparty_name' => '銃砲店',
            ]);

        $response->assertRedirect('/transactions');
        $this->assertDatabaseHas('transaction_events', [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100, // Positive for acquisition
        ]);
    }

    public function test_consumption_creates_negative_quantity(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'consumption',
                'quantity' => 50,
                'event_date' => now()->format('Y-m-d'),
                'location' => '射撃場',
            ]);

        $response->assertRedirect('/transactions');
        $this->assertDatabaseHas('transaction_events', [
            'user_id' => $this->user->id,
            'event_type' => 'consumption',
            'quantity' => -50, // Negative for consumption
        ]);
    }

    public function test_transaction_has_hash(): void
    {
        $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $transaction = TransactionEvent::where('user_id', $this->user->id)->first();

        $this->assertNotNull($transaction->record_hash);
        $this->assertEquals(64, strlen($transaction->record_hash)); // SHA-256 hash length
    }

    public function test_transaction_chain_is_linked(): void
    {
        // Create first transaction
        $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $first = TransactionEvent::where('user_id', $this->user->id)->first();
        $this->assertNull($first->previous_hash); // First has no previous

        // Create second transaction
        $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'consumption',
                'quantity' => 30,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $second = TransactionEvent::where('user_id', $this->user->id)
            ->orderByDesc('id')
            ->first();

        // Second's previous_hash should match first's record_hash
        $this->assertEquals($first->record_hash, $second->previous_hash);
    }

    public function test_transaction_cannot_be_deleted(): void
    {
        $transaction = TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ammunitionType->id,
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Transaction events cannot be deleted');

        $transaction->delete();
    }
}
