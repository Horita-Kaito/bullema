# ディレクトリ構成

## バックエンド（Laravel）

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   └── AuthController.php
│   │   ├── AmmunitionTypeController.php
│   │   ├── AttachmentController.php
│   │   ├── AuditLogController.php
│   │   ├── BalanceController.php
│   │   ├── DashboardController.php
│   │   ├── InspectionController.php
│   │   ├── IntegrityController.php
│   │   ├── ReportController.php
│   │   └── TransactionEventController.php
│   ├── Middleware/
│   │   └── LogActivity.php
│   └── Requests/
│       ├── AmmunitionType/
│       │   ├── StoreAmmunitionTypeRequest.php
│       │   └── UpdateAmmunitionTypeRequest.php
│       ├── Transaction/
│       │   ├── StoreTransactionEventRequest.php
│       │   └── StoreCorrectionRequest.php
│       └── Attachment/
│           └── StoreAttachmentRequest.php
│
├── Models/
│   ├── AmmunitionType.php
│   ├── Attachment.php
│   ├── AuditLog.php
│   ├── TransactionEvent.php
│   └── User.php
│
├── UseCases/                        # ユースケース層
│   ├── AmmunitionType/
│   │   ├── CreateAmmunitionTypeAction.php
│   │   ├── UpdateAmmunitionTypeAction.php
│   │   └── ListAmmunitionTypesAction.php
│   ├── Transaction/
│   │   ├── CreateTransactionAction.php
│   │   ├── CreateCorrectionAction.php
│   │   ├── ListTransactionsAction.php
│   │   └── GetTransactionAction.php
│   ├── Balance/
│   │   ├── GetCurrentBalancesAction.php
│   │   └── GetBalanceHistoryAction.php
│   ├── Attachment/
│   │   ├── UploadAttachmentAction.php
│   │   └── DownloadAttachmentAction.php
│   └── Report/
│       ├── GeneratePdfReportAction.php
│       └── GenerateCsvReportAction.php
│
├── Services/                        # ドメインサービス
│   ├── BalanceService.php
│   ├── TransactionHashService.php
│   ├── IntegrityCheckService.php
│   └── ReportGeneratorService.php
│
├── Queries/                         # 複雑なクエリ
│   └── TransactionEventQuery.php
│
├── Observers/
│   ├── TransactionEventObserver.php
│   └── AuditLogObserver.php
│
├── Policies/
│   └── AuditLogPolicy.php
│
├── Providers/
│   ├── AppServiceProvider.php
│   └── AuthServiceProvider.php
│
└── Exceptions/
    └── DomainException.php

database/
├── factories/
│   ├── AmmunitionTypeFactory.php
│   ├── TransactionEventFactory.php
│   ├── AttachmentFactory.php
│   └── UserFactory.php
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 2025_01_01_000001_create_ammunition_types_table.php
│   ├── 2025_01_01_000002_create_transaction_events_table.php
│   ├── 2025_01_01_000003_create_attachments_table.php
│   └── 2025_01_01_000004_create_audit_logs_table.php
└── seeders/
    ├── DatabaseSeeder.php
    └── TestDataSeeder.php

routes/
└── web.php

storage/
└── app/
    └── attachments/                 # 証憑ファイル保存先

tests/
├── Feature/
│   ├── AmmunitionType/
│   │   └── AmmunitionTypeCrudTest.php
│   ├── Transaction/
│   │   ├── CreateTransactionTest.php
│   │   ├── CorrectionTest.php
│   │   └── ListTransactionsTest.php
│   ├── Balance/
│   │   └── BalanceCalculationTest.php
│   ├── Attachment/
│   │   └── AttachmentUploadTest.php
│   └── Inspection/
│       └── InspectionModeTest.php
└── Unit/
    ├── Services/
    │   ├── BalanceServiceTest.php
    │   └── TransactionHashServiceTest.php
    └── UseCases/
        └── Transaction/
            └── CreateTransactionActionTest.php
