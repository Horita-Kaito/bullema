# ER図

## 概念ER図

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ PK id           │
│    name         │
│    email        │
│    password     │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────┐         ┌─────────────────────┐
│   ammunition_types  │         │     audit_logs      │
├─────────────────────┤         ├─────────────────────┤
│ PK id               │         │ PK id               │
│    user_id (FK)     │         │ FK user_id          │
│    category         │         │    action           │
│    caliber          │         │    auditable_type   │
│    manufacturer     │         │    auditable_id     │
│    notes            │         │    old_values       │
│    is_active        │         │    new_values       │
└──────────┬──────────┘         │    ip_address       │
           │                    │    user_agent       │
           │ 1:N                │    created_at       │
           │                    └─────────────────────┘
           ▼
┌─────────────────────────────┐
│     transaction_events      │
├─────────────────────────────┤
│ PK id                       │
│ FK ammunition_type_id       │
│ FK user_id                  │
│    event_type               │
│    quantity                 │
│    event_date               │
│    notes                    │
│    location                 │◀── 消費時
│    counterparty_name        │◀── 譲受/譲渡時
│    counterparty_address     │
│    counterparty_permit_no   │
│    disposal_method          │◀── 廃棄時
│    correction_reason        │◀── 訂正時
│ FK original_event_id        │◀── 訂正時（自己参照）
│    record_hash              │◀── 改ざん防止
│    previous_hash            │
└──────────────┬──────────────┘
               │
               │ 1:N
               │
               ▼
      ┌─────────────────┐
      │   attachments   │
      ├─────────────────┤
      │ PK id           │
      │ FK event_id     │
      │    file_path    │
      │    original_name│
      │    mime_type    │
      │    file_size    │
      │    file_hash    │
      └─────────────────┘
```

## リレーション詳細

| 親テーブル | 子テーブル | カーディナリティ | 説明 |
|------------|------------|------------------|------|
| users | ammunition_types | 1:N | ユーザーが実包種別を所有 |
| users | transaction_events | 1:N | ユーザーがイベントを作成 |
| users | audit_logs | 1:N | ユーザーの操作を記録 |
| ammunition_types | transaction_events | 1:N | 実包種別に対するイベント |
| transaction_events | attachments | 1:N | イベントに証憑を添付 |
| transaction_events | transaction_events | 1:N | 訂正イベントの自己参照 |

## インデックス設計

### transaction_events テーブル

```sql
-- 主キー（自動）
PRIMARY KEY (id)

-- 外部キー
INDEX idx_ammunition_type (ammunition_type_id)
INDEX idx_user (user_id)
INDEX idx_original_event (original_event_id)

-- 検索・フィルタ用
INDEX idx_event_date (event_date)
INDEX idx_event_type (event_type)
INDEX idx_created_at (created_at)

-- 複合インデックス（帳簿表示用）
INDEX idx_user_date (user_id, event_date)
INDEX idx_user_ammo_date (user_id, ammunition_type_id, event_date)
```

### audit_logs テーブル

```sql
-- 検索用
INDEX idx_user (user_id)
INDEX idx_auditable (auditable_type, auditable_id)
INDEX idx_action (action)
INDEX idx_created_at (created_at)
```

## データ量の見積もり

### 想定データ量（1ユーザーあたり/年）

| テーブル | レコード数/年 | 備考 |
|----------|---------------|------|
| ammunition_types | 5-20 | 所持する実包種類 |
| transaction_events | 50-500 | 月4-40件程度 |
| attachments | 50-500 | イベントと同程度 |
| audit_logs | 1,000-5,000 | 全操作を記録 |

### 3年分のデータ保持

```
transaction_events: ~1,500 レコード/ユーザー
attachments: ~1,500 レコード/ユーザー
audit_logs: ~15,000 レコード/ユーザー
```

パフォーマンス的には十分に小規模。
