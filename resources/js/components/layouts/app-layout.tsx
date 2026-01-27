import { PropsWithChildren } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface AppLayoutProps extends PropsWithChildren {
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
