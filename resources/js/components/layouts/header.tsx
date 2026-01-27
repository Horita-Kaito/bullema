import { usePage, router } from '@inertiajs/react';
import { LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-slate-900 lg:ml-0 ml-14 tracking-tight">
            {title}
          </h1>
        </div>

        {auth.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-slate-100 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
                  {auth.user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
                  {auth.user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{auth.user.name}</p>
                  <p className="text-xs text-muted-foreground">{auth.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
