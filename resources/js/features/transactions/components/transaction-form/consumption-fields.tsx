import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConsumptionFieldsProps {
  data: {
    location: string;
  };
  setData: (key: string, value: string) => void;
  errors: Record<string, string>;
}

export function ConsumptionFields({ data, setData, errors }: ConsumptionFieldsProps) {
  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
      <h3 className="font-medium text-blue-800">消費情報</h3>

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
    </div>
  );
}
