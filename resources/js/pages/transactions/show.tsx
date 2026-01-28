import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransactionEvent } from '@/types/models';
import { EventTypeBadge } from '@/features/transactions/components/event-type-badge';
import { formatDate, formatNumber } from '@/lib/utils';
import { ArrowLeft, FileEdit, AlertTriangle } from 'lucide-react';

interface Props {
  transaction: TransactionEvent;
}

export default function TransactionsShow({ transaction }: Props) {
  const isCorrection = transaction.event_type === 'correction';
  const hasCorrections = transaction.corrections && transaction.corrections.length > 0;

  return (
    <AppLayout>
      <Head title={`出納詳細 #${transaction.id}`} />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
            <Link href="/transactions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">出納詳細</h1>
            <p className="text-muted-foreground text-sm">#{transaction.id}</p>
          </div>
        </div>

        {hasCorrections && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800">
              この記録は訂正されています。訂正後の情報は下部を確認してください。
            </span>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <EventTypeBadge type={transaction.event_type} />
                  {transaction.ammunition_type?.category} / {transaction.ammunition_type?.caliber}
                </CardTitle>
                <CardDescription>
                  {formatDate(transaction.event_date)}
                </CardDescription>
              </div>
              {!isCorrection && !hasCorrections && (
                <Button variant="outline" asChild>
                  <Link href={`/transactions/${transaction.id}/correct`}>
                    <FileEdit className="h-4 w-4 mr-2" />
                    訂正
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">数量</p>
                <p className={`text-xl font-bold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.quantity > 0 ? '+' : ''}{formatNumber(transaction.quantity)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">発生日</p>
                <p className="text-lg">{formatDate(transaction.event_date)}</p>
              </div>
            </div>

            {/* Event type specific details */}
            {transaction.event_type === 'acquisition' && transaction.counterparty_name && (
              <div className="p-4 bg-green-50 rounded-lg space-y-2">
                <h3 className="font-medium text-green-800">譲受先情報</h3>
                <div>
                  <p className="text-sm text-muted-foreground">譲受先</p>
                  <p>{transaction.counterparty_name}</p>
                </div>
                {transaction.counterparty_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">住所</p>
                    <p>{transaction.counterparty_address}</p>
                  </div>
                )}
                {transaction.counterparty_permit_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">許可証番号</p>
                    <p>{transaction.counterparty_permit_number}</p>
                  </div>
                )}
              </div>
            )}

            {transaction.event_type === 'consumption' && transaction.location && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800">消費情報</h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">使用場所</p>
                  <p>{transaction.location}</p>
                </div>
              </div>
            )}

            {transaction.event_type === 'transfer' && transaction.counterparty_name && (
              <div className="p-4 bg-orange-50 rounded-lg space-y-2">
                <h3 className="font-medium text-orange-800">譲渡先情報</h3>
                <div>
                  <p className="text-sm text-muted-foreground">譲渡先</p>
                  <p>{transaction.counterparty_name}</p>
                </div>
                {transaction.counterparty_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">住所</p>
                    <p>{transaction.counterparty_address}</p>
                  </div>
                )}
                {transaction.counterparty_permit_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">許可証番号</p>
                    <p>{transaction.counterparty_permit_number}</p>
                  </div>
                )}
              </div>
            )}

            {transaction.event_type === 'disposal' && transaction.disposal_method && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-800">廃棄情報</h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">廃棄方法</p>
                  <p>{transaction.disposal_method}</p>
                </div>
              </div>
            )}

            {isCorrection && transaction.correction_reason && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800">訂正理由</h3>
                <p className="mt-2">{transaction.correction_reason}</p>
                {transaction.original_event && (
                  <div className="mt-2">
                    <Link
                      href={`/transactions/${transaction.original_event_id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      元の記録を表示 →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {transaction.notes && (
              <div>
                <p className="text-sm text-muted-foreground">備考</p>
                <p className="whitespace-pre-wrap">{transaction.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                記録ハッシュ: <code className="bg-muted px-1 rounded">{transaction.record_hash}</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Corrections list */}
        {hasCorrections && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">訂正履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transaction.corrections!.map((correction) => (
                  <Link
                    key={correction.id}
                    href={`/transactions/${correction.id}`}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80"
                  >
                    <div>
                      <p className="font-medium">{formatDate(correction.event_date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {correction.correction_reason}
                      </p>
                    </div>
                    <div className={correction.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {correction.quantity > 0 ? '+' : ''}{formatNumber(correction.quantity)}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
