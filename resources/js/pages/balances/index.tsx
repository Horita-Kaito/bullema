import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Balance, TransactionEvent } from '@/types/models';
import { formatDate, formatNumber } from '@/lib/utils';
import { Eye, History } from 'lucide-react';

interface Props {
  balances: Balance[];
  transactionsByType: Record<number, TransactionEvent[]>;
}

export default function BalancesIndex({ balances, transactionsByType }: Props) {
  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);

  return (
    <AppLayout>
      <Head title="残高一覧" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">残高一覧</h1>
          <p className="text-muted-foreground">実包種別ごとの現在残高</p>
        </div>

        {/* Total summary card */}
        <Card>
          <CardHeader>
            <CardTitle>合計残高</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {formatNumber(totalBalance)}
              <span className="text-lg font-normal text-muted-foreground ml-1">発</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {balances.length}種類の実包
            </p>
          </CardContent>
        </Card>

        {balances.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>まだ実包が登録されていません</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/ammunition-types/create">実包マスタを登録する</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>種別</TableHead>
                  <TableHead>口径</TableHead>
                  <TableHead>メーカー</TableHead>
                  <TableHead className="text-right">残高</TableHead>
                  <TableHead>最終更新日</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow key={balance.ammunition_type.id}>
                    <TableCell className="font-medium">
                      {balance.ammunition_type.category}
                    </TableCell>
                    <TableCell>{balance.ammunition_type.caliber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {balance.ammunition_type.manufacturer || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${balance.balance > 0 ? 'text-green-600' : balance.balance < 0 ? 'text-red-600' : ''}`}>
                        {formatNumber(balance.balance)}
                      </span>
                      <span className="text-muted-foreground ml-1">発</span>
                    </TableCell>
                    <TableCell>
                      {balance.last_event_date ? formatDate(balance.last_event_date) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild title="詳細">
                          <Link href={`/balances/${balance.ammunition_type.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="履歴">
                          <Link href={`/transactions?ammunition_type_id=${balance.ammunition_type.id}`}>
                            <History className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
