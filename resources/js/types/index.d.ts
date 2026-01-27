import { User } from './models';

declare global {
  interface Window {
    // Add any window extensions here
  }
}

export interface PageProps {
  auth: {
    user: User | null;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

export type { User, AmmunitionType, TransactionEvent, Attachment, AuditLog, EventType, PaginatedResponse, Balance } from './models';
