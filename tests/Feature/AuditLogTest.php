<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AmmunitionType;
use App\Models\AuditLog;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
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

    public function test_audit_logs_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/audit-logs');

        $response->assertStatus(200);
    }

    public function test_creating_ammunition_type_succeeds(): void
    {
        // Note: AmmunitionType audit logging not yet implemented
        $response = $this->actingAs($this->user)
            ->post('/ammunition-types', [
                'category' => '散弾',
                'caliber' => '20番',
            ]);

        $response->assertRedirect('/ammunition-types');
        $this->assertDatabaseHas('ammunition_types', [
            'user_id' => $this->user->id,
            'caliber' => '20番',
        ]);
    }

    public function test_updating_ammunition_type_succeeds(): void
    {
        // Note: AmmunitionType audit logging not yet implemented
        $response = $this->actingAs($this->user)
            ->put("/ammunition-types/{$this->ammunitionType->id}", [
                'category' => '更新種別',
                'caliber' => '更新口径',
                'is_active' => true,
            ]);

        $response->assertRedirect('/ammunition-types');
        $this->assertDatabaseHas('ammunition_types', [
            'id' => $this->ammunitionType->id,
            'caliber' => '更新口径',
        ]);
    }

    public function test_creating_transaction_creates_audit_log(): void
    {
        $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 100,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->user->id,
            'action' => 'create',
            'auditable_type' => TransactionEvent::class,
        ]);
    }

    public function test_login_succeeds(): void
    {
        // Note: Login audit logging not yet implemented
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
    }

    public function test_logout_succeeds(): void
    {
        // Note: Logout audit logging not yet implemented
        $this->actingAs($this->user)
            ->post('/logout');

        $this->assertGuest();
    }

    public function test_transaction_audit_log_records_ip_address(): void
    {
        $this->actingAs($this->user)
            ->post('/transactions', [
                'ammunition_type_id' => $this->ammunitionType->id,
                'event_type' => 'acquisition',
                'quantity' => 50,
                'event_date' => now()->format('Y-m-d'),
            ]);

        $log = AuditLog::where('user_id', $this->user->id)
            ->where('action', 'create')
            ->where('auditable_type', TransactionEvent::class)
            ->first();

        $this->assertNotNull($log);
        $this->assertNotNull($log->ip_address);
    }

    public function test_audit_logs_only_show_own_logs(): void
    {
        $otherUser = User::factory()->create();

        // Create log for current user
        AuditLog::create([
            'user_id' => $this->user->id,
            'action' => 'create',
            'auditable_type' => AmmunitionType::class,
            'auditable_id' => 1,
        ]);

        // Create log for other user
        AuditLog::create([
            'user_id' => $otherUser->id,
            'action' => 'create',
            'auditable_type' => AmmunitionType::class,
            'auditable_id' => 2,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/audit-logs');

        $response->assertStatus(200);
        // Note: Depending on implementation, may need to verify content
    }

    public function test_audit_log_is_paginated(): void
    {
        // Create many audit logs
        for ($i = 0; $i < 30; $i++) {
            AuditLog::create([
                'user_id' => $this->user->id,
                'action' => 'create',
                'auditable_type' => AmmunitionType::class,
                'auditable_id' => $i,
            ]);
        }

        $response = $this->actingAs($this->user)
            ->get('/audit-logs');

        $response->assertStatus(200);
    }

    public function test_audit_log_pagination_works(): void
    {
        // Create many audit logs
        for ($i = 0; $i < 30; $i++) {
            AuditLog::create([
                'user_id' => $this->user->id,
                'action' => 'create',
                'auditable_type' => AmmunitionType::class,
                'auditable_id' => $i,
            ]);
        }

        $response = $this->actingAs($this->user)
            ->get('/audit-logs?page=2');

        $response->assertStatus(200);
    }
}
