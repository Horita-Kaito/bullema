import { Head, useForm } from '@inertiajs/react';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormEvent } from 'react';

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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          <CardDescription>
            メールアドレスとパスワードを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                autoComplete="email"
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                autoComplete="current-password"
              />
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
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                ログイン状態を保持する
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
