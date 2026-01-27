# ルート・API設計

## ルート一覧

### 認証

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| GET | /login | AuthController@create | login | ログイン画面 |
| POST | /login | AuthController@store | - | ログイン処理 |
| POST | /logout | AuthController@destroy | logout | ログアウト |

### ダッシュボード

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| GET | / | DashboardController@index | dashboard | ダッシュボード |

### 実包マスタ

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| GET | /ammunition-types | AmmunitionTypeController@index | ammunition-types.index | 一覧 |
| GET | /ammunition-types/create | AmmunitionTypeController@create | ammunition-types.create | 登録画面 |
| POST | /ammunition-types | AmmunitionTypeController@store | ammunition-types.store | 登録処理 |
| GET | /ammunition-types/{id}/edit | AmmunitionTypeController@edit | ammunition-types.edit | 編集画面 |
| PUT | /ammunition-types/{id} | AmmunitionTypeController@update | ammunition-types.update | 更新処理 |

※ DELETE は提供しない（削除不可）

### 出納イベント

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| GET | /transactions | TransactionEventController@index | transactions.index | 一覧 |
| GET | /transactions/create | TransactionEventController@create | transactions.create | 登録画面 |
| POST | /transactions | TransactionEventController@store | transactions.store | 登録処理 |
| GET | /transactions/{id} | TransactionEventController@show | transactions.show | 詳細 |
| GET | /transactions/{id}/correct | TransactionEventController@createCorrection | transactions.correct | 訂正画面 |
| POST | /transactions/{id}/correct | TransactionEventController@storeCorrection | transactions.correct.store | 訂正処理 |

※ PUT/DELETE は提供しない（編集・削除不可）

### 残高

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| GET | /balances | BalanceController@index | balances.index | 現在残高一覧 |
| GET | /balances/history | BalanceController@history | balances.history | 残高履歴 |

### 証憑

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| POST | /attachments | AttachmentController@store | attachments.store | アップロード |
| GET | /attachments/{id}/download | AttachmentController@download | attachments.download | ダウンロード |
| GET | /attachments/{id}/preview | AttachmentController@preview | attachments.preview | プレビュー |

### 帳簿出力

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| GET | /reports | ReportController@index | reports.index | 出力画面 |
| GET | /reports/pdf | ReportController@pdf | reports.pdf | PDF出力 |
| GET | /reports/csv | ReportController@csv | reports.csv | CSV出力 |

### 検査モード

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| GET | /inspection | InspectionController@index | inspection.index | 検査モードトップ |
| GET | /inspection/balance | InspectionController@balance | inspection.balance | 残高表示 |
| GET | /inspection/ledger | InspectionController@ledger | inspection.ledger | 帳簿表示 |
| GET | /inspection/attachments | InspectionController@attachments | inspection.attachments | 証憑一覧 |

### 監査・整合性

| メソッド | パス | コントローラー | 名前 | 説明 |
|----------|------|----------------|------|------|
| GET | /audit-logs | AuditLogController@index | audit-logs.index | 監査ログ一覧 |
| GET | /integrity-check | IntegrityController@check | integrity.check | 整合性チェック |

---

## ルート定義（routes/web.php）

```php
<?php

use App\Http\Controllers\AmmunitionTypeController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BalanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\IntegrityController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransactionEventController;
use Illuminate\Support\Facades\Route;

// 認証（ゲスト用）
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
});

// 認証必須
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    // ダッシュボード
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // 実包マスタ
    Route::prefix('ammunition-types')->name('ammunition-types.')->group(function () {
        Route::get('/', [AmmunitionTypeController::class, 'index'])->name('index');
        Route::get('/create', [AmmunitionTypeController::class, 'create'])->name('create');
        Route::post('/', [AmmunitionTypeController::class, 'store'])->name('store');
        Route::get('/{ammunitionType}/edit', [AmmunitionTypeController::class, 'edit'])->name('edit');
        Route::put('/{ammunitionType}', [AmmunitionTypeController::class, 'update'])->name('update');
    });

    // 出納イベント
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionEventController::class, 'index'])->name('index');
        Route::get('/create', [TransactionEventController::class, 'create'])->name('create');
        Route::post('/', [TransactionEventController::class, 'store'])->name('store');
        Route::get('/{transaction}', [TransactionEventController::class, 'show'])->name('show');
        Route::get('/{transaction}/correct', [TransactionEventController::class, 'createCorrection'])->name('correct');
        Route::post('/{transaction}/correct', [TransactionEventController::class, 'storeCorrection'])->name('correct.store');
    });

    // 残高
    Route::prefix('balances')->name('balances.')->group(function () {
        Route::get('/', [BalanceController::class, 'index'])->name('index');
        Route::get('/history', [BalanceController::class, 'history'])->name('history');
    });

    // 証憑
    Route::prefix('attachments')->name('attachments.')->group(function () {
        Route::post('/', [AttachmentController::class, 'store'])->name('store');
        Route::get('/{attachment}/download', [AttachmentController::class, 'download'])->name('download');
        Route::get('/{attachment}/preview', [AttachmentController::class, 'preview'])->name('preview');
    });

    // 帳簿出力
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/pdf', [ReportController::class, 'pdf'])->name('pdf');
        Route::get('/csv', [ReportController::class, 'csv'])->name('csv');
    });

    // 検査モード
    Route::prefix('inspection')->name('inspection.')->group(function () {
        Route::get('/', [InspectionController::class, 'index'])->name('index');
        Route::get('/balance', [InspectionController::class, 'balance'])->name('balance');
        Route::get('/ledger', [InspectionController::class, 'ledger'])->name('ledger');
        Route::get('/attachments', [InspectionController::class, 'attachments'])->name('attachments');
    });

    // 監査ログ
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // 整合性チェック
    Route::get('/integrity-check', [IntegrityController::class, 'check'])->name('integrity.check');
});
```

---

## Inertia.js レスポンス例

### 出納イベント一覧（TransactionEventController@index）

```php
public function index(Request $request, ListTransactionsAction $action): Response
{
    $filters = $request->only(['event_type', 'ammunition_type_id', 'date_from', 'date_to']);

    return Inertia::render('Transactions/Index', [
        'transactions' => $action->execute($request->user(), $filters),
        'ammunitionTypes' => AmmunitionType::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get(),
        'filters' => $filters,
    ]);
}
```

### フロントエンドでの受け取り

```tsx
// pages/transactions/index.tsx
interface Props {
  transactions: PaginatedResponse<Transaction>;
  ammunitionTypes: AmmunitionType[];
  filters: TransactionFilters;
}

export default function TransactionsIndex({ transactions, ammunitionTypes, filters }: Props) {
  // ...
}
```

---

## クエリパラメータ

### 出納イベント一覧のフィルタ

| パラメータ | 型 | 説明 |
|------------|-----|------|
| event_type | string | イベント種別（acquisition, consumption等） |
| ammunition_type_id | int | 実包種別ID |
| date_from | date | 開始日（YYYY-MM-DD） |
| date_to | date | 終了日（YYYY-MM-DD） |
| page | int | ページ番号 |
| per_page | int | 1ページあたり件数（デフォルト: 20） |

### 帳簿出力のパラメータ

| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| date_from | date | YES | 開始日 |
| date_to | date | YES | 終了日 |
| ammunition_type_id | int | NO | 実包種別ID（全種別の場合は省略） |
| format | string | YES | 出力形式（pdf / csv） |
