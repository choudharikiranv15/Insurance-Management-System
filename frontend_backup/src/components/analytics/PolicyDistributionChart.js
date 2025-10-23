import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const PolicyDistributionChart = ({ data, title = "Policy Distribution" }) => {
  const theme = useTheme();

  // Sample data if none provided
  const defaultData = [
    { name: 'Life Insurance', value: 35, color: theme.palette.primary.main },
    { name: 'Health Insurance', value: 28, color: theme.palette.success.main },
    { name: 'Auto Insurance', value: 22, color: theme.palette.warning.main },
    { name: 'Home Insurance', value: 10, color: theme.palette.error.main },
    { name: 'Travel Insurance', value: 5, color: theme.palette.info.main }
  ];

  const chartData = data || defaultData;

  const renderLabel = (entry) => {
    return `${entry.name}: ${entry.value}%`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            p: 1,
            boxShadow: theme.shadows[3]
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            {`${data.name}: ${data.value}%`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                fontSize={12}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '12px',
                  color: theme.palette.text.secondary
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PolicyDistributionChart;