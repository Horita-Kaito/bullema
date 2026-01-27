import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TransactionEvent, PaginatedResponse } from '@/types/models';
import { EventTypeBadge } from './event-type-badge';
import { formatDate, formatNumber } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface TransactionTableProps {
  transactions: PaginatedResponse<TransactionEvent>;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>発生日</TableHead>
            <TableHead>種別</TableHead>
            <TableHead>実包</TableHead>
            <TableHead className="text-right">数量</TableHead>
            <TableHead>備考</TableHead>
            <TableHead className="w-[70px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                出納記録がありません
              </TableCell>
            </TableRow>
          ) : (
            transactions.data.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.event_date)}</TableCell>
                <TableCell>
                  <EventTypeBadge type={transaction.event_type} />
                </TableCell>
                <TableCell>
                  {transaction.ammunition_type?.category} / {transaction.ammunition_type?.caliber}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {transaction.quantity > 0 ? '+' : ''}
                    {formatNumber(transaction.quantity)}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {transaction.notes || '-'}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/transactions/${transaction.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
