import type { FC, ChangeEvent } from 'react';
import { useCallback } from 'react';
import numeral from 'numeral';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCommission } from '@/hooks/use-commission';
import type { MetalType } from '@/types/metal-type';

export const MetalUnitsTable: FC = () => {
  const { metalTypesList, onMetalQtyUpdate } = useCommission();

  const handleQtyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, id: MetalType['id']) => {
      const qty = parseInt(e.target.value, 10) || 0;
      onMetalQtyUpdate(id, qty);
    },
    [onMetalQtyUpdate]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[100px] pl-0'>SKU</TableHead>
          <TableHead>Qty.</TableHead>
          <TableHead className='pr-0'>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metalTypesList.map((metalType) => (
          <TableRow key={metalType.id}>
            <TableCell className='pl-0'>
              <div className='font-medium'>{metalType.name}</div>
              <div className='text-sm text-muted-foreground'>{numeral(metalType.price).format('0,0.00')}</div>
            </TableCell>
            <TableCell>
              <Label
                htmlFor={`${metalType.id}-qty`}
                className='sr-only'
              >
                Stock
              </Label>
              <Input
                id={`${metalType.id}-qty`}
                type='number'
                value={metalType.qty}
                onChange={(e) => handleQtyChange(e, metalType.id)}
              />
            </TableCell>
            <TableCell className='pr-0'>{numeral(metalType.price * metalType.qty).format('0,0.00')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
