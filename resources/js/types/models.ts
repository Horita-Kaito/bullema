export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AmmunitionType {
  id: number;
  user_id: number;
  category: string;
  caliber: string;
  manufacturer: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EventType =
  | 'acquisition'
  | 'consumption'
  | 'transfer'
  | 'disposal'
  | 'custody_out'
  | 'custody_return'
  | 'correction';

export interface TransactionEvent {
  id: number;
  user_id: number;
  ammunition_type_id: number;
  event_type: EventType;
  quantity: number;
  event_date: string;
  notes: string | null;
  location: string | null;
  counterparty_name: string | null;
  counterparty_address: string | null;
  counterparty_permit_number: string | null;
  disposal_method: string | null;
  correction_reason: string | null;
  original_event_id: number | null;
  record_hash: string;
  previous_hash: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  ammunition_type?: AmmunitionType;
  attachments?: Attachment[];
  original_event?: TransactionEvent;
  corrections?: TransactionEvent[];
}

export interface Attachment {
  id: number;
  transaction_event_id: number;
  file_path: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  auditable_type: string;
  auditable_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  url: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface Balance {
  ammunition_type: AmmunitionType;
  balance: number;
  last_event_date: string | null;
}
