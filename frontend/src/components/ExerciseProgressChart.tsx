import { useState, useEffect } from 'react';
import { api, type ExerciseHistoryEntry } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from './ui/chart';
import { Card, CardContent, CardHeader } from './ui/card';

interface ExerciseProgressChartProps {
  exerciseId: number;
}

export function ExerciseProgressChart({
  exerciseId,
}: ExerciseProgressChartProps) {
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
      <div className='h-48 flex items-center justify-center text-sm text-muted-foreground'>
        Loading...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className='h-48 flex items-center justify-center text-sm text-muted-foreground'>
        No history available
      </div>
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
  const minWeight = Math.min(...history.map((entry) => entry.max_weight));

  return (
    <Card>
      <CardHeader>Max Weight Progress: {maxWeight}lbs</CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={4}
            />
            <YAxis
              domain={[minWeight - 5, maxWeight + 5]}
              tickCount={3}
              dataKey='weight'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