```

## フロントエンド（React + TypeScript）

機能ベース（Feature-based）のディレクトリ構成を採用。
shadcn/ui（Radix UI）のコンポーネントは `components/ui/` に配置。

```
resources/js/
├── app.tsx                          # エントリーポイント
├── ssr.tsx                          # SSR用（必要に応じて）
│
├── types/                           # 型定義
│   ├── index.d.ts                   # グローバル型
│   ├── inertia.d.ts                 # Inertia型拡張
│   ├── models.ts                    # モデル型（自動生成推奨）
│   └── api.ts                       # APIレスポンス型
│
├── lib/                             # ユーティリティ
│   ├── utils.ts                     # 汎用ユーティリティ（cn関数等）
│   └── constants.ts                 # 定数定義
│
├── hooks/                           # カスタムフック
│   ├── use-balance.ts
│   ├── use-transactions.ts
│   ├── use-filters.ts
│   └── use-media-query.ts
│
├── components/
│   │
│   ├── ui/                          # shadcn/ui コンポーネント
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layouts/                     # レイアウトコンポーネント
│   │   ├── app-layout.tsx           # メインレイアウト
│   │   ├── auth-layout.tsx          # 認証用レイアウト
│   │   ├── inspection-layout.tsx    # 検査モード用レイアウト
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   │
│   └── shared/                      # 共有コンポーネント
│       ├── data-table/
│       │   ├── data-table.tsx
│       │   ├── data-table-pagination.tsx
│       │   ├── data-table-toolbar.tsx
│       │   └── data-table-column-header.tsx
│       ├── date-range-picker.tsx
│       ├── file-uploader.tsx
│       ├── file-preview.tsx
│       ├── confirm-dialog.tsx
│       ├── loading-spinner.tsx
│       └── empty-state.tsx
│
├── features/                        # 機能モジュール
│   │
│   ├── ammunition-types/            # 実包マスタ機能
│   │   ├── components/
│   │   │   ├── ammunition-type-form.tsx
│   │   │   ├── ammunition-type-table.tsx
│   │   │   └── ammunition-type-select.tsx
│   │   ├── hooks/
│   │   │   └── use-ammunition-types.ts
│   │   └── types.ts
│   │
│   ├── transactions/                # 出納イベント機能
│   │   ├── components/
│   │   │   ├── transaction-form/
│   │   │   │   ├── transaction-form.tsx
│   │   │   │   ├── acquisition-fields.tsx
│   │   │   │   ├── consumption-fields.tsx
│   │   │   │   ├── transfer-fields.tsx
│   │   │   │   ├── disposal-fields.tsx
│   │   │   │   └── correction-fields.tsx
│   │   │   ├── transaction-table.tsx
│   │   │   ├── transaction-detail.tsx
│   │   │   ├── transaction-filters.tsx
│   │   │   └── event-type-badge.tsx
│   │   ├── hooks/
│   │   │   └── use-transaction-form.ts
│   │   └── types.ts
│   │
│   ├── balances/                    # 残高機能
│   │   ├── components/
│   │   │   ├── balance-summary-card.tsx
│   │   │   ├── balance-table.tsx
│   │   │   └── balance-history-chart.tsx
│   │   └── types.ts
│   │
│   ├── attachments/                 # 証憑機能
│   │   ├── components/
│   │   │   ├── attachment-list.tsx
│   │   │   ├── attachment-upload.tsx
│   │   │   └── attachment-viewer.tsx
│   │   └── types.ts
│   │
│   ├── reports/                     # 帳簿出力機能
│   │   ├── components/
│   │   │   ├── report-filters.tsx
│   │   │   └── report-preview.tsx
│   │   └── types.ts
│   │
│   ├── inspection/                  # 検査モード機能
│   │   ├── components/
│   │   │   ├── inspection-dashboard.tsx
│   │   │   ├── inspection-balance.tsx
│   │   │   ├── inspection-ledger.tsx
│   │   │   └── inspection-nav.tsx
│   │   └── types.ts
│   │
│   └── audit-logs/                  # 監査ログ機能
│       ├── components/
│       │   └── audit-log-table.tsx
│       └── types.ts
│
└── pages/                           # Inertia.js ページ
    ├── auth/
    │   └── login.tsx
    ├── dashboard.tsx
    ├── ammunition-types/
    │   ├── index.tsx
    │   ├── create.tsx
    │   └── edit.tsx
    ├── transactions/
    │   ├── index.tsx
    │   ├── create.tsx
    │   ├── show.tsx
    │   └── correct.tsx
    ├── balances/
    │   ├── index.tsx
    │   └── history.tsx
    ├── reports/
    │   └── index.tsx
    ├── inspection/
    │   ├── index.tsx
    │   ├── balance.tsx
    │   ├── ledger.tsx
    │   └── attachments.tsx
    └── audit-logs/
        └── index.tsx
```

## 設計指針

### フロントエンドの構成ルール

1. **`components/ui/`**: shadcn/uiコンポーネントのみ配置。カスタマイズは最小限に
2. **`components/shared/`**: 複数の機能で共有するコンポーネント
3. **`features/`**: 機能単位でコンポーネント・フック・型をグループ化
4. **`pages/`**: Inertia.jsのページコンポーネント。ロジックは最小限に

### コンポーネントの命名規則

```
機能名-役割.tsx

例：
- ammunition-type-form.tsx    # フォーム
- ammunition-type-table.tsx   # テーブル表示
- transaction-detail.tsx      # 詳細表示
- balance-summary-card.tsx    # サマリーカード
- event-type-badge.tsx        # バッジ表示
```

### インポートパス

```typescript
// 相対パスではなくエイリアスを使用
import { Button } from '@/components/ui/button';
import { TransactionForm } from '@/features/transactions/components/transaction-form';
import { useBalance } from '@/hooks/use-balance';
```

### tsconfig.json パス設定

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["resources/js/*"]
    }
  }
}
```
