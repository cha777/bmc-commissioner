import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
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
import { LoadingIndicator } from '@/components/loading-indicator';
import { EditForm } from './edit-metal-form';
import { DeleteForm } from './delete-metal-form';
import { metadata } from '@/api';
import type { MetalType } from '@/types/metal-type';

const Page: FC = () => {
  const [data, setData] = useState<MetalType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const editDialog = useDialogDrawer<MetalType>();
  const deleteDialog = useDialogDrawer<MetalType>();

  useEffect(() => {
    const getMetalTypeList = async () => {
      setIsLoading(true);

      const data = await metadata.getMetalTypesList();
      setData(data);
      setIsLoading(false);
    };

    getMetalTypeList();
  }, []);

  const onSelectEdit = useCallback(
    (metalType: MetalType) => {
      editDialog.handleOpen(metalType);
    },
    [editDialog]
  );

  const onSelectDelete = useCallback(
    (metalType: MetalType) => {
      deleteDialog.handleOpen(metalType);
    },
    [deleteDialog]
  );

  const columns: ColumnDef<MetalType>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              className='wrap w-10'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Name
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => {
          const price = parseFloat(row.getValue('price'));
          const formatted = new Intl.NumberFormat('en-US').format(price);

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
                <DropdownMenuItem onClick={() => onSelectEdit(metalType)}>Edit Price</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectDelete(metalType)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onSelectDelete, onSelectEdit]
  );

  if (isLoading) {
    return <LoadingIndicator message='Fetching data ...' />;
  }

  return (
    <>
      <div className='py-2'>
        <DataTable
          columns={columns}
          data={data}
        />
      </div>
      <ResponsiveDialog
        open={editDialog.open}
        title='Edit Price'
        description={`Make changes to ${editDialog.data?.name} price. Click save when you're done.`}
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
        title='Delete Metal Type'
        description={`Are you sure you want to delete ${deleteDialog.data?.name}?`}
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
