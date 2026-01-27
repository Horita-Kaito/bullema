import { Head } from '@inertiajs/react';
import { InspectionLayout } from '@/components/layouts/inspection-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Balance, User } from '@/types/models';
import { formatDate, formatNumber } from '@/lib/utils';

interface Props {
  user: User;
  balances: Balance[];
  totalBalance: number;
  totalTransactions: number;
  lastEventDate: string | null;
}

export default function InspectionIndex({
  user,
  balances,
  totalBalance,
  totalTransactions,
  lastEventDate,
}: Props) {
  return (
    <InspectionLayout>
      <Head title="検査モード - 概要" />

      <div className="space-y-6">
        {/* User info */}
        <Card>
          <CardHeader>
            <CardTitle>所持許可者情報</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">氏名</dt>
                <dd className="font-medium">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">メールアドレス</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">合計残高</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatNumber(totalBalance)}
                <span className="text-base font-normal text-muted-foreground ml-1">発</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">出納記録数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatNumber(totalTransactions)}
                <span className="text-base font-normal text-muted-foreground ml-1">件</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">最終出納日</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {lastEventDate ? formatDate(lastEventDate) : '-'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Balance breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>実包種別ごとの残高</CardTitle>
          </CardHeader>
          <CardContent>
            {balances.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                登録されている実包がありません
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">種別</th>
                    <th className="text-left py-2">口径</th>
                    <th className="text-left py-2">メーカー</th>
                    <th className="text-right py-2">残高</th>
                    <th className="text-left py-2">最終更新</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((balance) => (
                    <tr key={balance.ammunition_type.id} className="border-b">
                      <td className="py-2">{balance.ammunition_type.category}</td>
                      <td className="py-2">{balance.ammunition_type.caliber}</td>
                      <td className="py-2 text-muted-foreground">
                        {balance.ammunition_type.manufacturer || '-'}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatNumber(balance.balance)}発
                      </td>
                      <td className="py-2">
                        {balance.last_event_date ? formatDate(balance.last_event_date) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Data integrity notice */}
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              本システムのデータはハッシュチェーンにより改ざん防止されています。
              出力データの整合性は「/integrity-check」から確認できます。
            </p>
          </CardContent>
        </Card>
      </div>
    </InspectionLayout>
  );
}
