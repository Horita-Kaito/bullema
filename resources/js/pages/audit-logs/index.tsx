import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatDate } from '@/lib/utils';

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
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  login: 'bg-purple-100 text-purple-800',
  logout: 'bg-gray-100 text-gray-800',
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
      second: '2-digit',
    });
  };

  return (
    <AppLayout>
      <Head title="監査ログ" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">監査ログ</h1>
          <p className="text-muted-foreground">システム操作履歴</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {logs.data.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                監査ログがありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日時</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>対象</TableHead>
                    <TableHead>IPアドレス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}
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
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {logs.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            {logs.current_page > 1 && (
              <Button variant="outline" asChild>
                <Link href={`/audit-logs?page=${logs.current_page - 1}`}>
                  前へ
                </Link>
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {logs.current_page} / {logs.last_page} ページ
            </span>
            {logs.current_page < logs.last_page && (
              <Button variant="outline" asChild>
                <Link href={`/audit-logs?page=${logs.current_page + 1}`}>
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
