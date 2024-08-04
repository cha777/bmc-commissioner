import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCommission } from '@/hooks/use-commission';

export const EmployeeSelection: FC = () => {
  const { employeeList, onEmployeeSelectionUpdate } = useCommission();

  return (
    <div className='flex items-center justify-between'>
      <span className='text-muted-foreground'>Employee List</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            className='flex gap-2 font-bold'
          >
            <span>{employeeList.filter((employee) => employee.isSelected).length} Employee(s) selected</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-56'
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel>Employees</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {employeeList.map((employee) => (
            <DropdownMenuCheckboxItem
              onSelect={(e) => e.preventDefault()}
              key={employee.id}
              checked={employee.isSelected}
              onCheckedChange={() => onEmployeeSelectionUpdate(employee.id, !employee.isSelected)}
            >
              {employee.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
