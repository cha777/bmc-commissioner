import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/data-table';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { useDialogDrawer } from '@/hooks/use-dialog-drawer';
import { EditForm } from './edit-commission-band';
import { DeleteForm } from './delete-commission-band-form';
import { metadata } from '@/api';
import type { CommissionBand } from '@/types/commission-band';

const Page: FC = () => {
  const [data, setData] = useState<CommissionBand[]>([]);
  const editDialog = useDialogDrawer<CommissionBand>();
  const deleteDialog = useDialogDrawer<CommissionBand>();

  useEffect(() => {
    const getCommissionBands = async () => {
      const data = await metadata.getCommissionBands();
      setData(data);
    };

    getCommissionBands();
  }, []);

  const onSelectEdit = useCallback(
    (band: CommissionBand) => {
      editDialog.handleOpen(band);
    },
    [editDialog]
  );

  const onSelectDelete = useCallback(
    (band: CommissionBand) => {
      deleteDialog.handleOpen(band);
    },
    [deleteDialog]
  );

  const columns: ColumnDef<CommissionBand>[] = useMemo(
    () => [
      {
        accessorKey: 'desc',
        header: 'Range',
      },
      {
        accessorKey: 'rate',
        header: 'Rate',
        cell: ({ row }) => {
          const rate = parseFloat(row.getValue('rate'));
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'percent',
            maximumFractionDigits: 1,
          }).format(rate);

          return formatted;
        },
      },
      {
        accessorKey: 'updated',
        header: 'Updated',
        cell: ({ row }) => {
          const date = new Date(row.getValue('updated'));
          const formatted = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'short',
            timeStyle: 'short',
            hourCycle: 'h12',
          }).format(date);

          return formatted;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const metalType = row.original;

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
                <DropdownMenuItem onClick={() => onSelectEdit(metalType)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectDelete(metalType)}>Delete</DropdownMenuItem>
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
      <div className='mx-auto py-2'>
        <DataTable
          columns={columns}
          data={data}
        />
      </div>
      <ResponsiveDialog
        open={editDialog.open}
        title='Edit Commission Band'
        description={`Make changes to ${editDialog.data?.desc} range. Click save when you're done.`}
        onOpenChange={(open) => !open && editDialog.handleClose()}
      >
        {editDialog.open ? (
          <EditForm
            item={editDialog.data!}
            onComplete={editDialog.handleClose}
          />
        ) : null}
      </ResponsiveDialog>

      <ResponsiveDialog
        open={deleteDialog.open}
        title='Delete Commission Band'
        description={`Are you sure you want to delete ${deleteDialog.data?.desc} range?`}
        onOpenChange={(open) => !open && deleteDialog.handleClose()}
      >
        {deleteDialog.open ? (
          <DeleteForm
            item={deleteDialog.data!}
            onComplete={deleteDialog.handleClose}
          />
        ) : null}
      </ResponsiveDialog>
    </>
  );
};

export default Page;
