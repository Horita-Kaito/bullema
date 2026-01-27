import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TransferFieldsProps {
  data: {
    counterparty_name: string;
    counterparty_address: string;
    counterparty_permit_number: string;
  };
  setData: (key: string, value: string) => void;
  errors: Record<string, string>;
}

export function TransferFields({ data, setData, errors }: TransferFieldsProps) {
  return (
    <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
      <h3 className="font-medium text-orange-800">譲渡先情報</h3>

      <div className="space-y-2">
        <Label htmlFor="counterparty_name">譲渡先氏名</Label>
        <Input
          id="counterparty_name"
          value={data.counterparty_name}
          onChange={(e) => setData('counterparty_name', e.target.value)}
          placeholder="山田太郎"
        />
        {errors.counterparty_name && (
          <p className="text-sm text-red-600">{errors.counterparty_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="counterparty_address">譲渡先住所</Label>
        <Textarea
          id="counterparty_address"
          value={data.counterparty_address}
          onChange={(e) => setData('counterparty_address', e.target.value)}
          placeholder="東京都〇〇区〇〇町1-2-3"
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
          placeholder="第〇〇号"
        />
        {errors.counterparty_permit_number && (
          <p className="text-sm text-red-600">{errors.counterparty_permit_number}</p>
        )}
      </div>
    </div>
  );
}
