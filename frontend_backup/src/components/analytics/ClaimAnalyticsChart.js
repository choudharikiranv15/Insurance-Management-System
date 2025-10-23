import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const ClaimAnalyticsChart = ({ data, title = "Claims Analytics" }) => {
  const theme = useTheme();

  // Sample data if none provided
  const defaultData = [
    { month: 'Jan', approved: 45, pending: 12, rejected: 8 },
    { month: 'Feb', approved: 52, pending: 15, rejected: 10 },
    { month: 'Mar', approved: 48, pending: 18, rejected: 7 },
    { month: 'Apr', approved: 61, pending: 22, rejected: 12 },
    { month: 'May', approved: 55, pending: 16, rejected: 9 },
    { month: 'Jun', approved: 67, pending: 20, rejected: 11 },
    { month: 'Jul', approved: 58, pending: 14, rejected: 8 },
    { month: 'Aug', approved: 70, pending: 25, rejected: 15 },
    { month: 'Sep', approved: 63, pending: 18, rejected: 10 },
    { month: 'Oct', approved: 75, pending: 28, rejected: 13 },
    { month: 'Nov', approved: 68, pending: 21, rejected: 9 },
    { month: 'Dec', approved: 80, pending: 30, rejected: 16 }
  ];

  const chartData = data || defaultData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            p: 2,
            boxShadow: theme.shadows[3]
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 1 }}>
            {`Month: ${label}`}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
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
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="month"
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  color: theme.palette.text.secondary
                }}
              />
              <Bar
                dataKey="approved"
                name="Approved Claims"
                fill={theme.palette.success.main}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="pending"
                name="Pending Claims"
                fill={theme.palette.warning.main}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="rejected"
                name="Rejected Claims"
                fill={theme.palette.error.main}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClaimAnalyticsChart;