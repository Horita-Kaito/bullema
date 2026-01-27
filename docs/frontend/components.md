# コンポーネント設計

## 設計方針

1. **shadcn/ui（Radix UI）を尊重** - UIプリミティブはshadcn/uiを使用
2. **機能ベース（Feature-based）** - 機能単位でコンポーネントをグループ化
3. **コンポジション優先** - 小さなコンポーネントを組み合わせて構築
4. **型安全** - TypeScriptで厳密に型定義

## ディレクトリ構成

```
resources/js/components/
├── ui/                    # shadcn/ui コンポーネント（Radix UIベース）
├── layouts/               # レイアウトコンポーネント
├── shared/                # 複数機能で共有するコンポーネント
│
resources/js/features/     # 機能モジュール
├── ammunition-types/      # 実包マスタ
├── transactions/          # 出納イベント
├── balances/              # 残高
├── attachments/           # 証憑
├── reports/               # 帳簿出力
├── inspection/            # 検査モード
└── audit-logs/            # 監査ログ
```

---

## shadcn/ui コンポーネント（components/ui/）

Radix UIをベースにしたshadcn/uiコンポーネント。
`npx shadcn@latest add <component>` でインストール。

### 必要なコンポーネント一覧

| コンポーネント | 用途 |
|----------------|------|
| button | ボタン全般 |
| input | テキスト入力 |
| label | ラベル |
| textarea | 複数行テキスト |
| select | セレクトボックス |
| checkbox | チェックボックス |
| radio-group | ラジオボタン |
| form | フォームバリデーション（react-hook-form連携） |
| card | カード表示 |
| table | テーブル表示 |
| dialog | モーダルダイアログ |
| alert-dialog | 確認ダイアログ |
| sheet | サイドシート |
| tabs | タブ切り替え |
| badge | バッジ表示 |
| alert | アラートメッセージ |
| toast / toaster | トースト通知 |
| popover | ポップオーバー |
| calendar | カレンダー |
| date-picker | 日付選択（カスタム） |
| dropdown-menu | ドロップダウンメニュー |
| separator | 区切り線 |
| skeleton | ローディングスケルトン |
| tooltip | ツールチップ |
| scroll-area | スクロールエリア |

### 使用例

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>タイトル</CardTitle>
        <CardDescription>説明文</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="name">名前</Label>
          <Input id="name" placeholder="入力してください" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>保存</Button>
      </CardFooter>
    </Card>
  );
}
```

---

## レイアウトコンポーネント（components/layouts/）

### AppLayout

メインアプリケーションのレイアウト。

```tsx
// components/layouts/app-layout.tsx
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
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### InspectionLayout

検査モード用の簡素なレイアウト。

```tsx
// components/layouts/inspection-layout.tsx
import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export function InspectionLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* ヘッダー（印刷時非表示） */}
      <header className="bg-blue-900 text-white py-4 px-6 print:hidden">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">実包管理帳簿</h1>
            <p className="text-sm text-blue-200">検査モード</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {format(new Date(), 'yyyy年MM月dd日', { locale: ja })}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-blue-800"
              onClick={() => window.print()}
            >
              印刷
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/">通常モードに戻る</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <nav className="bg-white border-b print:hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            <TabLink href="/inspection/balance">現在残高</TabLink>
            <TabLink href="/inspection/ledger">出納帳簿</TabLink>
            <TabLink href="/inspection/attachments">証憑一覧</TabLink>
          </div>
        </div>
      </nav>

      {/* コンテンツ */}
      <main className="max-w-7xl mx-auto p-6 print:p-0">
        {children}
      </main>
    </div>
  );
}
```

---

## 共有コンポーネント（components/shared/）

### DataTable

汎用データテーブル。@tanstack/react-table を使用。

```tsx
// components/shared/data-table/data-table.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
  };
  onPaginationChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={onPaginationChange}
        />
      )}
    </div>
  );
}
```

### DateRangePicker

期間選択コンポーネント。

```tsx
// components/shared/date-range-picker.tsx
import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, 'yyyy/MM/dd', { locale: ja })} -{' '}
                {format(value.to, 'yyyy/MM/dd', { locale: ja })}
              </>
            ) : (
              format(value.from, 'yyyy/MM/dd', { locale: ja })
            )
          ) : (
            '期間を選択'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          locale={ja}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
```

### FileUploader

ファイルアップロードコンポーネント。

