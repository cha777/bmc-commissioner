import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useCommissionHistory } from '@/hooks/use-commission-history';

export const DatePicker: FC = () => {
  const { from, to, onDateRangeUpdate } = useCommissionHistory();
  const [calendarFrom, setCalendarFrom] = useState(from);
  const [calendarTo, setCalendarTo] = useState(to);

  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from) {
      setCalendarFrom(range.from);
    }

    if (range?.to) {
      setCalendarTo(range.to);
    }
  };

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open && calendarFrom && calendarTo) {
        onDateRangeUpdate(calendarFrom, calendarTo);
      }
    },
    [calendarFrom, calendarTo, onDateRangeUpdate]
  );

  return (
    <div className='flex items-center justify-center'>
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={'w-[300px] justify-center text-left font-normal'}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {format(calendarFrom, 'LLL dd, y')} - {format(calendarTo, 'LLL dd, y')}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto p-0'
          align='start'
        >
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={calendarFrom}
            selected={{ from: calendarFrom, to: calendarTo }}
            onSelect={handleDateChange}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
