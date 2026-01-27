import { Head } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AmmunitionTypeForm } from '@/features/ammunition-types/components/ammunition-type-form';

export default function AmmunitionTypesCreate() {
  return (
    <AppLayout title="実包マスタ登録">
      <Head title="実包マスタ登録" />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>実包マスタ登録</CardTitle>
            <CardDescription>
              新しい実包の種別・口径を登録します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AmmunitionTypeForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
