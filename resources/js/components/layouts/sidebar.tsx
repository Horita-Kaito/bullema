import { Link, usePage } from '@inertiajs/react';
import {
  Home,
  Package,
  ArrowLeftRight,
  Calculator,
  FileText,
  ClipboardCheck,
  History,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: typeof Home;
}

const navigation: NavItem[] = [
  { name: 'ダッシュボード', href: '/', icon: Home },
  { name: '実包マスタ', href: '/ammunition-types', icon: Package },
  { name: '出納管理', href: '/transactions', icon: ArrowLeftRight },
  { name: '残高照会', href: '/balances', icon: Calculator },
  { name: '帳簿出力', href: '/reports', icon: FileText },
  { name: '検査モード', href: '/inspection', icon: ClipboardCheck },
  { name: '監査ログ', href: '/audit-logs', icon: History },
];

export function Sidebar() {
  const { url } = usePage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return url === '/';
    }
    return url.startsWith(href);
  };

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-6 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              active
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
              )}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  const Logo = () => (
    <div className="flex items-center gap-3 px-4">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
        <Shield className="h-5 w-5 text-white" />
      </div>
      <div>
        <span className="text-lg font-bold text-white tracking-tight">Bullema</span>
        <p className="text-[10px] text-slate-400 -mt-0.5">実包管理システム</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="bg-white shadow-md border-slate-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 to-slate-800 transform transition-transform duration-300 ease-out shadow-2xl',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <NavLinks />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="flex items-center h-16 flex-shrink-0 border-b border-white/10">
            <Logo />
          </div>
          <NavLinks />

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="px-3 py-2 rounded-lg bg-white/5">
              <p className="text-xs text-slate-400">
                警察検査対応
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                改ざん防止ハッシュチェーン搭載
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
