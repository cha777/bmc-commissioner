import { useCallback } from 'react';
import type { FC, FocusEvent } from 'react';
import { NumericFormat } from 'react-number-format';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { EmployeeCommission } from '@/types/commission';
import type { Employee } from '@/types/employee';

interface EmployeeSelectionProps {
  employeeList: (EmployeeCommission & {
    isSelected: boolean;
  })[];
  onEmployeeSelectionUpdate: (id: Employee['id'], isSelected: boolean) => void;
  idleEmployeeCount?: number;
  onIdleEmployeeCountUpdate: (value: number) => void;
}

export const EmployeeSelection: FC<EmployeeSelectionProps> = ({
  employeeList,
  onEmployeeSelectionUpdate,
  idleEmployeeCount,
  onIdleEmployeeCountUpdate,
}) => {
  const handleFocusIn = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  return (
    <>
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
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground'>Idle Employee count</span>
        <NumericFormat
          value={idleEmployeeCount}
          onValueChange={(values) => onIdleEmployeeCountUpdate(values.floatValue || 0)}
          onFocus={handleFocusIn}
          customInput={Input}
          className='text-right w-20'
          allowNegative={false}
          decimalScale={0}
          defaultValue={0}
        />
      </div>
    </>
  );
};
