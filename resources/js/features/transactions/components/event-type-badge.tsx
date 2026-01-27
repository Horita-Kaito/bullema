import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EventType } from '@/types/models';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants';

interface EventTypeBadgeProps {
  type: EventType;
  className?: string;
}

export function EventTypeBadge({ type, className }: EventTypeBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(EVENT_TYPE_COLORS[type], className)}
    >
      {EVENT_TYPE_LABELS[type]}
    </Badge>
  );
}
