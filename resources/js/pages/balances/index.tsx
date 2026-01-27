import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
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
import { Eye, History, Package, Calculator } from 'lucide-react';

interface Props {
  balances: Balance[];
  transactionsByType: Record<number, TransactionEvent[]>;
}

export default function BalancesIndex({ balances }: Props) {
  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);

  return (
    <AppLayout title="残高照会">
      <Head title="残高一覧" />

      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">残高照会</h1>
          <p className="text-sm text-slate-500 mt-1">実包種別ごとの現在残高</p>
        </div>

        {/* Total summary card */}
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">合計残高</p>
                <p className="text-3xl md:text-4xl font-bold mt-1">
                  {formatNumber(totalBalance)}
                  <span className="text-lg font-normal ml-1">発</span>
                </p>
                <p className="text-sm text-indigo-200 mt-1">
                  {balances.length}種類の実包
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl hidden sm:flex">
                <Calculator className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {balances.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500 mb-3">まだ実包が登録されていません</p>
              <Button variant="outline" asChild>
                <Link href="/ammunition-types/create">実包マスタを登録する</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile view */}
            <div className="md:hidden space-y-3">
              {balances.map((balance) => (
                <Card key={balance.ammunition_type.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {balance.ammunition_type.caliber}
                          </p>
                          <p className="text-sm text-slate-500">
                            {balance.ammunition_type.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${balance.balance > 0 ? 'text-emerald-600' : balance.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {formatNumber(balance.balance)}
                        </p>
                        <p className="text-xs text-slate-400">発</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        {balance.last_event_date
                          ? `最終更新: ${formatDate(balance.last_event_date)}`
                          : '未使用'}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                          <Link href={`/balances/${balance.ammunition_type.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            詳細
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                          <Link href={`/transactions?ammunition_type_id=${balance.ammunition_type.id}`}>
                            <History className="h-4 w-4 mr-1" />
                            履歴
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop view */}
            <div className="hidden md:block rounded-lg border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">種別</TableHead>
                    <TableHead className="font-semibold">口径</TableHead>
                    <TableHead className="font-semibold">メーカー</TableHead>
                    <TableHead className="text-right font-semibold">残高</TableHead>
                    <TableHead className="font-semibold">最終更新日</TableHead>
                    <TableHead className="w-[100px] font-semibold">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.map((balance) => (
                    <TableRow key={balance.ammunition_type.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        {balance.ammunition_type.category}
                      </TableCell>
                      <TableCell>{balance.ammunition_type.caliber}</TableCell>
                      <TableCell className="text-slate-500">
                        {balance.ammunition_type.manufacturer || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${balance.balance > 0 ? 'text-emerald-600' : balance.balance < 0 ? 'text-rose-600' : ''}`}>
                          {formatNumber(balance.balance)}
                        </span>
                        <span className="text-slate-400 ml-1">発</span>
                      </TableCell>
                      <TableCell className="text-slate-500">
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
