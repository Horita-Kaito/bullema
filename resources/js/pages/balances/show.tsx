import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AmmunitionType, TransactionEvent } from '@/types/models';
import { EventTypeBadge } from '@/features/transactions/components/event-type-badge';
import { formatDate, formatNumber } from '@/lib/utils';
import { ArrowLeft, Plus, Eye } from 'lucide-react';

interface Props {
  ammunitionType: AmmunitionType;
  transactions: TransactionEvent[];
  balance: number;
}

export default function BalancesShow({ ammunitionType, transactions, balance }: Props) {
  // Calculate running balance (from oldest to newest)
  const transactionsWithBalance = [...transactions].reverse().reduce<
    Array<TransactionEvent & { runningBalance: number }>
  >((acc, transaction) => {
    const previousBalance = acc.length > 0 ? acc[acc.length - 1].runningBalance : 0;
    const runningBalance = previousBalance + transaction.quantity;
    acc.push({ ...transaction, runningBalance });
    return acc;
  }, []).reverse();

  return (
    <AppLayout>
      <Head title={`${ammunitionType.category} / ${ammunitionType.caliber}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/balances">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {ammunitionType.category} / {ammunitionType.caliber}
            </h1>
            {ammunitionType.manufacturer && (
              <p className="text-muted-foreground">{ammunitionType.manufacturer}</p>
            )}
          </div>
          <Button asChild>
            <Link href={`/transactions/create?ammunition_type_id=${ammunitionType.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              出納を記録
            </Link>
          </Button>
        </div>

        {/* Current balance card */}
        <Card>
          <CardHeader>
            <CardTitle>現在残高</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              <span className={balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : ''}>
                {formatNumber(balance)}
              </span>
              <span className="text-lg font-normal text-muted-foreground ml-1">発</span>
            </div>
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card>
          <CardHeader>
            <CardTitle>出納履歴</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>まだ出納記録がありません</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead className="text-right">数量</TableHead>
                    <TableHead className="text-right">残高</TableHead>
                    <TableHead>備考</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsWithBalance.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.event_date)}</TableCell>
                      <TableCell>
                        <EventTypeBadge type={transaction.event_type} />
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
                      <TableCell className="text-right font-medium">
                        {formatNumber(transaction.runningBalance)}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground">
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
