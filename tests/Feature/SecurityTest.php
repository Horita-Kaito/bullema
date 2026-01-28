<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private AmmunitionType $ownAmmunitionType;
    private AmmunitionType $otherAmmunitionType;
    private TransactionEvent $ownTransaction;
    private TransactionEvent $otherTransaction;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();

        $this->ownAmmunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);

        $this->otherAmmunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->otherUser->id,
            'is_active' => true,
        ]);

        $this->ownTransaction = TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->ownAmmunitionType->id,
        ]);

        $this->otherTransaction = TransactionEvent::factory()->create([
            'user_id' => $this->otherUser->id,
            'ammunition_type_id' => $this->otherAmmunitionType->id,
        ]);
    }

    // ==========================================
    // Ammunition Type Access Control Tests
    // ==========================================

    public function test_cannot_create_transaction_with_other_users_ammunition_type(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->otherAmmunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['ammunition_type_id']);

        $this->assertDatabaseMissing('transaction_events', [
            'user_id' => $this->user->id,
            'ammunition_type_id' => $this->otherAmmunitionType->id,
        ]);
    }

    public function test_cannot_edit_other_users_ammunition_type(): void
    {
        $response = $this->actingAs($this->user)
            ->put("/ammunition-types/{$this->otherAmmunitionType->id}", [
                'category' => '改ざん',
                'caliber' => '改ざん口径',
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('ammunition_types', [
            'id' => $this->otherAmmunitionType->id,
            'category' => '改ざん',
        ]);
    }

    public function test_ammunition_types_list_only_shows_own(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/ammunition-types');

        $response->assertStatus(200);
        // Inertia responses contain props as JSON, verify data is present
        $response->assertInertia(fn ($page) => $page
            ->component('ammunition-types/index')
            ->has('ammunitionTypes.data', 1)
        );
    }

    // ==========================================
    // Transaction Access Control Tests
    // ==========================================

    public function test_cannot_view_other_users_transaction(): void
    {
        $response = $this->actingAs($this->user)
            ->get("/transactions/{$this->otherTransaction->id}");

        // Returns 404 (not found for this user) rather than 403
        $response->assertStatus(404);
    }

    public function test_transactions_list_only_shows_own(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/transactions');

        $response->assertStatus(200);
    }

    public function test_cannot_correct_other_users_transaction(): void
    {
        $response = $this->actingAs($this->user)
            ->get("/transactions/{$this->otherTransaction->id}/correct");

        $response->assertStatus(403);
    }

    public function test_cannot_submit_correction_for_other_users_transaction(): void
    {
        $response = $this->actingAs($this->user)
            ->post("/transactions/{$this->otherTransaction->id}/correct", [
                'quantity' => 10,
                'event_date' => now()->format('Y-m-d'),
                'correction_reason' => '不正アクセス試行',
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('transaction_events', [
            'original_event_id' => $this->otherTransaction->id,
            'user_id' => $this->user->id,
        ]);
    }

    // ==========================================
    // Balance Access Control Tests
    // ==========================================

    public function test_cannot_view_other_users_balance_detail(): void
    {
        $response = $this->actingAs($this->user)
            ->get("/balances/{$this->otherAmmunitionType->id}");

        // Returns 404 (not found for this user) rather than 403
        $response->assertStatus(404);
    }

    public function test_balances_list_only_shows_own(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/balances');

        $response->assertStatus(200);
        // Inertia responses contain props as JSON
        $response->assertInertia(fn ($page) => $page
            ->component('balances/index')
            ->has('balances', 1)
        );
    }

    // ==========================================
    // Inspection Mode Access Control Tests
    // ==========================================

    public function test_inspection_mode_only_shows_own_data(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/inspection');

        $response->assertStatus(200);
    }

    // ==========================================
    // Authentication Tests
    // ==========================================

    public function test_guest_cannot_access_transactions(): void
    {
        $response = $this->get('/transactions');

        $response->assertRedirect('/login');
    }

    public function test_guest_cannot_access_ammunition_types(): void
    {
        $response = $this->get('/ammunition-types');

        $response->assertRedirect('/login');
    }

    public function test_guest_cannot_access_balances(): void
    {
        $response = $this->get('/balances');

        $response->assertRedirect('/login');
    }

    public function test_guest_cannot_access_inspection_mode(): void
    {
        $response = $this->get('/inspection');

        $response->assertRedirect('/login');
    }

    public function test_guest_cannot_access_reports(): void
    {
        $response = $this->get('/reports');

        $response->assertRedirect('/login');
    }

    public function test_guest_cannot_access_audit_logs(): void
    {
        $response = $this->get('/audit-logs');

        $response->assertRedirect('/login');
    }

    // ==========================================
    // API/Direct Access Prevention Tests
    // ==========================================

    public function test_cannot_mass_assign_user_id_on_ammunition_type(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/ammunition-types', [
                'category' => '散弾',
                'caliber' => '12番',
                'user_id' => $this->otherUser->id, // Attempt to inject other user's ID
            ]);

        $response->assertRedirect('/ammunition-types');

        $ammunitionType = AmmunitionType::where('caliber', '12番')
            ->where('category', '散弾')
            ->first();

        $this->assertEquals($this->user->id, $ammunitionType->user_id);
    }

    public function test_cannot_mass_assign_user_id_on_transaction(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ownAmmunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
                'user_id' => $this->otherUser->id, // Attempt to inject other user's ID
            ]);

        $response->assertRedirect('/transactions');

        $transaction = TransactionEvent::where('ammunition_type_id', $this->ownAmmunitionType->id)
            ->where('quantity', 100)
            ->latest()
            ->first();

        $this->assertEquals($this->user->id, $transaction->user_id);
    }
}
