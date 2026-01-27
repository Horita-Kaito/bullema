import { PropsWithChildren } from 'react';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bullema</h1>
          <p className="text-gray-600 mt-2">実包管理システム</p>
        </div>
        {children}
      </div>
    </div>
  );
}
