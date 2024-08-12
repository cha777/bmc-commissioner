import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/data-table';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { DeleteCommissionForm } from '@/components/history-ui/delete-commission-form';
import { useDialogDrawer } from '@/hooks/use-dialog-drawer';
import { useCommissionHistory } from '@/hooks/use-commission-history';
import { useRouter } from '@/hooks/use-router';
import { paths } from '@/paths';
import type { CommissionHistory } from '@/types/commission';

export const DailyCommissionData: FC = () => {
  const { commissionHistory } = useCommissionHistory();
  const deleteDialog = useDialogDrawer<CommissionHistory>();
  const router = useRouter();

  const onSelectEdit = useCallback(
    (record: CommissionHistory) => {
      router.push(paths.history.edit.replace(':id', record.id));
    },
    [router]
  );

  const onSelectDelete = useCallback(
    (record: CommissionHistory) => {
      deleteDialog.handleOpen(record);
    },
    [deleteDialog]
  );

  const columns: ColumnDef<CommissionHistory>[] = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('date'));
          const formatted = new Intl.DateTimeFormat('en-US').format(date);

          return formatted;
        },
      },
      {
        accessorKey: 'units',
        header: 'Units',
        cell: ({ row }) => {
          const units = parseFloat(row.getValue('units'));
          const formatted = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
          }).format(units);

          return formatted;
        },
      },
      {
        accessorKey: 'totalCommission',
        header: 'Commission',
        cell: ({ row }) => {
          const commission = parseFloat(row.getValue('totalCommission'));
          const formatted = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
          }).format(commission);

          return formatted;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const commissionBand = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0'
                >
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onSelectEdit(commissionBand)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectDelete(commissionBand)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onSelectDelete, onSelectEdit]
  );

  return (
    <>
      <div className='py-2'>
        <DataTable
          columns={columns}
          data={commissionHistory}
        />
      </div>
      {deleteDialog.data && (
        <ResponsiveDialog
          open={deleteDialog.open}
          title='Delete Commission Record'
          description={`Are you sure you want to delete commission record for ${new Intl.DateTimeFormat('en-US').format(new Date(deleteDialog.data.date))}?`}
          onOpenChange={(open) => !open && deleteDialog.handleClose()}
        >
          {deleteDialog.open ? (
            <DeleteCommissionForm
              item={deleteDialog.data!}
              onComplete={deleteDialog.handleClose}
            />
          ) : null}
        </ResponsiveDialog>
      )}
    </>
  );
};
