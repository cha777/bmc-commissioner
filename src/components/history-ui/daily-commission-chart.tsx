import type { FC } from 'react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useCommissionHistory } from '@/hooks/use-commission-history';

const chartConfig = {
  views: {
    label: 'Units',
  },
  units: {
    label: 'Units',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export const DailyCommissionChart: FC = () => {
  const { commissionHistory } = useCommissionHistory();

  const totalUnits = useMemo(() => {
    return Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
      commissionHistory.reduce((prev, curr) => {
        return prev + curr.units;
      }, 0)
    );
  }, [commissionHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metal Units Produced</CardTitle>
        <CardDescription>Total Units: {totalUnits}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={commissionHistory}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey='units'
              fill={`var(--color-units)`}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
