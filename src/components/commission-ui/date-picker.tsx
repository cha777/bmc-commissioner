import type { FC } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useCommission } from '@/hooks/use-commission';

export const DatePicker: FC = () => {
  const { date, onDateUpdate } = useCommission();

  return (
    <div className='flex items-center justify-center'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className='w-[240px] justify-center text-left font-normal'
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {format(date, 'PPP')}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto p-0'
          align='start'
        >
          <Calendar
            mode='single'
            selected={new Date(date)}
            required
            onSelect={(date) => onDateUpdate(date as Date)}
            initialFocus
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
