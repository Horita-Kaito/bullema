import { Head } from '@inertiajs/react';
import { InspectionLayout } from '@/components/layouts/inspection-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Balance } from '@/types/models';
import { formatDate, formatNumber } from '@/lib/utils';

interface Props {
  balances: Balance[];
  totalBalance: number;
  printDate: string;
}

export default function InspectionBalance({ balances, totalBalance, printDate }: Props) {
  return (
    <InspectionLayout>
      <Head title="検査モード - 現在残高" />

      <div className="space-y-6">
        <div className="print:hidden">
          <h2 className="text-xl font-bold">現在残高一覧</h2>
          <p className="text-muted-foreground">
            {printDate} 時点の残高
          </p>
        </div>

        {/* Print title */}
        <div className="hidden print:block">
          <h2 className="text-xl font-bold">実包残高証明</h2>
          <p className="text-sm text-muted-foreground">
            作成日時: {printDate}
          </p>
        </div>

        {/* Total */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">合計残高</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {formatNumber(totalBalance)}
              <span className="text-lg font-normal text-muted-foreground ml-1">発</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {balances.length}種類の実包
            </p>
          </CardContent>
        </Card>

        {/* Balance table */}
        <Card>
          <CardHeader>
            <CardTitle>残高内訳</CardTitle>
          </CardHeader>
          <CardContent>
            {balances.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                登録されている実包がありません
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-semibold">種別</th>
                    <th className="text-left py-3 font-semibold">口径</th>
                    <th className="text-left py-3 font-semibold">メーカー</th>
                    <th className="text-right py-3 font-semibold">残高</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((balance) => (
                    <tr key={balance.ammunition_type.id} className="border-b">
                      <td className="py-3">{balance.ammunition_type.category}</td>
                      <td className="py-3">{balance.ammunition_type.caliber}</td>
                      <td className="py-3 text-muted-foreground">
                        {balance.ammunition_type.manufacturer || '-'}
                      </td>
                      <td className="py-3 text-right font-bold text-lg">
                        {formatNumber(balance.balance)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          発
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50">
                    <td colSpan={3} className="py-3 font-semibold">合計</td>
                    <td className="py-3 text-right font-bold text-xl">
                      {formatNumber(totalBalance)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        発
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Signature area for print */}
        <div className="hidden print:block mt-12">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="border-b border-black pb-8 mb-2"></p>
              <p className="text-sm text-center">所持許可者署名</p>
            </div>
            <div>
              <p className="border-b border-black pb-8 mb-2"></p>
              <p className="text-sm text-center">確認者署名</p>
            </div>
          </div>
        </div>
      </div>
    </InspectionLayout>
  );
}
