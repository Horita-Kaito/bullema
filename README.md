# Bullema - 実包管理システム

日本国内の銃所持許可者向けの実包（弾丸）管理システム。
出納履歴・残高・証憑を一元管理し、警察検査に耐える状態を継続的に維持します。

## 主な機能

- **実包マスタ管理** - 実包種別の登録・管理
- **出納イベント管理** - 譲受・消費・譲渡・廃棄等の記録（ハッシュチェーンで改ざん防止）
- **残高管理** - リアルタイム残高算出
- **証憑管理** - 領収書等の添付ファイル管理
- **帳簿出力** - PDF/CSV形式での帳簿出力
- **検査モード** - 警察検査対応の閲覧専用UI
- **監査ログ** - 全操作の記録

## 技術スタック

- **Backend**: Laravel 11 / PHP 8.4
- **Frontend**: React 18 + TypeScript
- **SPA連携**: Inertia.js
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: MySQL 8.4
- **Container**: Docker

## 開発環境セットアップ

### 必要なもの

- PHP 8.4+
- Composer
- Node.js 20+
- Docker Desktop

### セットアップ手順

```bash
# リポジトリをクローン
git clone git@github.com:Horita-Kaito/bullema.git
cd bullema

# 依存関係インストール
composer install
npm install

# 環境設定
cp .env.example .env
php artisan key:generate

# .env を編集してMySQL設定を有効化
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=bullema
# DB_USERNAME=bullema
# DB_PASSWORD=password

# MySQL起動
docker compose up -d

# マイグレーション
php artisan migrate

# テストユーザー作成
php artisan db:seed

# 開発サーバー起動
composer run dev
```

### ログイン情報（開発用）

- **メール**: test@example.com
- **パスワード**: password

### 開発サーバー

- **アプリ**: http://localhost:8000
- **Vite**: http://localhost:5173

## テスト実行

```bash
php artisan test
```

## 本番デプロイ

`main`ブランチへのpushで自動デプロイされます（GitHub Actions）。

詳細は [デプロイスキル](.claude/skills/sakura-private-projects/deploy/bullema/SKILL.md) を参照。

## ディレクトリ構成

```
app/
├── Http/Controllers/    # コントローラー
├── Http/Requests/       # バリデーション
├── Models/              # Eloquentモデル
├── UseCases/            # ユースケース/アクション
├── Services/            # ドメインサービス
└── Observers/           # モデルイベント

resources/js/
├── components/
│   ├── ui/              # shadcn/ui
│   ├── layouts/         # レイアウト
│   └── shared/          # 共有コンポーネント
├── features/            # 機能モジュール
└── pages/               # Inertia.jsページ
```

## ドキュメント

詳細設計は `docs/` を参照：

- `docs/architecture/` - アーキテクチャ設計
- `docs/database/` - データベース設計
- `docs/api/` - API/ルート設計
- `docs/frontend/` - フロントエンド設計

## ライセンス

Private
