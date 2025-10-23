import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const RevenueChart = ({ data, title = "Revenue Overview" }) => {
  const theme = useTheme();

  // Sample data if none provided
  const defaultData = [
    { month: 'Jan', revenue: 12000, premiums: 8000, claims: 4000 },
    { month: 'Feb', revenue: 19000, premiums: 13000, claims: 6000 },
    { month: 'Mar', revenue: 15000, premiums: 10000, claims: 5000 },
    { month: 'Apr', revenue: 25000, premiums: 18000, claims: 7000 },
    { month: 'May', revenue: 22000, premiums: 16000, claims: 6000 },
    { month: 'Jun', revenue: 30000, premiums: 22000, claims: 8000 },
    { month: 'Jul', revenue: 28000, premiums: 20000, claims: 8000 },
    { month: 'Aug', revenue: 35000, premiums: 26000, claims: 9000 },
    { month: 'Sep', revenue: 32000, premiums: 24000, claims: 8000 },
    { month: 'Oct', revenue: 40000, premiums: 30000, claims: 10000 },
    { month: 'Nov', revenue: 38000, premiums: 28000, claims: 10000 },
    { month: 'Dec', revenue: 45000, premiums: 34000, claims: 11000 }
  ];

  const chartData = data || defaultData;

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPremiums" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="month"
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                labelStyle={{ color: theme.palette.text.primary }}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
                name="Total Revenue"
              />
              <Area
                type="monotone"
                dataKey="premiums"
                stroke={theme.palette.success.main}
                fillOpacity={1}
                fill="url(#colorPremiums)"
                strokeWidth={2}
                name="Premium Collection"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;