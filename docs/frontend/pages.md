# ページ一覧

## ページ構成

Inertia.jsの規約に従い、`resources/js/pages/` にページコンポーネントを配置。

```
pages/
├── auth/
│   └── login.tsx              # ログイン
├── dashboard.tsx              # ダッシュボード
├── ammunition-types/
│   ├── index.tsx              # 実包マスタ一覧
│   ├── create.tsx             # 実包マスタ登録
│   └── edit.tsx               # 実包マスタ編集
├── transactions/
│   ├── index.tsx              # 出納イベント一覧
│   ├── create.tsx             # 出納イベント登録
│   ├── show.tsx               # 出納イベント詳細
│   └── correct.tsx            # 訂正イベント登録
├── balances/
│   ├── index.tsx              # 現在残高一覧
│   └── history.tsx            # 残高履歴
├── reports/
│   └── index.tsx              # 帳簿出力
├── inspection/
│   ├── index.tsx              # 検査モードトップ
│   ├── balance.tsx            # 残高表示（検査用）
│   ├── ledger.tsx             # 帳簿表示（検査用）
│   └── attachments.tsx        # 証憑一覧（検査用）
└── audit-logs/
    └── index.tsx              # 監査ログ一覧
```

---

## 各ページの仕様

### ログイン（auth/login.tsx）

**パス**: `/login`
**レイアウト**: AuthLayout

| 要素 | 説明 |
|------|------|
| メールアドレス入力 | 必須 |
| パスワード入力 | 必須 |
| ログインボタン | フォーム送信 |
| エラー表示 | バリデーション・認証エラー |

```tsx
// pages/auth/login.tsx
import { useForm } from '@inertiajs/react';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              ログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
```

---

### ダッシュボード（dashboard.tsx）

**パス**: `/`
**レイアウト**: AppLayout

| セクション | 内容 |
|------------|------|
| 残高サマリー | 実包種別ごとの現在残高をカード表示 |
| 最近のイベント | 直近10件の出納イベント |
| クイックアクション | 出納登録、検査モードへのリンク |

**Props**:
```typescript
interface Props {
  balances: Balance[];
  recentTransactions: TransactionEvent[];
}
```

---

### 実包マスタ一覧（ammunition-types/index.tsx）

**パス**: `/ammunition-types`
**レイアウト**: AppLayout

| 機能 | 説明 |
|------|------|
| テーブル表示 | 種別、番径・口径、メーカー、状態 |
| 新規登録ボタン | 登録画面へ遷移 |
| 編集ボタン | 編集画面へ遷移 |
| 無効化ボタン | is_activeをfalseに（削除の代わり） |

**Props**:
```typescript
interface Props {
  ammunitionTypes: PaginatedResponse<AmmunitionType>;
}
```

---

### 実包マスタ登録（ammunition-types/create.tsx）

**パス**: `/ammunition-types/create`
**レイアウト**: AppLayout

| フィールド | 必須 | 説明 |
|------------|------|------|
| 種別 | ○ | 散弾、ライフル弾等 |
| 番径・口径 | ○ | 12番、.308等 |
| メーカー | - | 任意 |
| 備考 | - | 任意 |

---

### 出納イベント一覧（transactions/index.tsx）

**パス**: `/transactions`
**レイアウト**: AppLayout

| 機能 | 説明 |
|------|------|
| テーブル表示 | 日付、種別、実包、数量、備考 |
| フィルタ | 期間、イベント種別、実包種別 |
| ページネーション | 20件/ページ |
| 新規登録ボタン | 登録画面へ遷移 |
| 行クリック | 詳細画面へ遷移 |

**Props**:
```typescript
interface Props {
  transactions: PaginatedResponse<TransactionEvent>;
  ammunitionTypes: AmmunitionType[];
  filters: {
    event_type?: string;
    ammunition_type_id?: number;
    date_from?: string;
    date_to?: string;
  };
}
```

---

### 出納イベント登録（transactions/create.tsx）

**パス**: `/transactions/create`
**レイアウト**: AppLayout

| フィールド | 必須 | 説明 |
|------------|------|------|
| 実包種別 | ○ | セレクト |
| イベント種別 | ○ | セレクト（選択により追加フィールド表示） |
| 数量 | ○ | 正の整数 |
| 発生日 | ○ | 日付ピッカー |
| 備考 | - | テキストエリア |
| 証憑 | - | ファイルアップロード（複数可） |

**イベント種別による追加フィールド**:

| 種別 | 追加フィールド |
|------|----------------|
| 消費 | 使用場所 |
| 譲受 | 相手方氏名、住所、許可証番号 |
| 譲渡 | 相手方氏名、住所、許可証番号 |
| 廃棄 | 廃棄方法 |

**Props**:
```typescript
interface Props {
  ammunitionTypes: AmmunitionType[];
}
```

---

### 出納イベント詳細（transactions/show.tsx）

**パス**: `/transactions/{id}`
**レイアウト**: AppLayout

