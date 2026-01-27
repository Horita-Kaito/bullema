# クリーンアーキテクチャ設計

## 方針

Laravelの利点を崩さず、以下の目的でクリーンアーキテクチャの概念を適用する：

1. **Controllerの肥大化防止** - ビジネスロジックをUseCasesに分離
2. **テスト容易性** - 依存性注入によるモック化
3. **責務の明確化** - 各クラスの役割を限定

## UseCases (Actions) パターン

### 概要

ユースケースごとに単一責務のActionクラスを作成する。
Laravel公式の「Action Classes」パターンに準拠。

### ディレクトリ構成

```
app/UseCases/
├── AmmunitionType/
│   ├── CreateAmmunitionTypeAction.php
│   ├── UpdateAmmunitionTypeAction.php
│   └── ListAmmunitionTypesAction.php
├── Transaction/
│   ├── CreateTransactionAction.php
│   ├── CreateCorrectionAction.php
│   └── ListTransactionsAction.php
├── Balance/
│   ├── CalculateCurrentBalanceAction.php
│   └── CalculateBalanceAtDateAction.php
├── Attachment/
│   ├── UploadAttachmentAction.php
│   └── DeleteAttachmentAction.php
└── Report/
    ├── GeneratePdfReportAction.php
    └── GenerateCsvReportAction.php
```

### Action クラスの実装例

```php
<?php

namespace App\UseCases\Transaction;

use App\Models\TransactionEvent;
use App\Models\User;
use App\Services\TransactionHashService;
use Illuminate\Support\Facades\DB;

final class CreateTransactionAction
{
    public function __construct(
        private TransactionHashService $hashService,
    ) {}

    /**
     * @param array{
     *   ammunition_type_id: int,
     *   event_type: string,
     *   quantity: int,
     *   event_date: string,
     *   notes?: string,
     *   location?: string,
     *   counterparty_name?: string,
     *   counterparty_address?: string,
     *   disposal_method?: string,
     * } $data
     */
    public function execute(array $data, User $user): TransactionEvent
    {
        return DB::transaction(function () use ($data, $user) {
            $previousHash = $this->hashService->getPreviousHash();

            // 数量の符号を決定（増加イベントは正、減少イベントは負）
            $quantity = $this->determineQuantitySign($data['event_type'], $data['quantity']);

            $event = new TransactionEvent([
                ...$data,
                'quantity' => $quantity,
                'user_id' => $user->id,
                'previous_hash' => $previousHash,
            ]);

            $event->save();

            // ハッシュを計算して保存
            $event->record_hash = $this->hashService->calculateHash($event, $previousHash);
            $event->saveQuietly(); // Observerを発火させない

            return $event->fresh();
        });
    }

    private function determineQuantitySign(string $eventType, int $quantity): int
    {
        $increaseTypes = ['acquisition', 'custody_return'];
        return in_array($eventType, $increaseTypes) ? abs($quantity) : -abs($quantity);
    }
}
```

### Controller での使用例

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionEventRequest;
use App\UseCases\Transaction\CreateTransactionAction;
use Illuminate\Http\RedirectResponse;

class TransactionEventController extends Controller
{
    public function store(
        StoreTransactionEventRequest $request,
        CreateTransactionAction $action,
    ): RedirectResponse {
        $event = $action->execute(
            $request->validated(),
            $request->user(),
        );

        return redirect()
            ->route('transactions.show', $event)
            ->with('success', '出納イベントを登録しました');
    }
}
```

## Domain Services

複数のモデルにまたがるビジネスロジックや、複雑な計算ロジックを担当。

### ディレクトリ構成

```
app/Services/
├── BalanceService.php           # 残高計算
├── TransactionHashService.php   # ハッシュチェーン
├── IntegrityCheckService.php    # 整合性検証
└── ReportGeneratorService.php   # 帳簿生成
```

### BalanceService 実装例

```php
<?php

namespace App\Services;

use App\Models\AmmunitionType;
use App\Models\TransactionEvent;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class BalanceService
{
    /**
     * 全実包種別の現在残高を取得
     *
     * @return Collection<int, array{ammunition_type: AmmunitionType, balance: int}>
     */
    public function getAllCurrentBalances(int $userId): Collection
    {
        return TransactionEvent::query()
            ->where('user_id', $userId)
            ->select('ammunition_type_id', DB::raw('SUM(quantity) as balance'))
            ->groupBy('ammunition_type_id')
            ->with('ammunitionType')
            ->get()
            ->map(fn ($row) => [
                'ammunition_type' => $row->ammunitionType,
                'balance' => (int) $row->balance,
            ]);
    }

    /**
     * 特定の実包種別の現在残高を取得
     */
    public function getCurrentBalance(int $userId, int $ammunitionTypeId): int
    {
        return (int) TransactionEvent::query()
            ->where('user_id', $userId)
            ->where('ammunition_type_id', $ammunitionTypeId)
            ->sum('quantity');
    }

    /**
     * 指定日時点の残高を取得
     */
    public function getBalanceAtDate(
        int $userId,
        int $ammunitionTypeId,
        \DateTimeInterface $date,
    ): int {
        return (int) TransactionEvent::query()
            ->where('user_id', $userId)
            ->where('ammunition_type_id', $ammunitionTypeId)
            ->where('event_date', '<=', $date)
            ->sum('quantity');
    }
}
```

## Form Requests

入力バリデーションとビジネスルールの検証を担当。

### ディレクトリ構成

```
app/Http/Requests/
├── AmmunitionType/
│   ├── StoreAmmunitionTypeRequest.php
│   └── UpdateAmmunitionTypeRequest.php
├── Transaction/
│   ├── StoreTransactionEventRequest.php
│   └── StoreCorrectionRequest.php
└── Attachment/
    └── StoreAttachmentRequest.php
