# React + Inertia.js開発スキル

## 概要

このスキルはReact + Inertia.js + shadcn/uiでのフロントエンド開発を支援します。

## ページコンポーネント作成

```tsx
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ExampleTable } from '@/features/examples/components/example-table';
import type { PaginatedResponse } from '@/types/api';
import type { Example } from '@/types/models';

interface Props {
  examples: PaginatedResponse<Example>;
}

export default function ExamplesIndex({ examples }: Props) {
  return (
    <AppLayout title="一覧">
      <Head title="一覧" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">一覧</h1>
          <Button asChild>
            <Link href="/examples/create">
              <PlusIcon className="mr-2 h-4 w-4" />
              新規登録
            </Link>
          </Button>
        </div>

        <ExampleTable data={examples.data} />
      </div>
    </AppLayout>
  );
}
```

## フォームコンポーネント作成

```tsx
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExampleFormProps {
  initialData?: {
    name: string;
    description: string;
  };
  submitUrl: string;
  method?: 'post' | 'put';
}

export function ExampleForm({
  initialData,
  submitUrl,
  method = 'post',
}: ExampleFormProps) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'post') {
      post(submitUrl);
    } else {
      put(submitUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => setData('description', e.target.value)}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => history.back()}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={processing}>
          {processing ? '処理中...' : '保存'}
        </Button>
      </div>
    </form>
  );
}
```

## react-hook-form + zodでのフォーム作成

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  name: z.string().min(1, '名前は必須です').max(255),
  email: z.string().email('有効なメールアドレスを入力してください'),
});

type FormData = z.infer<typeof schema>;

export function ExampleZodForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = (data: FormData) => {
    router.post('/examples', data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">保存</Button>
      </form>
    </Form>
  );
}
```

## 機能コンポーネント作成

```tsx
// features/examples/components/example-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import type { Example } from '@/types/models';

interface ExampleTableProps {
  data: Example[];
}

export function ExampleTable({ data }: ExampleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名前</TableHead>
          <TableHead>説明</TableHead>
          <TableHead className="w-[100px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/examples/${item.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## カスタムフック作成

```tsx
// hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## 型定義

```typescript
// types/models.ts
export interface Example {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// types/api.ts
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
```
