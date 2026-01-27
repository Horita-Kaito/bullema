import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Eye, TrendingUp, TrendingDown, Activity, ChevronRight } from 'lucide-react';

interface TransactionTableProps {
  transactions: PaginatedResponse<TransactionEvent>;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Activity className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-500">出納記録がありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {transactions.data.map((transaction) => (
          <Link
            key={transaction.id}
            href={`/transactions/${transaction.id}`}
            className="block"
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        transaction.quantity > 0
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {transaction.quantity > 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <EventTypeBadge type={transaction.event_type} />
                        <span className="text-xs text-slate-400">
                          {formatDate(transaction.event_date)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {transaction.ammunition_type?.category} / {transaction.ammunition_type?.caliber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span
                      className={`text-lg font-semibold ${
                        transaction.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {transaction.quantity > 0 ? '+' : ''}
                      {formatNumber(transaction.quantity)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="font-semibold">発生日</TableHead>
              <TableHead className="font-semibold">種別</TableHead>
              <TableHead className="font-semibold">実包</TableHead>
              <TableHead className="text-right font-semibold">数量</TableHead>
              <TableHead className="font-semibold">備考</TableHead>
              <TableHead className="w-[70px] font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.data.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-slate-50/50">
                <TableCell>{formatDate(transaction.event_date)}</TableCell>
                <TableCell>
                  <EventTypeBadge type={transaction.event_type} />
                </TableCell>
                <TableCell>
                  {transaction.ammunition_type?.category} / {transaction.ammunition_type?.caliber}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`font-semibold ${
                      transaction.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {transaction.quantity > 0 ? '+' : ''}
                    {formatNumber(transaction.quantity)}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-slate-500">
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
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
