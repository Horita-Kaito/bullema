import { EventType } from '@/types/models';

export const EVENT_TYPES: EventType[] = [
  'acquisition',
  'consumption',
  'transfer',
  'disposal',
  'custody_out',
  'custody_return',
  'correction',
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  acquisition: '譲受',
  consumption: '消費',
  transfer: '譲渡',
  disposal: '廃棄',
  custody_out: '保管委託',
  custody_return: '保管委託返却',
  correction: '訂正',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  acquisition: 'bg-green-100 text-green-800',
  consumption: 'bg-blue-100 text-blue-800',
  transfer: 'bg-orange-100 text-orange-800',
  disposal: 'bg-red-100 text-red-800',
  custody_out: 'bg-purple-100 text-purple-800',
  custody_return: 'bg-teal-100 text-teal-800',
  correction: 'bg-gray-100 text-gray-800',
};

// Event types that increase balance (positive quantity)
export const POSITIVE_EVENT_TYPES: EventType[] = ['acquisition', 'custody_return'];

// Event types that decrease balance (negative quantity)
export const NEGATIVE_EVENT_TYPES: EventType[] = ['consumption', 'transfer', 'disposal', 'custody_out'];

// Ammunition categories
export const AMMUNITION_CATEGORIES = [
  '散弾',
  'ライフル弾',
  '空気銃弾',
  'その他',
] as const;

// Common calibers
export const COMMON_CALIBERS = [
  // Shotgun
  '12番',
  '20番',
  '410番',
  // Rifle
  '.223 Remington',
  '.308 Winchester',
  '.30-06 Springfield',
  '7.62x39mm',
  '6.5mm Creedmoor',
  // Air gun
  '4.5mm',
  '5.5mm',
] as const;
