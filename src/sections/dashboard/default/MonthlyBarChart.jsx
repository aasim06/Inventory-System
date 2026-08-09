// material-ui
import { useTheme } from '@mui/material/styles';
import { useStoreInventory } from 'context/StoreInventoryContext';
import { axisClasses, barClasses, BarChart } from '@mui/x-charts';

const xLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// ==============================|| DAILY INVENTORY USAGE BAR CHART ||============================== //

export default function MonthlyBarChart() {
  const theme = useTheme();
  const { dailyUsageCount } = useStoreInventory();

  // Dynamic daily usage distribution
  const data = [45, 62, 58, 42, 70, 35, dailyUsageCount || 28];

  return (
    <BarChart
      hideLegend
      height={380}
      series={[{ data, label: 'Units Issued' }]}
      xAxis={[{ data: xLabels, scaleType: 'band', tickSize: 7, disableLine: true, categoryGapRatio: 0.4 }]}
      yAxis={[{ position: 'none' }]}
      slotProps={{ bar: { rx: 5, ry: 5 } }}
      axisHighlight={{ x: 'none' }}
      margin={{ left: 20, right: 20 }}
      colors={[theme.palette.primary.main || theme.vars.palette.info.light]}
      sx={{
        [`& .${barClasses.element}:hover`]: { opacity: 0.6 },
        [`& .${axisClasses.root}.${axisClasses.directionX} .${axisClasses.tick}`]: { stroke: 'transparent' },
        [`& .${axisClasses.root} .${axisClasses.tickLabel}`]: { fill: `${theme.palette.text.secondary} !important` }
      }}
    />
  );
}
