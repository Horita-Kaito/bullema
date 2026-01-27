import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DisposalFieldsProps {
  data: {
    disposal_method: string;
  };
  setData: (key: string, value: string) => void;
  errors: Record<string, string>;
}

export function DisposalFields({ data, setData, errors }: DisposalFieldsProps) {
  return (
    <div className="space-y-4 p-4 bg-red-50 rounded-lg">
      <h3 className="font-medium text-red-800">廃棄情報</h3>

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
    </div>
  );
}
