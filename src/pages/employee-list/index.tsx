import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
import { EditForm } from './edit-employee-form';
import { DeleteForm } from './delete-employee-form';
import { metadata } from '@/api';
import { queryKey } from '@/utils';
import type { Employee } from '@/types/employee';

const Page: FC = () => {
  const query = useQuery({ queryKey: [queryKey.employees], queryFn: metadata.getEmployeeList });

  const editDialog = useDialogDrawer<Employee>();
  const deleteDialog = useDialogDrawer<Employee>();

  const onSelectEdit = useCallback(
    (employee: Employee) => {
      editDialog.handleOpen(employee);
    },
    [editDialog]
  );

  const onSelectDelete = useCallback(
    (employee: Employee) => {
      deleteDialog.handleOpen(employee);
    },
    [deleteDialog]
  );

  const columns: ColumnDef<Employee>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              className='wrap text-ellipsis w-10'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Name
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          );
        },
      },
      {
        accessorKey: 'weight',
        header: 'Weight',
        cell: ({ row }) => {
          const price = parseFloat(row.getValue('weight'));
          const formatted = new Intl.NumberFormat('en-US').format(price);

          return formatted;
        },
      },
      // {
      //   accessorKey: 'isPermanent',
      //   header: 'Permanent',
      // },
      {
        accessorKey: 'updated',
        header: 'Updated',
        cell: ({ row }) => {
          const formatted = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'short',
            timeStyle: 'short',
            hourCycle: 'h12',
          }).format(row.getValue('updated'));

          return formatted;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const employee = row.original;

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
                <DropdownMenuItem onClick={() => onSelectEdit(employee)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectDelete(employee)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onSelectDelete, onSelectEdit]
  );

  if (query.isPending) {
    return <LoadingIndicator message='Fetching data ...' />;
  }

  return (
    <>
      <div className='py-2'>
        <DataTable
          columns={columns}
          data={query.data ?? []}
        />
      </div>
      <ResponsiveDialog
        open={editDialog.open}
        title='Edit Employee Details'
        description={`Make changes to employee: ${editDialog.data?.name}. Click save when you're done.`}
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
        title='Delete Employee'
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
