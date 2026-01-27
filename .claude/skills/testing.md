# テスト作成スキル

## 概要

このスキルはLaravelでのテスト作成を支援します。

## ユニットテスト

サービスクラスのテスト：

```php
<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

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

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(BalanceService::class);
        $this->user = User::factory()->create();
    }

    public function test_calculates_current_balance_correctly(): void
    {
        // Arrange
        $ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // 譲受 +100
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
        ]);

        // 消費 -30
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => -30,
        ]);

        // Act
        $balance = $this->service->getCurrentBalance(
            $this->user->id,
            $ammunitionType->id
        );

        // Assert
        $this->assertEquals(70, $balance);
    }

    public function test_calculates_balance_at_specific_date(): void
    {
        $ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // 1月1日: +100
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 100,
            'event_date' => '2025-01-01',
        ]);

        // 1月15日: -30
        TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
            'ammunition_type_id' => $ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => -30,
            'event_date' => '2025-01-15',
        ]);

        // 1月10日時点の残高は100
        $balance = $this->service->getBalanceAtDate(
            $this->user->id,
            $ammunitionType->id,
            new \DateTime('2025-01-10')
        );

        $this->assertEquals(100, $balance);
    }
}
```

## フィーチャーテスト

HTTPリクエストのテスト：

```php
<?php

declare(strict_types=1);

namespace Tests\Feature\Transaction;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateTransactionTest extends TestCase
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

    public function test_can_create_acquisition_event(): void
    {
        $response = $this->actingAs($this->user)->post('/transactions', [
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 50,
            'event_date' => '2025-01-15',
            'counterparty_name' => '山田銃砲店',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('transaction_events', [
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 50,
        ]);
    }

    public function test_consumption_requires_location(): void
    {
        $response = $this->actingAs($this->user)->post('/transactions', [
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'consumption',
            'quantity' => 10,
            'event_date' => '2025-01-15',
            // location missing
        ]);

        $response->assertSessionHasErrors('location');
    }

    public function test_unauthenticated_user_cannot_create_event(): void
    {
        $response = $this->post('/transactions', [
            'ammunition_type_id' => $this->ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 50,
            'event_date' => '2025-01-15',
        ]);

        $response->assertRedirect('/login');
    }

    public function test_cannot_delete_transaction_event(): void
    {
        $event = TransactionEvent::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // DELETEエンドポイントは存在しないが、
        // モデルレベルでも削除は禁止されている
        $this->expectException(\DomainException::class);
        $event->delete();
    }
}
```

## ハッシュチェーン検証テスト

```php
<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\TransactionEvent;
use App\Models\User;
use App\Services\TransactionHashService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TransactionHashServiceTest extends TestCase
{
    use RefreshDatabase;

    private TransactionHashService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(TransactionHashService::class);
    }

    public function test_hash_chain_is_valid(): void
    {
        $user = User::factory()->create();
        $ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $user->id,
        ]);

        // 複数のイベントを作成
        for ($i = 0; $i < 5; $i++) {
            TransactionEvent::factory()->create([
                'user_id' => $user->id,
                'ammunition_type_id' => $ammunitionType->id,
            ]);
        }

        // チェーン検証
        $errors = $this->service->verifyChain();

        $this->assertEmpty($errors);
    }

    public function test_detects_tampered_data(): void
    {
        $user = User::factory()->create();
        $event = TransactionEvent::factory()->create([
            'user_id' => $user->id,
            'quantity' => 100,
        ]);

        // DBを直接改ざん（Observerをバイパス）
        DB::table('transaction_events')
            ->where('id', $event->id)
            ->update(['quantity' => 999]);

        // チェーン検証でエラーを検出
        $errors = $this->service->verifyChain();

        $this->assertNotEmpty($errors);
        $this->assertEquals($event->id, $errors[0]['event_id']);
    }
}
```

## 監査ログテスト

```php
<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_log_is_created_on_event_creation(): void
    {
        $user = User::factory()->create();
        $ammunitionType = AmmunitionType::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->actingAs($user)->post('/transactions', [
            'ammunition_type_id' => $ammunitionType->id,
            'event_type' => 'acquisition',
            'quantity' => 50,
            'event_date' => '2025-01-15',
            'counterparty_name' => '山田銃砲店',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'create',
            'auditable_type' => TransactionEvent::class,
        ]);
    }
}
```

## Factoryの作成

```php
<?php

namespace Database\Factories;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionEventFactory extends Factory
{
    protected $model = TransactionEvent::class;

    public function definition(): array
    {
        $eventType = $this->faker->randomElement([
            'acquisition',
            'consumption',
            'transfer',
            'disposal',
        ]);

        $quantity = $this->faker->numberBetween(1, 100);
        if (in_array($eventType, ['consumption', 'transfer', 'disposal'])) {
            $quantity = -$quantity;
        }

        return [
            'user_id' => User::factory(),
            'ammunition_type_id' => AmmunitionType::factory(),
            'event_type' => $eventType,
            'quantity' => $quantity,
            'event_date' => $this->faker->date(),
            'notes' => $this->faker->optional()->sentence(),
            'record_hash' => hash('sha256', $this->faker->uuid()),
            'previous_hash' => null,
        ];
    }

    public function acquisition(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'acquisition',
            'quantity' => abs($attributes['quantity'] ?? $this->faker->numberBetween(1, 100)),
            'counterparty_name' => $this->faker->company(),
        ]);
    }

    public function consumption(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'consumption',
            'quantity' => -abs($attributes['quantity'] ?? $this->faker->numberBetween(1, 100)),
            'location' => $this->faker->city() . '射撃場',
        ]);
    }
}
```
