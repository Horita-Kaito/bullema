# テーブル定義

## users テーブル

ユーザー（銃所持許可者）を管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | 主キー |
| name | VARCHAR(255) | NO | - | 氏名 |
| email | VARCHAR(255) | NO | - | メールアドレス（ユニーク） |
| email_verified_at | TIMESTAMP | YES | NULL | メール確認日時 |
| password | VARCHAR(255) | NO | - | パスワードハッシュ |
| remember_token | VARCHAR(100) | YES | NULL | ログイン維持トークン |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## ammunition_types テーブル

実包種別（マスタ）を管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | 主キー |
| user_id | BIGINT UNSIGNED | NO | - | 所有ユーザー |
| category | VARCHAR(100) | NO | - | 種別（散弾、ライフル弾等） |
| caliber | VARCHAR(100) | NO | - | 番径・口径 |
| manufacturer | VARCHAR(255) | YES | NULL | メーカー |
| notes | TEXT | YES | NULL | 備考 |
| is_active | BOOLEAN | NO | TRUE | 有効フラグ（論理削除用） |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

```sql
CREATE TABLE ammunition_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category VARCHAR(100) NOT NULL COMMENT '種別（散弾、ライフル弾等）',
    caliber VARCHAR(100) NOT NULL COMMENT '番径・口径',
    manufacturer VARCHAR(255) NULL COMMENT 'メーカー',
    notes TEXT NULL COMMENT '備考',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '有効フラグ',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## transaction_events テーブル

出納イベント（中核テーブル）を管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | 主キー |
| user_id | BIGINT UNSIGNED | NO | - | 作成ユーザー |
| ammunition_type_id | BIGINT UNSIGNED | NO | - | 実包種別 |
| event_type | ENUM | NO | - | イベント種別 |
| quantity | INT | NO | - | 数量（正:増加、負:減少） |
| event_date | DATE | NO | - | 発生日 |
| notes | TEXT | YES | NULL | 備考 |
| location | VARCHAR(255) | YES | NULL | 使用場所（消費時） |
| counterparty_name | VARCHAR(255) | YES | NULL | 相手方氏名 |
| counterparty_address | TEXT | YES | NULL | 相手方住所 |
| counterparty_permit_number | VARCHAR(100) | YES | NULL | 相手方許可証番号 |
| disposal_method | VARCHAR(255) | YES | NULL | 廃棄方法（廃棄時） |
| correction_reason | TEXT | YES | NULL | 訂正理由（訂正時） |
| original_event_id | BIGINT UNSIGNED | YES | NULL | 訂正対象イベント |
| record_hash | VARCHAR(64) | NO | - | レコードハッシュ（改ざん防止） |
| previous_hash | VARCHAR(64) | YES | NULL | 直前レコードのハッシュ |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

### event_type の値

| 値 | 日本語 | 在庫変動 |
|----|--------|----------|
| acquisition | 譲受（購入含む） | + |
| consumption | 消費（射撃・狩猟） | - |
| transfer | 譲渡 | - |
| disposal | 廃棄 | - |
| custody_out | 保管委託 | - |
| custody_return | 保管委託から返却 | + |
| correction | 訂正 | ± |

```sql
CREATE TABLE transaction_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    ammunition_type_id BIGINT UNSIGNED NOT NULL,

    event_type ENUM(
        'acquisition',      -- 譲受
        'consumption',      -- 消費
        'transfer',         -- 譲渡
        'disposal',         -- 廃棄
        'custody_out',      -- 保管委託
        'custody_return',   -- 保管委託から返却
        'correction'        -- 訂正
    ) NOT NULL,

    quantity INT NOT NULL COMMENT '数量（正:増加、負:減少）',
    event_date DATE NOT NULL COMMENT '発生日',
    notes TEXT NULL COMMENT '備考',

    -- 消費時
    location VARCHAR(255) NULL COMMENT '使用場所',

    -- 譲受/譲渡時
    counterparty_name VARCHAR(255) NULL COMMENT '相手方氏名',
    counterparty_address TEXT NULL COMMENT '相手方住所',
    counterparty_permit_number VARCHAR(100) NULL COMMENT '相手方許可証番号',

    -- 廃棄時
    disposal_method VARCHAR(255) NULL COMMENT '廃棄方法',

    -- 訂正時
    correction_reason TEXT NULL COMMENT '訂正理由',
    original_event_id BIGINT UNSIGNED NULL COMMENT '訂正対象イベント',

    -- 改ざん防止
    record_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256ハッシュ',
    previous_hash VARCHAR(64) NULL COMMENT '直前レコードのハッシュ',

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (ammunition_type_id) REFERENCES ammunition_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (original_event_id) REFERENCES transaction_events(id) ON DELETE RESTRICT,

    INDEX idx_user (user_id),
    INDEX idx_ammunition_type (ammunition_type_id),
    INDEX idx_event_date (event_date),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_user_date (user_id, event_date),
    INDEX idx_user_ammo_date (user_id, ammunition_type_id, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## attachments テーブル

証憑ファイルを管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | 主キー |
| transaction_event_id | BIGINT UNSIGNED | NO | - | 紐づくイベント |
| file_path | VARCHAR(500) | NO | - | ストレージパス |
| original_name | VARCHAR(255) | NO | - | 元のファイル名 |
| mime_type | VARCHAR(100) | NO | - | MIMEタイプ |
| file_size | BIGINT UNSIGNED | NO | - | ファイルサイズ（バイト） |
| file_hash | VARCHAR(64) | NO | - | ファイルのSHA-256ハッシュ |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

```sql
CREATE TABLE attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_event_id BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(500) NOT NULL COMMENT 'ストレージパス',
    original_name VARCHAR(255) NOT NULL COMMENT '元のファイル名',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIMEタイプ',
    file_size BIGINT UNSIGNED NOT NULL COMMENT 'バイト数',
    file_hash VARCHAR(64) NOT NULL COMMENT 'ファイルのSHA-256ハッシュ',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (transaction_event_id) REFERENCES transaction_events(id) ON DELETE RESTRICT,

    INDEX idx_event (transaction_event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## audit_logs テーブル

操作ログを管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|----------|-----|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | 主キー |
| user_id | BIGINT UNSIGNED | YES | NULL | 操作ユーザー |
| action | VARCHAR(50) | NO | - | 操作種別 |
| auditable_type | VARCHAR(255) | NO | - | 対象モデルクラス |
| auditable_id | BIGINT UNSIGNED | YES | NULL | 対象レコードID |
| old_values | JSON | YES | NULL | 変更前の値 |
| new_values | JSON | YES | NULL | 変更後の値 |
| ip_address | VARCHAR(45) | YES | NULL | IPアドレス |
| user_agent | TEXT | YES | NULL | ユーザーエージェント |
| url | VARCHAR(500) | YES | NULL | リクエストURL |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | 作成日時 |

### action の値

| 値 | 説明 |
|----|------|
| create | レコード作成 |
| update | レコード更新 |
| read | レコード閲覧（重要モデルのみ） |
| login | ログイン |
| logout | ログアウト |
| export | 帳簿出力 |

```sql
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(50) NOT NULL COMMENT '操作種別',
    auditable_type VARCHAR(255) NOT NULL COMMENT 'モデルクラス名',
    auditable_id BIGINT UNSIGNED NULL COMMENT '対象レコードID',
    old_values JSON NULL COMMENT '変更前の値',
    new_values JSON NULL COMMENT '変更後の値',
    ip_address VARCHAR(45) NULL COMMENT 'IPアドレス',
    user_agent TEXT NULL COMMENT 'ユーザーエージェント',
    url VARCHAR(500) NULL COMMENT 'リクエストURL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_auditable (auditable_type, auditable_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 制約とルール

### 物理削除の禁止

以下のテーブルは物理削除を禁止：

- `transaction_events` - 訂正イベントで対応
- `attachments` - イベントに紐づくため削除不可
- `ammunition_types` - `is_active` フラグで論理削除

### 外部キー制約

すべての外部キーに `ON DELETE RESTRICT` を設定し、参照整合性を強制。

### ハッシュチェーン

`transaction_events` テーブルの `record_hash` と `previous_hash` により、データの改ざんを検知可能。
