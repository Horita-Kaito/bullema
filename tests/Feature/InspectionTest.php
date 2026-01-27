<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InspectionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_inspection_index_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/inspection');

        $response->assertStatus(200);
    }

    public function test_inspection_balance_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/inspection/balance');

        $response->assertStatus(200);
    }

    public function test_inspection_ledger_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/inspection/ledger');

        $response->assertStatus(200);
    }

    public function test_inspection_attachments_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/inspection/attachments');

        $response->assertStatus(200);
    }
}
