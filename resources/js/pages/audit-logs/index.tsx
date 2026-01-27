import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AuditLog, PaginatedResponse } from '@/types/models';
import { ChevronLeft, ChevronRight, History, FileEdit, Trash2, LogIn, LogOut } from 'lucide-react';

interface Props {
  logs: PaginatedResponse<AuditLog>;
}

const ACTION_LABELS: Record<string, string> = {
  create: '作成',
  update: '更新',
  delete: '削除',
  login: 'ログイン',
  logout: 'ログアウト',
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-rose-100 text-rose-700',
  login: 'bg-purple-100 text-purple-700',
  logout: 'bg-slate-100 text-slate-700',
};

const ACTION_ICONS: Record<string, typeof History> = {
  create: FileEdit,
  update: FileEdit,
  delete: Trash2,
  login: LogIn,
  logout: LogOut,
};

export default function AuditLogsIndex({ logs }: Props) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout title="監査ログ">
      <Head title="監査ログ" />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">監査ログ</h1>
          <p className="text-sm text-slate-500 mt-1">システム操作履歴</p>
        </div>

        {logs.data.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <History className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500">監査ログがありません</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile view */}
            <div className="md:hidden space-y-3">
              {logs.data.map((log) => {
                const Icon = ACTION_ICONS[log.action] || History;
                return (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="secondary"
                              className={`${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700'} text-xs`}
                            >
                              {ACTION_LABELS[log.action] || log.action}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {formatDateShort(log.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 truncate">
                            {log.auditable_type.split('\\').pop()}
                            {log.auditable_id && ` #${log.auditable_id}`}
                          </p>
                          {log.ip_address && (
                            <p className="text-xs text-slate-400 font-mono mt-1">
                              {log.ip_address}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Desktop view */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-semibold">日時</TableHead>
                      <TableHead className="font-semibold">操作</TableHead>
                      <TableHead className="font-semibold">対象</TableHead>
                      <TableHead className="font-semibold">IPアドレス</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.data.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50">
                        <TableCell className="whitespace-nowrap text-slate-600">
                          {formatDateTime(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700'}
                          >
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {log.auditable_type.split('\\').pop()}
                            {log.auditable_id && ` #${log.auditable_id}`}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 font-mono text-sm">
                          {log.ip_address || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Pagination */}
        {logs.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={logs.current_page <= 1}
              className={logs.current_page <= 1 ? 'opacity-50 pointer-events-none' : ''}
            >
              <Link href={`/audit-logs?page=${logs.current_page - 1}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                前へ
              </Link>
            </Button>
            <span className="text-sm text-slate-500 px-3">
              {logs.current_page} / {logs.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={logs.current_page >= logs.last_page}
              className={logs.current_page >= logs.last_page ? 'opacity-50 pointer-events-none' : ''}
            >
              <Link href={`/audit-logs?page=${logs.current_page + 1}`}>
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
