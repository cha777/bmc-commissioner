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
import type { EmployeeCommission } from '@/types/commission';
import type { Employee } from '@/types/employee';

interface EmployeeSelectionProps {
  employeeList: (EmployeeCommission & {
    isSelected: boolean;
  })[];
  onEmployeeSelectionUpdate: (id: Employee['id'], isSelected: boolean) => void;
}

export const EmployeeSelection: FC<EmployeeSelectionProps> = ({ employeeList, onEmployeeSelectionUpdate }) => {
  return (
    <div className='flex items-center justify-between'>
      <span className='text-muted-foreground'>Employee List</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            className='flex gap-2 font-bold'
          >
            <span>{employeeList.filter((employee) => employee.isSelected).length} selected</span>
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
