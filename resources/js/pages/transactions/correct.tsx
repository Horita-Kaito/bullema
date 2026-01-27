import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TransactionEvent, AmmunitionType } from '@/types/models';
import { EventTypeBadge } from '@/features/transactions/components/event-type-badge';
import { formatDate, formatNumber } from '@/lib/utils';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
  transaction: TransactionEvent;
  ammunitionTypes: AmmunitionType[];
}

export default function TransactionsCorrect({ transaction, ammunitionTypes }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    quantity: Math.abs(transaction.quantity).toString(),
    event_date: transaction.event_date,
    correction_reason: '',
    notes: transaction.notes || '',
    location: transaction.location || '',
    counterparty_name: transaction.counterparty_name || '',
    counterparty_address: transaction.counterparty_address || '',
    counterparty_permit_number: transaction.counterparty_permit_number || '',
    disposal_method: transaction.disposal_method || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(`/transactions/${transaction.id}/correct`);
  };

  return (
    <AppLayout>
      <Head title={`訂正 #${transaction.id}`} />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/transactions/${transaction.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">出納記録の訂正</h1>
            <p className="text-muted-foreground">#{transaction.id} の訂正</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-800">
            訂正は履歴として記録されます。元の記録は変更されません。
          </span>
        </div>

        {/* Original record summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">元の記録</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EventTypeBadge type={transaction.event_type} />
                <span>{transaction.ammunition_type?.category} / {transaction.ammunition_type?.caliber}</span>
              </div>
              <div className={transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {transaction.quantity > 0 ? '+' : ''}{formatNumber(transaction.quantity)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {formatDate(transaction.event_date)}
            </p>
          </CardContent>
        </Card>

        {/* Correction form */}
        <Card>
          <CardHeader>
            <CardTitle>訂正内容</CardTitle>
            <CardDescription>
              訂正後の正しい情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="correction_reason">訂正理由 *</Label>
                <Textarea
                  id="correction_reason"
                  value={data.correction_reason}
                  onChange={(e) => setData('correction_reason', e.target.value)}
                  placeholder="訂正の理由を入力してください"
                  rows={2}
                />
                {errors.correction_reason && (
                  <p className="text-sm text-red-600">{errors.correction_reason}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">正しい数量 *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={data.quantity}
                    onChange={(e) => setData('quantity', e.target.value)}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_date">正しい発生日 *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={data.event_date}
                    onChange={(e) => setData('event_date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.event_date && (
                    <p className="text-sm text-red-600">{errors.event_date}</p>
                  )}
                </div>
              </div>

              {/* Show relevant fields based on event type */}
              {transaction.event_type === 'consumption' && (
                <div className="space-y-2">
                  <Label htmlFor="location">使用場所</Label>
                  <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    placeholder="〇〇射撃場 / △△猟区"
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
              )}

              {(transaction.event_type === 'acquisition' || transaction.event_type === 'transfer') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="counterparty_name">
                      {transaction.event_type === 'acquisition' ? '譲受先' : '譲渡先'}氏名
                    </Label>
                    <Input
                      id="counterparty_name"
                      value={data.counterparty_name}
                      onChange={(e) => setData('counterparty_name', e.target.value)}
                    />
                    {errors.counterparty_name && (
                      <p className="text-sm text-red-600">{errors.counterparty_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="counterparty_address">住所</Label>
                    <Textarea
                      id="counterparty_address"
                      value={data.counterparty_address}
                      onChange={(e) => setData('counterparty_address', e.target.value)}
                      rows={2}
                    />
                    {errors.counterparty_address && (
                      <p className="text-sm text-red-600">{errors.counterparty_address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="counterparty_permit_number">許可証番号</Label>
                    <Input
                      id="counterparty_permit_number"
                      value={data.counterparty_permit_number}
                      onChange={(e) => setData('counterparty_permit_number', e.target.value)}
                    />
                    {errors.counterparty_permit_number && (
                      <p className="text-sm text-red-600">{errors.counterparty_permit_number}</p>
                    )}
                  </div>
                </div>
              )}

              {transaction.event_type === 'disposal' && (
                <div className="space-y-2">
                  <Label htmlFor="disposal_method">廃棄方法</Label>
                  <Input
                    id="disposal_method"
                    value={data.disposal_method}
                    onChange={(e) => setData('disposal_method', e.target.value)}
                    placeholder="警察署への届出 / 不発弾処理"
                  />
                  {errors.disposal_method && (
                    <p className="text-sm text-red-600">{errors.disposal_method}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  rows={3}
                />
                {errors.notes && (
                  <p className="text-sm text-red-600">{errors.notes}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => history.back()}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? '保存中...' : '訂正を登録'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
