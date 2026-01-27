import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AmmunitionType } from '@/types/models';
import { FormEvent } from 'react';
import { AMMUNITION_CATEGORIES, COMMON_CALIBERS } from '@/lib/constants';

interface AmmunitionTypeFormProps {
  ammunitionType?: AmmunitionType;
}

export function AmmunitionTypeForm({ ammunitionType }: AmmunitionTypeFormProps) {
  const isEditing = !!ammunitionType;

  const { data, setData, post, put, processing, errors } = useForm({
    category: ammunitionType?.category ?? '',
    caliber: ammunitionType?.caliber ?? '',
    manufacturer: ammunitionType?.manufacturer ?? '',
    notes: ammunitionType?.notes ?? '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(`/ammunition-types/${ammunitionType.id}`);
    } else {
      post('/ammunition-types');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">種別 *</Label>
          <Input
            id="category"
            value={data.category}
            onChange={(e) => setData('category', e.target.value)}
            list="category-list"
            placeholder="例: 散弾、ライフル弾"
          />
          <datalist id="category-list">
            {AMMUNITION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="caliber">番径・口径 *</Label>
          <Input
            id="caliber"
            value={data.caliber}
            onChange={(e) => setData('caliber', e.target.value)}
            list="caliber-list"
            placeholder="例: 12番、.308 Winchester"
          />
          <datalist id="caliber-list">
            {COMMON_CALIBERS.map((cal) => (
              <option key={cal} value={cal} />
            ))}
          </datalist>
          {errors.caliber && (
            <p className="text-sm text-red-600">{errors.caliber}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manufacturer">メーカー</Label>
        <Input
          id="manufacturer"
          value={data.manufacturer}
          onChange={(e) => setData('manufacturer', e.target.value)}
          placeholder="例: Federal, Remington"
        />
        {errors.manufacturer && (
          <p className="text-sm text-red-600">{errors.manufacturer}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">備考</Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => setData('notes', e.target.value)}
          placeholder="その他メモ"
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
          {processing ? '保存中...' : isEditing ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  );
}
