import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AmmunitionType, PaginatedResponse } from '@/types/models';
import { Pencil, Power, PowerOff } from 'lucide-react';

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>種別</TableHead>
            <TableHead>番径・口径</TableHead>
            <TableHead>メーカー</TableHead>
            <TableHead>状態</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ammunitionTypes.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                実包マスタが登録されていません
              </TableCell>
            </TableRow>
          ) : (
            ammunitionTypes.data.map((ammunitionType) => (
              <TableRow key={ammunitionType.id}>
                <TableCell className="font-medium">{ammunitionType.category}</TableCell>
                <TableCell>{ammunitionType.caliber}</TableCell>
                <TableCell>{ammunitionType.manufacturer || '-'}</TableCell>
                <TableCell>
                  {ammunitionType.is_active ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      有効
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
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
                        <PowerOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Power className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
