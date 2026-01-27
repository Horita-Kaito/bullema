# 実包管理システム（Bullema）設計ドキュメント

## 概要

日本国内の銃所持許可者向けの実包（弾丸）管理システム。
出納履歴・残高・証憑を一元管理し、警察検査に耐える状態を継続的に維持する。

## ドキュメント構成

```
docs/
├── README.md                        # 本ファイル
├── architecture/
│   ├── overview.md                  # アーキテクチャ概要
│   ├── clean-architecture.md        # クリーンアーキテクチャ設計
│   └── directory-structure.md       # ディレクトリ構成
├── database/
│   ├── er-diagram.md                # ER図
│   └── tables.md                    # テーブル定義
├── api/
│   └── routes.md                    # ルート・API設計
├── frontend/
│   ├── components.md                # コンポーネント設計
│   └── pages.md                     # ページ一覧
└── phases/
    └── implementation-plan.md       # 実装フェーズ計画
```

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| Backend | Laravel 11 |
| Frontend | React 18 + TypeScript |
| SPA連携 | Inertia.js |
| UI | shadcn/ui + Tailwind CSS |
| DB | MySQL 8.0 |

## 主要機能

1. **実包マスタ管理** - 実包種別の登録・管理
2. **出納イベント管理** - 譲受・消費・譲渡・廃棄等の記録
3. **残高管理** - リアルタイム残高算出
4. **証憑管理** - 領収書等の添付ファイル管理
5. **帳簿出力** - PDF/CSV形式での帳簿出力
6. **検査モード** - 警察検査対応の閲覧専用UI
7. **監査・改ざん防止** - ハッシュチェーン、操作ログ

## クイックリンク

- [アーキテクチャ概要](./architecture/overview.md)
- [データベース設計](./database/er-diagram.md)
- [実装計画](./phases/implementation-plan.md)
