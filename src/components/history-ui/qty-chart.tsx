import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useCommissionHistory } from '@/hooks/use-commission-history';

const chartConfig = {
  views: {
    label: 'Units',
  },
  units: {
    label: 'Units',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export const QtyChart = () => {
  const { dailyProduction } = useCommissionHistory();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metal Units Produced</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={dailyProduction}
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
