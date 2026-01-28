<?php

namespace Tests\Feature;

use App\Models\AmmunitionType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AmmunitionTypeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_ammunition_types_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/ammunition-types');

        $response->assertStatus(200);
    }

    public function test_ammunition_type_can_be_created(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/ammunition-types', [
                'category' => '散弾',
                'caliber' => '12番',
                'manufacturer' => 'テストメーカー',
                'notes' => 'テスト備考',
            ]);

        $response->assertRedirect('/ammunition-types');
        $this->assertDatabaseHas('ammunition_types', [
            'user_id' => $this->user->id,
            'category' => '散弾',
            'caliber' => '12番',
            'manufacturer' => 'テストメーカー',
        ]);
    }

    public function test_ammunition_type_can_be_updated(): void
    {
        $ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
            'category' => '散弾',
            'caliber' => '12番',
        ]);

        $response = $this->actingAs($this->user)
            ->put("/ammunition-types/{$ammunitionType->id}", [
                'category' => 'ライフル弾',
                'caliber' => '.308 Winchester',
                'manufacturer' => '更新メーカー',
                'is_active' => true,
            ]);

        $response->assertRedirect('/ammunition-types');
        $this->assertDatabaseHas('ammunition_types', [
            'id' => $ammunitionType->id,
            'category' => 'ライフル弾',
            'caliber' => '.308 Winchester',
        ]);
    }

    public function test_user_can_only_see_own_ammunition_types(): void
    {
        $otherUser = User::factory()->create();

        $ownType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $otherType = AmmunitionType::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/ammunition-types');

        $response->assertStatus(200);
        // Inertia responses contain props as JSON
        $response->assertInertia(fn ($page) => $page
            ->component('ammunition-types/index')
            ->has('ammunitionTypes.data', 1)
        );
    }
}
