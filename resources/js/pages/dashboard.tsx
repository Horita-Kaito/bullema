import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Balance, TransactionEvent } from '@/types/models';
import { formatDate, formatNumber } from '@/lib/utils';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants';
import { Plus, ClipboardCheck, ArrowRight } from 'lucide-react';

interface Props {
  balances: Balance[];
  recentTransactions: TransactionEvent[];
}

export default function Dashboard({ balances, recentTransactions }: Props) {
  return (
    <AppLayout title="ダッシュボード">
      <Head title="ダッシュボード" />

      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/transactions/create">
              <Plus className="h-4 w-4 mr-2" />
              出納を記録
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/inspection">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              検査モード
            </Link>
          </Button>
        </div>

        {/* Balance Summary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">現在残高</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/balances">
                詳細を見る
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance) => (
                <Card key={balance.ammunition_type.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {balance.ammunition_type.category} / {balance.ammunition_type.caliber}
                    </CardTitle>
                    {balance.ammunition_type.manufacturer && (
                      <p className="text-sm text-muted-foreground">
                        {balance.ammunition_type.manufacturer}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatNumber(balance.balance)}
                      <span className="text-base font-normal text-muted-foreground ml-1">
                        発
                      </span>
                    </div>
                    {balance.last_event_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        最終更新: {formatDate(balance.last_event_date)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">最近の出納</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/transactions">
                すべて見る
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {recentTransactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>まだ出納記録がありません</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/transactions/create">最初の出納を記録する</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {recentTransactions.map((transaction) => (
                    <li key={transaction.id}>
                      <Link
                        href={`/transactions/${transaction.id}`}
                        className="block p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className={EVENT_TYPE_COLORS[transaction.event_type]}
                            >
                              {EVENT_TYPE_LABELS[transaction.event_type]}
                            </Badge>
                            <div>
                              <p className="font-medium">
                                {transaction.ammunition_type?.category} /{' '}
                                {transaction.ammunition_type?.caliber}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(transaction.event_date)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${
                                transaction.quantity > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.quantity > 0 ? '+' : ''}
                              {formatNumber(transaction.quantity)}発
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
