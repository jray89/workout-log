import { useState, useEffect } from 'react';
import { api, type ExerciseHistoryEntry } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, CartesianGrid, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from './ui/chart';

interface ExerciseHistoryCardProps {
  exerciseId: number;
  exerciseName: string;
}

export function ExerciseHistoryCard({ exerciseId }: ExerciseHistoryCardProps) {
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await api.getExerciseHistory(exerciseId);
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch exercise history:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [exerciseId]);

  if (loading) {
    return (
      <Card className='hidden md:block'>
        <CardHeader className='p-4 pb-2'>
          <CardTitle className='text-base'>Progress</CardTitle>
        </CardHeader>
        <CardContent className='p-4 pt-2'>
          <div className='h-48 flex items-center justify-center text-sm text-muted-foreground'>
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className='hidden md:block'>
        <CardHeader className='p-4 pb-2'>
          <CardTitle className='text-base'>Progress</CardTitle>
        </CardHeader>
        <CardContent className='p-4 pt-2'>
          <div className='h-48 flex items-center justify-center text-sm text-muted-foreground'>
            No history available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig: ChartConfig = {
    desktop: {
      label: 'Desktop',
      color: '#ff6900',
    },
  };

  // Format data for the chart
  const chartData = history.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    weight: entry.max_weight,
    fullDate: entry.date,
  }));

  const maxWeight = Math.max(...history.map((entry) => entry.max_weight));

  return (
    <Card className='hidden md:block'>
      <CardHeader className='p-4 pb-2'>
        <CardTitle className='text-base'>
          Max Weight Progress: {maxWeight}lbs
        </CardTitle>
      </CardHeader>
      <CardContent className='p-4 pt-2'>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            {/* <CartesianGrid vertical={false} /> */}
            <XAxis
              dataKey='date'
              // tickLine={false}
              // axisLine={false}
              // tickMargin={8}
            />
            <YAxis
              dataKey='weight'
              // tickLine={false}
              // axisLine={false}
              // tickMargin={8}
              width={24}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey='weight'
              type='natural'
              stroke='var(--color-desktop)'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
