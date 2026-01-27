import { Head } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Info } from 'lucide-react';
import { useState } from 'react';

export default function ReportsIndex() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(today);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return params.toString();
  };

  return (
    <AppLayout title="帳簿出力">
      <Head title="帳簿出力" />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">帳簿出力</h1>
          <p className="text-sm text-slate-500 mt-1">出納帳簿をPDFまたはCSV形式で出力</p>
        </div>

        {/* Date range selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-slate-500" />
              出力期間
            </CardTitle>
            <CardDescription>
              出力する出納記録の期間を指定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-slate-700">開始日</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="h-11"
                />
                <p className="text-xs text-slate-400">
                  空欄の場合、最初の記録から
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-slate-700">終了日</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={today}
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                PDF出力
              </CardTitle>
              <CardDescription className="text-indigo-100">
                印刷に適したPDF形式の帳簿
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild className="w-full h-11">
                <a
                  href={`/reports/pdf?${buildQueryString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDFをダウンロード
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                CSV出力
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Excel等で編集可能なCSV形式
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button variant="outline" asChild className="w-full h-11">
                <a href={`/reports/csv?${buildQueryString()}`} download>
                  <Download className="h-4 w-4 mr-2" />
                  CSVをダウンロード
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                出力された帳簿には、選択した期間内のすべての出納記録が含まれます。
                警察検査用には「検査モード」からの印刷をお勧めします。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
