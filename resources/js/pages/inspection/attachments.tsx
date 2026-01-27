import { Head } from '@inertiajs/react';
import { InspectionLayout } from '@/components/layouts/inspection-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Attachment, TransactionEvent } from '@/types/models';
import { formatDate } from '@/lib/utils';
import { Download, FileText, Image } from 'lucide-react';
import { EVENT_TYPE_LABELS } from '@/lib/constants';

interface AttachmentWithTransaction extends Attachment {
  transaction_event: TransactionEvent;
}

interface Props {
  attachments: AttachmentWithTransaction[];
  printDate: string;
}

export default function InspectionAttachments({ attachments, printDate }: Props) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <InspectionLayout>
      <Head title="検査モード - 証憑一覧" />

      <div className="space-y-6">
        <div className="print:hidden">
          <h2 className="text-xl font-bold">証憑一覧</h2>
          <p className="text-muted-foreground">
            添付された領収書・証明書等
          </p>
        </div>

        {/* Print title */}
        <div className="hidden print:block">
          <h2 className="text-xl font-bold">証憑添付一覧</h2>
          <p className="text-sm text-muted-foreground">
            作成日時: {printDate}
          </p>
        </div>

        {attachments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              添付ファイルがありません
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>添付ファイル ({attachments.length}件)</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-semibold">ファイル名</th>
                    <th className="text-left py-3 font-semibold">関連出納</th>
                    <th className="text-left py-3 font-semibold">出納日</th>
                    <th className="text-right py-3 font-semibold">サイズ</th>
                    <th className="text-left py-3 font-semibold print:hidden">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {attachments.map((attachment) => (
                    <tr key={attachment.id} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(attachment.mime_type)}
                          <span className="truncate max-w-[200px]">
                            {attachment.original_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm">
                          {EVENT_TYPE_LABELS[attachment.transaction_event.event_type]}
                        </span>
                        {attachment.transaction_event.ammunition_type && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({attachment.transaction_event.ammunition_type.category})
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {formatDate(attachment.transaction_event.event_date)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {formatFileSize(attachment.file_size)}
                      </td>
                      <td className="py-3 print:hidden">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/attachments/${attachment.id}/download`}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* File hash verification note */}
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              各ファイルにはSHA-256ハッシュが付与されており、改ざん検知が可能です。
            </p>
          </CardContent>
        </Card>

        {/* Signature area for print */}
        <div className="hidden print:block mt-12">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="border-b border-black pb-8 mb-2"></p>
              <p className="text-sm text-center">所持許可者署名</p>
            </div>
            <div>
              <p className="border-b border-black pb-8 mb-2"></p>
              <p className="text-sm text-center">確認者署名</p>
            </div>
          </div>
        </div>
      </div>
    </InspectionLayout>
  );
}