```

### 実装例

```php
<?php

namespace App\Http\Requests\Transaction;

use App\Models\TransactionEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'ammunition_type_id' => ['required', 'exists:ammunition_types,id'],
            'event_type' => ['required', Rule::in(TransactionEvent::EVENT_TYPES)],
            'quantity' => ['required', 'integer', 'min:1'],
            'event_date' => ['required', 'date', 'before_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];

        // イベント種別に応じた追加ルール
        return match ($this->input('event_type')) {
            'consumption' => [
                ...$rules,
                'location' => ['required', 'string', 'max:255'],
            ],
            'acquisition', 'transfer' => [
                ...$rules,
                'counterparty_name' => ['required', 'string', 'max:255'],
                'counterparty_address' => ['nullable', 'string', 'max:500'],
            ],
            'disposal' => [
                ...$rules,
                'disposal_method' => ['required', 'string', 'max:255'],
            ],
            default => $rules,
        };
    }

    public function messages(): array
    {
        return [
            'ammunition_type_id.required' => '実包種別を選択してください',
            'quantity.min' => '数量は1以上を入力してください',
            'event_date.before_or_equal' => '発生日は今日以前の日付を入力してください',
            'location.required' => '消費イベントでは使用場所が必須です',
            'counterparty_name.required' => '相手方氏名を入力してください',
            'disposal_method.required' => '廃棄方法を入力してください',
        ];
    }
}
```

## Observers

モデルイベントに対する副作用を処理。

### ディレクトリ構成

```
app/Observers/
├── TransactionEventObserver.php  # 削除禁止、監査ログ
└── AuditLogObserver.php          # 汎用監査ログ
```

### 実装例

```php
<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\TransactionEvent;
use Illuminate\Database\Eloquent\Model;

class TransactionEventObserver
{
    public function deleting(TransactionEvent $event): bool
    {
        // 削除を禁止
        throw new \DomainException(
            '出納イベントは削除できません。訂正イベントを作成してください。'
        );
    }

    public function created(TransactionEvent $event): void
    {
        $this->logAudit('create', $event);
    }

    public function updated(TransactionEvent $event): void
    {
        $this->logAudit('update', $event);
    }

    private function logAudit(string $action, Model $model): void
    {
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'old_values' => $action === 'update' ? $model->getOriginal() : null,
            'new_values' => $model->getAttributes(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
```

## Repository Pattern の適用範囲

### 採用しない理由

- Eloquentの抽象化で十分
- Laravelエコシステムとの親和性を維持
- 過度な抽象化による複雑性増加を避ける

### 例外的に採用するケース

複雑なクエリをカプセル化したい場合は、Query Builderパターンを使用：

```php
<?php

namespace App\Queries;

use App\Models\TransactionEvent;
use Illuminate\Database\Eloquent\Builder;

class TransactionEventQuery
{
    public function __construct(
        private Builder $query,
    ) {
        $this->query = TransactionEvent::query();
    }

    public static function make(): self
    {
        return new self(TransactionEvent::query());
    }

    public function forUser(int $userId): self
    {
        $this->query->where('user_id', $userId);
        return $this;
    }

    public function ofType(string $type): self
    {
        $this->query->where('event_type', $type);
        return $this;
    }

    public function inDateRange(\DateTimeInterface $from, \DateTimeInterface $to): self
    {
        $this->query->whereBetween('event_date', [$from, $to]);
        return $this;
    }

    public function withRelations(): self
    {
        $this->query->with(['ammunitionType', 'attachments']);
        return $this;
    }

    public function getQuery(): Builder
    {
        return $this->query;
    }
}
```

## 依存性注入

### ServiceProvider での登録

```php
<?php

namespace App\Providers;

use App\Services\BalanceService;
use App\Services\TransactionHashService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // シングルトンとして登録（状態を持たないサービス）
        $this->app->singleton(BalanceService::class);
        $this->app->singleton(TransactionHashService::class);
    }
}
```

## まとめ

| 概念 | Laravelでの実現 |
|------|-----------------|
| UseCase | Action Classes |
| Entity | Eloquent Model |
| Value Object | 必要に応じてDTOクラス |
| Repository | Eloquent（直接使用） |
| Domain Service | Service Classes |
| Application Service | Action Classes |
| Presenter | Inertia.js Response |
