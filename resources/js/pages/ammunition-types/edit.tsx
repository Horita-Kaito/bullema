import { Head } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AmmunitionTypeForm } from '@/features/ammunition-types/components/ammunition-type-form';
import { AmmunitionType } from '@/types/models';

interface Props {
  ammunitionType: AmmunitionType;
}

export default function AmmunitionTypesEdit({ ammunitionType }: Props) {
  return (
    <AppLayout title="実包マスタ編集">
      <Head title="実包マスタ編集" />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>実包マスタ編集</CardTitle>
            <CardDescription>
              {ammunitionType.category} / {ammunitionType.caliber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AmmunitionTypeForm ammunitionType={ammunitionType} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
