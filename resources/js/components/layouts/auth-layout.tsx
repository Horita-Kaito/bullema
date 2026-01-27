import { PropsWithChildren } from 'react';
import { Shield } from 'lucide-react';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Bullema</h1>
              <p className="text-sm text-slate-400">実包管理システム</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <blockquote className="text-xl text-slate-300 leading-relaxed">
            「出納履歴・残高・証憑を一元管理し、<br />
            警察検査に耐える状態を継続的に維持する」
          </blockquote>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              改ざん防止ハッシュチェーン
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              検査モード搭載
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          銃所持許可者向け実包管理システム
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Bullema</h1>
            </div>
            <p className="text-slate-500">実包管理システム</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