```tsx
// components/shared/file-uploader.tsx
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
}

export function FileUploader({
  value,
  onChange,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf'],
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange([...value, ...acceptedFiles].slice(0, maxFiles));
    },
    [value, onChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - value.length,
    maxSize,
  });

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          ファイルをドラッグ＆ドロップ、またはクリックして選択
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, PDF（最大10MB、{maxFiles}ファイルまで）
        </p>
      </div>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded"
            >
              {file.type.startsWith('image/') ? (
                <Image className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="flex-1 text-sm truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 機能コンポーネント（features/）

### transactions/components/transaction-form/

出納イベント登録フォーム。イベント種別に応じて動的にフィールドを切り替え。

```tsx
// features/transactions/components/transaction-form/transaction-form.tsx
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AmmunitionTypeSelect } from '@/features/ammunition-types/components/ammunition-type-select';
import { AcquisitionFields } from './acquisition-fields';
import { ConsumptionFields } from './consumption-fields';
import { TransferFields } from './transfer-fields';
import { DisposalFields } from './disposal-fields';
import { FileUploader } from '@/components/shared/file-uploader';
import { AmmunitionType } from '@/types/models';
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '../../constants';

const baseSchema = z.object({
  ammunition_type_id: z.number({ required_error: '実包種別を選択してください' }),
  event_type: z.enum(EVENT_TYPES, { required_error: 'イベント種別を選択してください' }),
  quantity: z.number().min(1, '数量は1以上を入力してください'),
  event_date: z.string().min(1, '発生日を入力してください'),
  notes: z.string().optional(),
  attachments: z.array(z.instanceof(File)).optional(),
});

interface TransactionFormProps {
  ammunitionTypes: AmmunitionType[];
}

export function TransactionForm({ ammunitionTypes }: TransactionFormProps) {
  const form = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      event_type: undefined,
      quantity: undefined,
      event_date: new Date().toISOString().split('T')[0],
      notes: '',
      attachments: [],
    },
  });

  const eventType = form.watch('event_type');

  const onSubmit = (data: z.infer<typeof baseSchema>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachments' && Array.isArray(value)) {
        value.forEach((file) => formData.append('attachments[]', file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    router.post('/transactions', formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 共通フィールド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="ammunition_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>実包種別</FormLabel>
                <FormControl>
                  <AmmunitionTypeSelect
                    value={field.value}
                    onChange={field.onChange}
                    ammunitionTypes={ammunitionTypes}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>イベント種別</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {EVENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>数量</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>発生日</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* イベント種別に応じた追加フィールド */}
        {eventType === 'acquisition' && <AcquisitionFields form={form} />}
        {eventType === 'consumption' && <ConsumptionFields form={form} />}
        {eventType === 'transfer' && <TransferFields form={form} />}
        {eventType === 'disposal' && <DisposalFields form={form} />}

        {/* 備考 */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>備考</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 証憑アップロード */}
        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>証憑</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => history.back()}>
            キャンセル
          </Button>
          <Button type="submit">登録</Button>
        </div>
      </form>
    </Form>
  );
}
```

### transactions/components/event-type-badge.tsx

イベント種別を表示するバッジ。

```tsx
// features/transactions/components/event-type-badge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EventType } from '../types';
import { EVENT_TYPE_LABELS } from '../constants';

const variants: Record<EventType, string> = {
  acquisition: 'bg-green-100 text-green-800 hover:bg-green-100',
  consumption: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  transfer: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  disposal: 'bg-red-100 text-red-800 hover:bg-red-100',
  custody_out: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  custody_return: 'bg-teal-100 text-teal-800 hover:bg-teal-100',
  correction: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

interface EventTypeBadgeProps {
  type: EventType;
  className?: string;
}

export function EventTypeBadge({ type, className }: EventTypeBadgeProps) {
  return (
    <Badge variant="secondary" className={cn(variants[type], className)}>
      {EVENT_TYPE_LABELS[type]}
    </Badge>
  );
}
```

---

## 型定義（types/）

### models.ts

```typescript
// types/models.ts

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AmmunitionType {
  id: number;
  user_id: number;
  category: string;
  caliber: string;
  manufacturer: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EventType =
  | 'acquisition'
  | 'consumption'
  | 'transfer'
  | 'disposal'
  | 'custody_out'
  | 'custody_return'
  | 'correction';

export interface TransactionEvent {
  id: number;
  user_id: number;
  ammunition_type_id: number;
  event_type: EventType;
  quantity: number;
  event_date: string;
  notes: string | null;
  location: string | null;
  counterparty_name: string | null;
  counterparty_address: string | null;
  counterparty_permit_number: string | null;
  disposal_method: string | null;
  correction_reason: string | null;
  original_event_id: number | null;
  record_hash: string;
  previous_hash: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  ammunition_type?: AmmunitionType;
  attachments?: Attachment[];
  original_event?: TransactionEvent;
}

export interface Attachment {
  id: number;
  transaction_event_id: number;
  file_path: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  file_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  auditable_type: string;
  auditable_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  url: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Balance {
  ammunition_type: AmmunitionType;
  balance: number;
}
```