| セクション | 内容 |
|------------|------|
| 基本情報 | 日付、種別、実包、数量 |
| 詳細情報 | 種別固有の項目（使用場所、相手方等） |
| 証憑一覧 | サムネイル表示、クリックでプレビュー |
| 訂正履歴 | このイベントに対する訂正イベント |
| 訂正ボタン | 訂正イベント作成画面へ |

**Props**:
```typescript
interface Props {
  transaction: TransactionEvent & {
    attachments: Attachment[];
    corrections: TransactionEvent[];
  };
}
```

---

### 訂正イベント登録（transactions/correct.tsx）

**パス**: `/transactions/{id}/correct`
**レイアウト**: AppLayout

| フィールド | 必須 | 説明 |
|------------|------|------|
| 元イベント情報 | - | 表示のみ |
| 訂正後の数量 | ○ | 正しい数量を入力 |
| 訂正理由 | ○ | テキストエリア |
| 証憑 | - | ファイルアップロード |

**Props**:
```typescript
interface Props {
  originalTransaction: TransactionEvent;
}
```

---

### 現在残高一覧（balances/index.tsx）

**パス**: `/balances`
**レイアウト**: AppLayout

| 表示項目 | 説明 |
|----------|------|
| 実包種別 | 種別 + 番径・口径 |
| 現在残高 | 数量 |
| 最終更新 | 直近イベントの日付 |

**Props**:
```typescript
interface Props {
  balances: Array<{
    ammunition_type: AmmunitionType;
    balance: number;
    last_event_date: string | null;
  }>;
}
```

---

### 残高履歴（balances/history.tsx）

**パス**: `/balances/history`
**レイアウト**: AppLayout

| 機能 | 説明 |
|------|------|
| 実包種別選択 | セレクト |
| 日付指定 | 日付ピッカー |
| 残高表示 | 指定日時点の残高 |
| イベント一覧 | 指定日までのイベント履歴 |

---

### 帳簿出力（reports/index.tsx）

**パス**: `/reports`
**レイアウト**: AppLayout

| フィールド | 必須 | 説明 |
|------------|------|------|
| 開始日 | ○ | 日付ピッカー |
| 終了日 | ○ | 日付ピッカー |
| 実包種別 | - | 全種別 or 特定種別 |
| 出力形式 | ○ | PDF / CSV |

| ボタン | 動作 |
|--------|------|
| プレビュー | 画面内でプレビュー表示 |
| ダウンロード | ファイルをダウンロード |

---

### 検査モード（inspection/）

警察検査時に使用する閲覧専用画面。
編集操作は一切不可。

#### inspection/index.tsx

**パス**: `/inspection`
**レイアウト**: InspectionLayout

ダッシュボード的な画面。残高サマリーと帳簿へのリンク。

#### inspection/balance.tsx

**パス**: `/inspection/balance`
**レイアウト**: InspectionLayout

| 表示 | 説明 |
|------|------|
| 大きな数字で残高表示 | 視認性重視 |
| 実包種別ごとのカード | 種別、番径・口径、残高 |

#### inspection/ledger.tsx

**パス**: `/inspection/ledger`
**レイアウト**: InspectionLayout

| 機能 | 説明 |
|------|------|
| 帳簿一覧 | 全イベントの時系列表示 |
| フィルタ | 期間、実包種別 |
| 印刷ボタン | ブラウザの印刷機能を呼び出し |
| 印刷用CSS | 帳簿形式で整形 |

#### inspection/attachments.tsx

**パス**: `/inspection/attachments`
**レイアウト**: InspectionLayout

| 機能 | 説明 |
|------|------|
| 証憑一覧 | サムネイルグリッド表示 |
| フィルタ | 期間、イベント種別 |
| プレビュー | クリックで拡大表示 |

---

### 監査ログ一覧（audit-logs/index.tsx）

**パス**: `/audit-logs`
**レイアウト**: AppLayout

| 表示項目 | 説明 |
|----------|------|
| 日時 | 操作日時 |
| ユーザー | 操作者 |
| 操作 | create/update/read等 |
| 対象 | モデル名とID |
| 詳細 | 変更内容（展開可能） |

| フィルタ | 説明 |
|----------|------|
| 期間 | 日付範囲 |
| 操作種別 | create/update等 |
| 対象モデル | TransactionEvent等 |

---

## 共通パターン

### ページコンポーネントの構造

```tsx
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { SomeFeatureComponent } from '@/features/some-feature/components/some-component';

interface Props {
  // サーバーから渡されるデータ
}

export default function PageName({ ...props }: Props) {
  return (
    <AppLayout title="ページタイトル">
      <Head title="ページタイトル" />

      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">ページタイトル</h1>
          <div>{/* アクションボタン */}</div>
        </div>

        {/* メインコンテンツ */}
        <SomeFeatureComponent {...props} />
      </div>
    </AppLayout>
  );
}
```

### フォームページの構造

```tsx
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SomeForm } from '@/features/some-feature/components/some-form';

interface Props {
  // フォームに必要なデータ
}

export default function CreatePage({ ...props }: Props) {
  return (
    <AppLayout title="新規登録">
      <Head title="新規登録" />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>新規登録</CardTitle>
          </CardHeader>
          <CardContent>
            <SomeForm {...props} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
```
