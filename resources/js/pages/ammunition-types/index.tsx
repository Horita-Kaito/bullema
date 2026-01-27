import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { AmmunitionTypeTable } from '@/features/ammunition-types/components/ammunition-type-table';
import { AmmunitionType, PaginatedResponse } from '@/types/models';
import { Plus } from 'lucide-react';

interface Props {
  ammunitionTypes: PaginatedResponse<AmmunitionType>;
  filters: {
    show_inactive?: boolean;
  };
}

export default function AmmunitionTypesIndex({ ammunitionTypes }: Props) {
  return (
    <AppLayout title="実包マスタ">
      <Head title="実包マスタ" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">実包マスタ</h1>
            <p className="text-sm text-slate-500 mt-1">
              実包の種別・口径を管理します
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/ammunition-types/create">
              <Plus className="h-4 w-4 mr-2" />
              新規登録
            </Link>
          </Button>
        </div>

        <AmmunitionTypeTable ammunitionTypes={ammunitionTypes} />
      </div>
    </AppLayout>
  );
}
