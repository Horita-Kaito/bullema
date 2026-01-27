import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AmmunitionType, PaginatedResponse } from '@/types/models';
import { Pencil, Power, PowerOff, Package, ChevronRight } from 'lucide-react';

interface AmmunitionTypeTableProps {
  ammunitionTypes: PaginatedResponse<AmmunitionType>;
}

export function AmmunitionTypeTable({ ammunitionTypes }: AmmunitionTypeTableProps) {
  const handleToggleActive = (ammunitionType: AmmunitionType) => {
    if (confirm(ammunitionType.is_active ? '無効化しますか？' : '有効化しますか？')) {
      router.put(`/ammunition-types/${ammunitionType.id}`, {
        ...ammunitionType,
        is_active: !ammunitionType.is_active,
      });
    }
  };

  if (ammunitionTypes.data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Package className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-500">実包マスタが登録されていません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {ammunitionTypes.data.map((ammunitionType) => (
          <Card key={ammunitionType.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">
                        {ammunitionType.caliber}
                      </p>
                      {ammunitionType.is_active ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs flex-shrink-0">
                          有効
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs flex-shrink-0">
                          無効
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {ammunitionType.category}
                      {ammunitionType.manufacturer && ` / ${ammunitionType.manufacturer}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                    <Link href={`/ammunition-types/${ammunitionType.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleToggleActive(ammunitionType)}
                  >
                    {ammunitionType.is_active ? (
                      <PowerOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Power className="h-4 w-4 text-emerald-600" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="font-semibold">種別</TableHead>
              <TableHead className="font-semibold">番径・口径</TableHead>
              <TableHead className="font-semibold">メーカー</TableHead>
              <TableHead className="font-semibold">状態</TableHead>
              <TableHead className="w-[100px] font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ammunitionTypes.data.map((ammunitionType) => (
              <TableRow key={ammunitionType.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">{ammunitionType.category}</TableCell>
                <TableCell>{ammunitionType.caliber}</TableCell>
                <TableCell className="text-slate-500">
                  {ammunitionType.manufacturer || '-'}
                </TableCell>
                <TableCell>
                  {ammunitionType.is_active ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      有効
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                      無効
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/ammunition-types/${ammunitionType.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(ammunitionType)}
                      title={ammunitionType.is_active ? '無効化' : '有効化'}
                    >
                      {ammunitionType.is_active ? (
                        <PowerOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Power className="h-4 w-4 text-emerald-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
