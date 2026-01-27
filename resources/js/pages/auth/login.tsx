import { Head, useForm } from '@inertiajs/react';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormEvent } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <AuthLayout>
      <Head title="ログイン" />

      <Card className="border-0 shadow-xl shadow-slate-200/50">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">ログイン</CardTitle>
          <CardDescription className="text-center">
            アカウント情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                メールアドレス
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  autoComplete="email"
                  autoFocus
                  className="pl-10 h-11"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                パスワード
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  autoComplete="current-password"
                  className="pl-10 h-11"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="remember" className="text-sm font-normal text-slate-600">
                ログイン状態を保持する
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-md shadow-primary/20"
              disabled={processing}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ログイン中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  ログイン
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
