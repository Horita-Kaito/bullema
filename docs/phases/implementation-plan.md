# 実装フェーズ計画

## 概要

本ドキュメントでは、実包管理システム（Bullema）の実装を段階的に進めるためのフェーズ分割を定義する。

## フェーズ一覧

| フェーズ | 内容 | 依存 |
|----------|------|------|
| 1 | プロジェクト基盤構築 | - |
| 2 | 認証機能 | 1 |
| 3 | 実包マスタ管理 | 2 |
| 4 | 出納イベント管理（基本） | 3 |
| 5 | 残高管理 | 4 |
| 6 | 証憑管理 | 4 |
| 7 | 訂正イベント・監査ログ | 4 |
| 8 | 帳簿出力 | 4, 5 |
| 9 | 検査モード | 5, 6, 8 |
| 10 | テスト・品質保証 | 全て |

---

## フェーズ1: プロジェクト基盤構築

### 目標
開発環境とプロジェクトの基本構造を整備する。

### タスク

1. **Laravelプロジェクト作成**
   ```bash
   composer create-project laravel/laravel . --prefer-dist
   ```

2. **Inertia.js + React + TypeScript セットアップ**
   ```bash
   composer require inertiajs/inertia-laravel
   npm install @inertiajs/react react react-dom
   npm install -D typescript @types/react @types/react-dom
   ```

3. **shadcn/ui + Tailwind CSS セットアップ**
   ```bash
   npx shadcn@latest init
   ```

4. **ディレクトリ構成の作成**
   - `app/UseCases/`
   - `app/Services/`
   - `app/Queries/`
   - `resources/js/features/`
   - `resources/js/components/`

5. **共通コンポーネントの準備**
   - AppLayout
   - 基本的なshadcn/uiコンポーネントのインストール

6. **設定ファイルの整備**
   - `tsconfig.json` パスエイリアス
   - `vite.config.js`
   - `.env` データベース設定

### 成果物
- 動作するLaravel + Inertia.js + Reactの雛形
- 開発サーバーが起動できる状態

---

## フェーズ2: 認証機能

### 目標
ユーザー認証（ログイン/ログアウト）を実装する。

### タスク

1. **usersテーブルのマイグレーション確認**
   - Laravel標準のマイグレーションを使用

2. **認証コントローラー作成**
   - `AuthController`（create, store, destroy）

3. **ログインページ作成**
   - `pages/auth/login.tsx`
   - AuthLayout

4. **認証ミドルウェアの設定**
   - `auth` ミドルウェアの適用

5. **ユーザーシーダー作成**
   - 開発用テストユーザー

### 成果物
- ログイン/ログアウトが動作
- 認証必須のルート保護

---

## フェーズ3: 実包マスタ管理

### 目標
実包種別のCRUD機能を実装する。

### タスク

1. **ammunition_typesテーブルのマイグレーション**
   ```php
   Schema::create('ammunition_types', function (Blueprint $table) {
       $table->id();
       $table->foreignId('user_id')->constrained()->restrictOnDelete();
       $table->string('category', 100);
       $table->string('caliber', 100);
       $table->string('manufacturer', 255)->nullable();
       $table->text('notes')->nullable();
       $table->boolean('is_active')->default(true);
       $table->timestamps();

       $table->index('user_id');
       $table->index('is_active');
   });
   ```

2. **AmmunitionTypeモデル作成**
   - リレーション定義
   - スコープ（active）

3. **UseCases作成**
   - `CreateAmmunitionTypeAction`
   - `UpdateAmmunitionTypeAction`
   - `ListAmmunitionTypesAction`

4. **FormRequest作成**
   - `StoreAmmunitionTypeRequest`
   - `UpdateAmmunitionTypeRequest`

5. **コントローラー作成**
   - `AmmunitionTypeController`

6. **フロントエンド作成**
   - `features/ammunition-types/components/`
   - `pages/ammunition-types/`

### 成果物
- 実包マスタの一覧・登録・編集・無効化が動作

---

## フェーズ4: 出納イベント管理（基本）

### 目標
出納イベントの登録・一覧・詳細表示を実装する。
ハッシュチェーンによる改ざん防止を含む。

### タスク

1. **transaction_eventsテーブルのマイグレーション**
   - 全カラムの定義
   - インデックス作成

2. **TransactionEventモデル作成**
   - 定数定義（EVENT_TYPES）
   - リレーション
   - 削除禁止のObserver登録

3. **TransactionHashService作成**
   - `calculateHash()`
   - `getPreviousHash()`
   - `verifyChain()`

4. **UseCases作成**
   - `CreateTransactionAction`
   - `ListTransactionsAction`
   - `GetTransactionAction`

5. **FormRequest作成**
   - `StoreTransactionEventRequest`（イベント種別による動的バリデーション）

6. **コントローラー作成**
   - `TransactionEventController`

7. **フロントエンド作成**
   - `features/transactions/components/`
   - `pages/transactions/`
   - イベント種別による動的フォーム

### 成果物
- 全イベント種別の登録が動作
- イベント一覧・詳細が表示される
- ハッシュチェーンが正しく生成される

---

## フェーズ5: 残高管理

