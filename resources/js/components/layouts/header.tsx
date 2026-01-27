import { Link, usePage, router } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageProps } from '@/types/index.d';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { auth } = usePage<PageProps>().props;

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 lg:ml-0 ml-12">
            {title}
          </h1>
        </div>

        {auth.user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              <span>{auth.user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              ログアウト
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
