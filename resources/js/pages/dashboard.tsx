import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Balance, TransactionEvent } from '@/types/models';
import { formatDate, formatNumber } from '@/lib/utils';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants';
import {
  Plus,
  ClipboardCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Package,
  Activity,
} from 'lucide-react';

interface Props {
  balances: Balance[];
  recentTransactions: TransactionEvent[];
}

export default function Dashboard({ balances, recentTransactions }: Props) {
  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);
  const totalTypes = balances.length;

  return (
    <AppLayout title="ダッシュボード">
      <Head title="ダッシュボード" />

      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 text-white shadow-lg shadow-indigo-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">総残高</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatNumber(totalBalance)}
                    <span className="text-lg font-normal ml-1">発</span>
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white shadow-lg shadow-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">登録種別数</p>
                  <p className="text-3xl font-bold mt-1">
                    {totalTypes}
                    <span className="text-lg font-normal ml-1">種類</span>
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white shadow-lg shadow-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">今月の出納</p>
                  <p className="text-3xl font-bold mt-1">
                    {recentTransactions.length}
                    <span className="text-lg font-normal ml-1">件</span>
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="shadow-md shadow-primary/20">
            <Link href="/transactions/create">
              <Plus className="h-5 w-5 mr-2" />
              出納を記録
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/inspection">
              <ClipboardCheck className="h-5 w-5 mr-2" />
              検査モード
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Summary */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">現在残高</h2>
              <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-900">
                <Link href="/balances">
                  詳細を見る
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

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
              <div className="space-y-3">
                {balances.map((balance) => (
                  <Card
                    key={balance.ammunition_type.id}
                    className="hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {balance.ammunition_type.caliber}
                            </p>
                            <p className="text-sm text-slate-500">
                              {balance.ammunition_type.category}
                              {balance.ammunition_type.manufacturer &&
                                ` / ${balance.ammunition_type.manufacturer}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">
                            {formatNumber(balance.balance)}
                          </p>
                          <p className="text-xs text-slate-400">発</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Recent Transactions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">最近の出納</h2>
              <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-900">
                <Link href="/transactions">
                  すべて見る
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {recentTransactions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-3">まだ出納記録がありません</p>
                  <Button variant="outline" asChild>
                    <Link href="/transactions/create">最初の出納を記録する</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0 divide-y divide-slate-100">
                  {recentTransactions.map((transaction) => (
                    <Link
                      key={transaction.id}
                      href={`/transactions/${transaction.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`${EVENT_TYPE_COLORS[transaction.event_type]} text-xs`}
                            >
                              {EVENT_TYPE_LABELS[transaction.event_type]}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {transaction.ammunition_type?.caliber} ・{' '}
                            {formatDate(transaction.event_date)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-lg font-semibold ${
                          transaction.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {transaction.quantity > 0 ? '+' : ''}
                        {formatNumber(transaction.quantity)}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