### 目標
残高の計算・表示機能を実装する。

### タスク

1. **BalanceService作成**
   - `getAllCurrentBalances()`
   - `getCurrentBalance()`
   - `getBalanceAtDate()`

2. **UseCases作成**
   - `GetCurrentBalancesAction`
   - `GetBalanceHistoryAction`

3. **コントローラー作成**
   - `BalanceController`

4. **フロントエンド作成**
   - `features/balances/components/`
   - `pages/balances/`

5. **ダッシュボード更新**
   - 残高サマリーの表示

### 成果物
- 現在残高が正しく表示される
- 任意時点の残高が照会できる

---

## フェーズ6: 証憑管理

### 目標
ファイルアップロード・プレビュー機能を実装する。

### タスク

1. **attachmentsテーブルのマイグレーション**

2. **Attachmentモデル作成**

3. **ファイルストレージ設定**
   - `storage/app/attachments/`
   - ディスク設定

4. **UseCases作成**
   - `UploadAttachmentAction`
   - `DownloadAttachmentAction`

5. **コントローラー作成**
   - `AttachmentController`

6. **フロントエンド更新**
   - `FileUploader` コンポーネント
   - `AttachmentViewer` コンポーネント
   - 出納イベント登録フォームへの統合

### 成果物
- 画像/PDFのアップロードが動作
- プレビュー・ダウンロードが動作

---

## フェーズ7: 訂正イベント・監査ログ

### 目標
訂正機能と監査ログを実装する。

### タスク

1. **audit_logsテーブルのマイグレーション**

2. **AuditLogモデル作成**

3. **AuditableObserver作成**
   - created/updated/readのログ記録

4. **TransactionEventObserver更新**
   - 削除禁止の実装

5. **CorrectionService作成**
   - `createCorrection()`

6. **UseCases作成**
   - `CreateCorrectionAction`

7. **コントローラー更新**
   - 訂正イベント作成エンドポイント

8. **フロントエンド作成**
   - `pages/transactions/correct.tsx`
   - `pages/audit-logs/index.tsx`

9. **整合性チェック機能**
   - `IntegrityCheckService`
   - `IntegrityController`

### 成果物
- 訂正イベントが正しく作成される
- 監査ログが記録される
- ハッシュチェーンの検証が動作

---

## フェーズ8: 帳簿出力

### 目標
PDF/CSV形式での帳簿出力を実装する。

### タスク

1. **PDF生成ライブラリ導入**
   ```bash
   composer require barryvdh/laravel-dompdf
   ```

2. **ReportGeneratorService作成**
   - `generatePdf()`
   - `generateCsv()`

3. **PDFテンプレート作成**
   - `resources/views/reports/ledger.blade.php`

4. **UseCases作成**
   - `GeneratePdfReportAction`
   - `GenerateCsvReportAction`

5. **コントローラー作成**
   - `ReportController`

6. **フロントエンド作成**
   - `pages/reports/index.tsx`
   - フィルタUI

### 成果物
- PDF帳簿が正しく出力される
- CSVエクスポートが動作

---

## フェーズ9: 検査モード

### 目標
警察検査対応の閲覧専用UIを実装する。

### タスク

1. **InspectionLayout作成**
   - シンプルなヘッダー
   - タブナビゲーション
   - 印刷ボタン

2. **InspectionController作成**
   - index, balance, ledger, attachments

3. **印刷用CSS作成**
   - `@media print` スタイル

4. **フロントエンド作成**
   - `pages/inspection/`
   - `features/inspection/components/`

5. **パフォーマンス最適化**
   - 必要なデータのみロード
   - Eager Loading

### 成果物
- 検査モードで残高・帳簿・証憑が即座に表示される
- 印刷時に適切にフォーマットされる

---

## フェーズ10: テスト・品質保証

### 目標
テストを作成し、品質を保証する。

### タスク

1. **ユニットテスト作成**
   - `BalanceServiceTest`
   - `TransactionHashServiceTest`
   - `CorrectionServiceTest`

2. **フィーチャーテスト作成**
   - 認証テスト
   - 実包マスタCRUDテスト
   - 出納イベント作成テスト
   - 残高計算テスト
   - 証憑アップロードテスト

3. **E2Eテスト作成（任意）**
   - 主要フローのテスト

4. **セキュリティ確認**
   - CSRF保護
   - 認可チェック
   - ファイルアップロードのバリデーション

5. **パフォーマンス確認**
   - N+1クエリの解消
   - 検査モードの表示速度

### 成果物
- テストカバレッジ70%以上
- 主要機能のテストが通過

---

## 検証項目（Definition of Done）

各フェーズ完了時に以下を確認：

- [ ] 機能が要件通り動作する
- [ ] バリデーションが正しく機能する
- [ ] エラーハンドリングが適切
- [ ] 画面遷移が正しい
- [ ] レスポンシブ対応（PC/タブレット）
- [ ] コードレビュー完了

最終的に以下を達成：

- [ ] 帳簿と現物の整合性を説明できる
- [ ] 検査時に必要な情報を5分以内に提示できる
- [ ] 出納履歴が削除・改ざんできない
- [ ] 紙帳簿を使わず運用できる
