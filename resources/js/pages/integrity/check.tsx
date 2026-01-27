import { Head } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import { EventType } from '@/types/models';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface IntegrityResult {
  id: number;
  event_date: string;
  event_type: EventType;
  hash_valid: boolean;
  chain_valid: boolean;
  valid: boolean;
}

interface Props {
  results: IntegrityResult[];
  isValid: boolean;
  totalRecords: number;
  checkedAt: string;
}

export default function IntegrityCheck({ results, isValid, totalRecords, checkedAt }: Props) {
  const invalidCount = results.filter((r) => !r.valid).length;

  return (
    <AppLayout>
      <Head title="整合性チェック" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">データ整合性チェック</h1>
          <p className="text-muted-foreground">
            ハッシュチェーンによる改ざん検知
          </p>
        </div>

        {/* Summary card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isValid ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-600">全データ正常</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-600">整合性エラーを検出</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">総レコード数</dt>
                <dd className="text-2xl font-bold">{totalRecords}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">正常</dt>
                <dd className="text-2xl font-bold text-green-600">
                  {totalRecords - invalidCount}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">エラー</dt>
                <dd className="text-2xl font-bold text-red-600">{invalidCount}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">検証日時</dt>
                <dd className="text-sm font-medium">{checkedAt}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Results table */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>検証結果詳細</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>日付</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead>ハッシュ</TableHead>
                    <TableHead>チェーン</TableHead>
                    <TableHead>結果</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow
                      key={result.id}
                      className={!result.valid ? 'bg-red-50' : undefined}
                    >
                      <TableCell className="font-mono">#{result.id}</TableCell>
                      <TableCell>{formatDate(result.event_date)}</TableCell>
                      <TableCell>{EVENT_TYPE_LABELS[result.event_type]}</TableCell>
                      <TableCell>
                        {result.hash_valid ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            NG
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {result.chain_valid ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            NG
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {result.valid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Explanation */}
        <Card>
          <CardContent className="py-4">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                ハッシュチェーンは各出納記録のSHA-256ハッシュを連鎖的に計算することで、
                過去のデータ改ざんを検出します。エラーが検出された場合は、
                データベースの不正な変更が疑われます。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
