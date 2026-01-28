<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AmmunitionType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ValidationTest extends TestCase
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
            'is_active' => true,
        ]);
    }

    // ==========================================
    // Ammunition Type Validation Tests
    // ==========================================

    public function test_ammunition_type_requires_category(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/ammunition-types', [
                'caliber' => '12番',
            ]);

        $response->assertSessionHasErrors(['category']);
    }

    public function test_ammunition_type_requires_caliber(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/ammunition-types', [
                'category' => '散弾',
            ]);

        $response->assertSessionHasErrors(['caliber']);
    }

    public function test_ammunition_type_category_max_length(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/ammunition-types', [
                'category' => str_repeat('あ', 101), // 101 characters
                'caliber' => '12番',
            ]);

        $response->assertSessionHasErrors(['category']);
    }

    public function test_ammunition_type_caliber_max_length(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/ammunition-types', [
                'category' => '散弾',
                'caliber' => str_repeat('あ', 101), // 101 characters
            ]);

        $response->assertSessionHasErrors(['caliber']);
    }

    // ==========================================
    // Transaction Event Validation Tests
    // ==========================================

    public function test_transaction_requires_ammunition_type_id(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['ammunition_type_id']);
    }

    public function test_transaction_requires_event_type(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['event_type']);
    }

    public function test_transaction_requires_quantity(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['quantity']);
    }

    public function test_transaction_requires_event_date(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
            ]);

        $response->assertSessionHasErrors(['event_date']);
    }

    public function test_transaction_quantity_must_be_positive(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 0,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['quantity']);
    }

    public function test_transaction_quantity_cannot_be_negative(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => -10,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['quantity']);
    }

    public function test_transaction_event_date_cannot_be_future(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->addDay()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['event_date']);
    }

    public function test_transaction_event_type_must_be_valid(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'invalid_type',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['event_type']);
    }

    public function test_transaction_event_type_cannot_be_correction(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'correction',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['event_type']);
    }

    public function test_transaction_ammunition_type_must_be_active(): void
    {
        $inactiveType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $inactiveType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['ammunition_type_id']);
    }

    public function test_transaction_notes_max_length(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
                'notes' => str_repeat('あ', 1001), // 1001 characters
            ]);

        $response->assertSessionHasErrors(['notes']);
    }

    // ==========================================
    // Valid Event Types Tests
    // ==========================================

    public function test_acquisition_is_valid_event_type(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionDoesntHaveErrors(['event_type']);
        $response->assertRedirect('/transactions');
    }

    public function test_consumption_is_valid_event_type(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'consumption',
                'quantity' => 50,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionDoesntHaveErrors(['event_type']);
        $response->assertRedirect('/transactions');
    }

    public function test_transfer_is_valid_event_type(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'transfer',
                'quantity' => 30,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionDoesntHaveErrors(['event_type']);
        $response->assertRedirect('/transactions');
    }

    public function test_disposal_is_valid_event_type(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'disposal',
                'quantity' => 10,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionDoesntHaveErrors(['event_type']);
        $response->assertRedirect('/transactions');
    }
}
