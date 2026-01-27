import { Head } from '@inertiajs/react';
import { InspectionLayout } from '@/components/layouts/inspection-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionEvent, AmmunitionType } from '@/types/models';
import { formatDate, formatNumber } from '@/lib/utils';
import { EVENT_TYPE_LABELS } from '@/lib/constants';

interface TransactionWithBalance extends TransactionEvent {
  running_balance: number;
}

interface LedgerGroup {
  ammunition_type: AmmunitionType;
  transactions: TransactionWithBalance[];
  current_balance: number;
}

interface Props {
  ledgerGroups: LedgerGroup[];
  printDate: string;
}

export default function InspectionLedger({ ledgerGroups, printDate }: Props) {
  return (
    <InspectionLayout>
      <Head title="検査モード - 出納帳簿" />

      <div className="space-y-6">
        <div className="print:hidden">
          <h2 className="text-xl font-bold">出納帳簿</h2>
          <p className="text-muted-foreground">
            全出納記録の一覧
          </p>
        </div>

        {/* Print title */}
        <div className="hidden print:block">
          <h2 className="text-xl font-bold">実包出納帳簿</h2>
          <p className="text-sm text-muted-foreground">
            作成日時: {printDate}
          </p>
        </div>

        {ledgerGroups.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              出納記録がありません
            </CardContent>
          </Card>
        ) : (
          ledgerGroups.map((group) => (
            <Card key={group.ammunition_type.id} className="print:break-inside-avoid">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {group.ammunition_type.category} / {group.ammunition_type.caliber}
                    {group.ammunition_type.manufacturer && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({group.ammunition_type.manufacturer})
                      </span>
                    )}
                  </span>
                  <span className="text-lg">
                    現在残高: <strong>{formatNumber(group.current_balance)}</strong>発
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    出納記録がありません
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 w-24">日付</th>
                        <th className="text-left py-2 w-20">種別</th>
                        <th className="text-left py-2">内容</th>
                        <th className="text-right py-2 w-20">増減</th>
                        <th className="text-right py-2 w-20">残高</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="py-2">{formatDate(transaction.event_date)}</td>
                          <td className="py-2">{EVENT_TYPE_LABELS[transaction.event_type]}</td>
                          <td className="py-2 text-muted-foreground">
                            {getTransactionDetails(transaction)}
                          </td>
                          <td className={`py-2 text-right font-medium ${
                            transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.quantity > 0 ? '+' : ''}
                            {formatNumber(transaction.quantity)}
                          </td>
                          <td className="py-2 text-right font-bold">
                            {formatNumber(transaction.running_balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          ))
        )}

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

function getTransactionDetails(transaction: TransactionEvent): string {
  switch (transaction.event_type) {
    case 'acquisition':
    case 'transfer':
      return transaction.counterparty_name || '-';
    case 'consumption':
      return transaction.location || '-';
    case 'disposal':
      return transaction.disposal_method || '-';
    case 'correction':
      return transaction.correction_reason || '-';
    default:
      return transaction.notes || '-';
  }
}
