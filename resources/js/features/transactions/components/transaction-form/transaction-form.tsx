import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AmmunitionType, EventType } from '@/types/models';
import { FormEvent } from 'react';
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/constants';
import { AcquisitionFields } from './acquisition-fields';
import { ConsumptionFields } from './consumption-fields';
import { TransferFields } from './transfer-fields';
import { DisposalFields } from './disposal-fields';

interface TransactionFormProps {
  ammunitionTypes: AmmunitionType[];
}

export function TransactionForm({ ammunitionTypes }: TransactionFormProps) {
  const { data, setData, post, processing, errors } = useForm({
    ammunition_type_id: '',
    event_type: '' as EventType | '',
    quantity: '',
    event_date: new Date().toISOString().split('T')[0],
    notes: '',
    location: '',
    counterparty_name: '',
    counterparty_address: '',
    counterparty_permit_number: '',
    disposal_method: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/transactions');
  };

  // Filter out 'correction' from available event types
  const availableEventTypes = EVENT_TYPES.filter(t => t !== 'correction');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ammunition_type_id">実包種別 *</Label>
          <select
            id="ammunition_type_id"
            value={data.ammunition_type_id}
            onChange={(e) => setData('ammunition_type_id', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
          >
            <option value="">選択してください</option>
            {ammunitionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.category} / {type.caliber}
                {type.manufacturer && ` (${type.manufacturer})`}
              </option>
            ))}
          </select>
          {errors.ammunition_type_id && (
            <p className="text-sm text-red-600">{errors.ammunition_type_id}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_type">イベント種別 *</Label>
          <select
            id="event_type"
            value={data.event_type}
            onChange={(e) => setData('event_type', e.target.value as EventType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
          >
            <option value="">選択してください</option>
            {availableEventTypes.map((type) => (
              <option key={type} value={type}>
                {EVENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.event_type && (
            <p className="text-sm text-red-600">{errors.event_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">数量 *</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={data.quantity}
            onChange={(e) => setData('quantity', e.target.value)}
            placeholder="1"
          />
          {errors.quantity && (
            <p className="text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_date">発生日 *</Label>
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

      {/* Event type specific fields */}
      {data.event_type === 'acquisition' && (
        <AcquisitionFields data={data} setData={setData} errors={errors} />
      )}
      {data.event_type === 'consumption' && (
        <ConsumptionFields data={data} setData={setData} errors={errors} />
      )}
      {data.event_type === 'transfer' && (
        <TransferFields data={data} setData={setData} errors={errors} />
      )}
      {data.event_type === 'disposal' && (
        <DisposalFields data={data} setData={setData} errors={errors} />
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">備考</Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => setData('notes', e.target.value)}
          placeholder="メモなど"
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
          {processing ? '保存中...' : '登録'}
        </Button>
      </div>
    </form>
  );
}
