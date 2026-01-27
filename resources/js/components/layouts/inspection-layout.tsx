import { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

interface TabLinkProps {
  href: string;
  children: React.ReactNode;
}

function TabLink({ href, children }: TabLinkProps) {
  const { url } = usePage();
  const isActive = url === href;

  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      {children}
    </Link>
  );
}

export function InspectionLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Header (hidden on print) */}
      <header className="bg-blue-900 text-white py-4 px-6 print:hidden">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">実包管理帳簿</h1>
            <p className="text-sm text-blue-200">検査モード</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{formatDate(new Date())}</span>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-blue-800"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-1" />
              印刷
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                通常モードに戻る
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab navigation (hidden on print) */}
      <nav className="bg-white border-b print:hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            <TabLink href="/inspection">概要</TabLink>
            <TabLink href="/inspection/balance">現在残高</TabLink>
            <TabLink href="/inspection/ledger">出納帳簿</TabLink>
            <TabLink href="/inspection/attachments">証憑一覧</TabLink>
          </div>
        </div>
      </nav>

      {/* Print header (visible only on print) */}
      <div className="hidden print:block p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">実包管理帳簿</h1>
            <p className="text-sm text-gray-600">出力日: {formatDate(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6 print:p-0 print:max-w-none">
        {children}
      </main>
    </div>
  );
}
