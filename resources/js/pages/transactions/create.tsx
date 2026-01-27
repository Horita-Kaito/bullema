import { Head } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionForm } from '@/features/transactions/components/transaction-form/transaction-form';
import { AmmunitionType } from '@/types/models';

interface Props {
  ammunitionTypes: AmmunitionType[];
}

export default function TransactionsCreate({ ammunitionTypes }: Props) {
  return (
    <AppLayout>
      <Head title="出納登録" />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>出納登録</CardTitle>
            <CardDescription>
              実包の譲受・消費・譲渡・廃棄などを記録します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm ammunitionTypes={ammunitionTypes} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
