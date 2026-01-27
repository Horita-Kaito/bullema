# アーキテクチャ概要

## 設計思想

本システムは以下の方針で設計する：

1. **Laravelの利点を活かす** - Eloquent、Validation、認証等のLaravel標準機能を最大限活用
2. **適度なレイヤー分離** - ビジネスロジックをControllerから分離し、テスト容易性を確保
3. **過度な抽象化を避ける** - Repository Pattern等は必要な箇所のみ適用

## レイヤー構成

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Controllers   │  │   Inertia.js + React Pages  │  │
│  └────────┬────────┘  └─────────────────────────────┘  │
│           │                                              │
├───────────┼──────────────────────────────────────────────┤
│           ▼            Application Layer                 │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   UseCases /    │  │      Form Requests          │  │
│  │   Actions       │  │      (Validation)           │  │
│  └────────┬────────┘  └─────────────────────────────┘  │
│           │                                              │
├───────────┼──────────────────────────────────────────────┤
│           ▼            Domain Layer                      │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │     Models      │  │    Domain Services          │  │
│  │   (Eloquent)    │  │    (BalanceService等)       │  │
│  └────────┬────────┘  └─────────────────────────────┘  │
│           │                                              │
├───────────┼──────────────────────────────────────────────┤
│           ▼         Infrastructure Layer                 │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │    Database     │  │    File Storage             │  │
│  │    (MySQL)      │  │    (Local/S3)               │  │
│  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 各レイヤーの責務

### Presentation Layer
- HTTPリクエストの受付・レスポンス返却
- Inertia.jsによるページレンダリング
- 認証・認可のゲートウェイ

### Application Layer
- ユースケースの実行（UseCases/Actions）
- 入力バリデーション（Form Requests）
- トランザクション制御

### Domain Layer
- ビジネスロジック（Domain Services）
- データモデル（Eloquent Models）
- ドメインルール・制約

### Infrastructure Layer
- データ永続化（MySQL）
- ファイルストレージ
- 外部サービス連携（将来）

## 依存関係の方向

```
Presentation → Application → Domain ← Infrastructure
```

- 上位レイヤーは下位レイヤーに依存
- Domain層は他のレイヤーに依存しない
- Infrastructure層はDomain層のインターフェースに依存（DIP）

## Laravel標準機能の活用

| 機能 | 採用 | 理由 |
|------|------|------|
| Eloquent ORM | ✅ | 生産性とLaravelエコシステムとの親和性 |
| Form Request | ✅ | バリデーションの一元管理 |
| Policy | ✅ | 認可ロジックの分離 |
| Observer | ✅ | モデルイベントのフック |
| Service Container | ✅ | 依存性注入 |
| Facade | △ | テスト時は注入を優先 |

## 詳細設計

- [クリーンアーキテクチャ詳細](./clean-architecture.md)
- [ディレクトリ構成](./directory-structure.md)
