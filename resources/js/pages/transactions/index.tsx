import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { TransactionTable } from '@/features/transactions/components/transaction-table';
import { TransactionEvent, PaginatedResponse } from '@/types/models';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  transactions: PaginatedResponse<TransactionEvent>;
}

export default function TransactionsIndex({ transactions }: Props) {
  return (
    <AppLayout title="出納管理">
      <Head title="出納履歴" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">出納管理</h1>
            <p className="text-sm text-slate-500 mt-1">実包の出納記録一覧</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
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
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={transactions.current_page <= 1}
              className={transactions.current_page <= 1 ? 'opacity-50 pointer-events-none' : ''}
            >
              <Link href={`/transactions?page=${transactions.current_page - 1}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                前へ
              </Link>
            </Button>
            <span className="text-sm text-slate-500 px-3">
              {transactions.current_page} / {transactions.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={transactions.current_page >= transactions.last_page}
              className={transactions.current_page >= transactions.last_page ? 'opacity-50 pointer-events-none' : ''}
            >
              <Link href={`/transactions?page=${transactions.current_page + 1}`}>
                次へ
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
