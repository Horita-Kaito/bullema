# Bullema - 実包管理システム

## プロジェクト概要

日本国内の銃所持許可者向けの実包（弾丸）管理システム。
出納履歴・残高・証憑を一元管理し、警察検査に耐える状態を継続的に維持する。

## 技術スタック

- **Backend**: Laravel 11
- **Frontend**: React 18 + TypeScript
- **SPA連携**: Inertia.js
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: MySQL 8.0

## アーキテクチャ

Laravelの利点を活かしつつ、適度なレイヤー分離を行うクリーンアーキテクチャを採用。

### ディレクトリ構成（Backend）

```
app/
├── Http/Controllers/    # コントローラー（薄く保つ）
├── Http/Requests/       # バリデーション
├── Models/              # Eloquentモデル
├── UseCases/            # ユースケース/アクション
├── Services/            # ドメインサービス
├── Queries/             # 複雑なクエリ
└── Observers/           # モデルイベント
```

### ディレクトリ構成（Frontend）

```
resources/js/
├── components/
│   ├── ui/              # shadcn/ui（Radix UI）
│   ├── layouts/         # レイアウト
│   └── shared/          # 共有コンポーネント
├── features/            # 機能モジュール
│   ├── ammunition-types/
│   ├── transactions/
│   ├── balances/
│   └── ...
└── pages/               # Inertia.jsページ
```

## 主要機能

1. **実包マスタ管理** - 実包種別の登録・管理
2. **出納イベント管理** - 譲受・消費・譲渡・廃棄等の記録
3. **残高管理** - リアルタイム残高算出
4. **証憑管理** - 領収書等の添付ファイル管理
5. **帳簿出力** - PDF/CSV形式での帳簿出力
6. **検査モード** - 警察検査対応の閲覧専用UI
7. **監査・改ざん防止** - ハッシュチェーン、操作ログ

## コーディング規約

### PHP/Laravel

- PSR-12準拠
- 厳密な型宣言を使用（`declare(strict_types=1)`）
- Actionクラスは `execute()` メソッドを持つ
- Form Requestでバリデーション
- Eloquentのリレーションは明示的に定義

### TypeScript/React

- 関数コンポーネントを使用
- Props型は明示的に定義
- shadcn/uiコンポーネントを積極的に活用
- 機能ごとにディレクトリを分割

## 重要な設計判断

### 改ざん防止

- 出納イベントは物理削除禁止
- 修正は「訂正イベント」として追加
- ハッシュチェーンでデータ整合性を保証

### 検査モード

- 閲覧専用UI
- 編集操作は一切不可
- 印刷最適化

## ドキュメント

詳細な設計ドキュメントは `docs/` を参照：

- `docs/architecture/` - アーキテクチャ設計
- `docs/database/` - データベース設計
- `docs/api/` - API/ルート設計
- `docs/frontend/` - フロントエンド設計
- `docs/phases/` - 実装フェーズ計画

## 開発コマンド

```bash
# 開発サーバー起動
composer run dev

# フロントエンドビルド
npm run dev

# テスト実行
php artisan test

# マイグレーション
php artisan migrate

# シーダー実行
php artisan db:seed
```
