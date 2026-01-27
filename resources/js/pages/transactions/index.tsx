import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { TransactionTable } from '@/features/transactions/components/transaction-table';
import { TransactionEvent, PaginatedResponse } from '@/types/models';
import { Plus } from 'lucide-react';

interface Props {
  transactions: PaginatedResponse<TransactionEvent>;
}

export default function TransactionsIndex({ transactions }: Props) {
  return (
    <AppLayout>
      <Head title="出納履歴" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">出納履歴</h1>
            <p className="text-muted-foreground">実包の出納記録一覧</p>
          </div>
          <Button asChild>
            <Link href="/transactions/create">
              <Plus className="h-4 w-4 mr-2" />
              新規登録
            </Link>
          </Button>
        </div>

        <TransactionTable transactions={transactions} />

        {/* Pagination */}
        {transactions.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            {transactions.current_page > 1 && (
              <Button variant="outline" asChild>
                <Link href={`/transactions?page=${transactions.current_page - 1}`}>
                  前へ
                </Link>
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {transactions.current_page} / {transactions.last_page} ページ
            </span>
            {transactions.current_page < transactions.last_page && (
              <Button variant="outline" asChild>
                <Link href={`/transactions?page=${transactions.current_page + 1}`}>
                  次へ
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
