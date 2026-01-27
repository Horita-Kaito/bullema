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
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
              active
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                active ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="text-xl font-semibold">Bullema</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <NavLinks />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <span className="text-xl font-semibold">Bullema</span>
          </div>
          <NavLinks />
        </div>
      </div>
    </>
  );
}
