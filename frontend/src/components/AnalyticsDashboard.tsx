'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import analyticsService from '@/services/analytics.service';
import RefreshIcon from '@mui/icons-material/Refresh';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

interface ChartData {
    name: string;
    duration: number;
    displayDuration: number;
    [key: string]: any; // For Recharts compatibility
}

export default function AnalyticsDashboard() {
    const [timeframe, setTimeframe] = useState('weekly');
    const [chartType, setChartType] = useState('bar');
    const [data, setData] = useState<ChartData[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const loadData = async () => {
        try {
            const hubData = await analyticsService.getHubAnalytics(timeframe);
            if (!hubData) return;

            // 1. Format tab usage data
            const formatted: ChartData[] = hubData.tabAnalytics.map((s: any) => ({
                name: s.name,
                duration: s.totalSeconds,
                displayDuration: Math.round(s.totalSeconds / 60)
            }));
            setData(formatted);

            // 2. Format trend data
            const labels = timeframe === 'yearly'
                ? Array.from({ length: 12 }, (_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - (11 - i));
                    return d.toLocaleString('default', { month: 'short' });
                })
                : timeframe === 'monthly'
                    ? ['3 Weeks Ago', '2 Weeks Ago', 'Last Week', 'This Week']
                    : Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return d.toLocaleString('default', { weekday: 'short' });
                    });

            const formattedTrend = hubData.weeklyActivity.map((val: number, idx: number) => ({
                name: labels[idx] || `Point ${idx + 1}`,
                mins: val
            }));
            setTrendData(formattedTrend);

        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount and when timeframe changes
    useEffect(() => {
        setLoading(true);
        loadData();
    }, [timeframe]);

    // Auto-refresh data every 3 seconds to catch updates from navigation
    useEffect(() => {
        const interval = setInterval(() => {
            loadData();
        }, 3000);

        return () => clearInterval(interval);
    }, [timeframe]);

    const renderChart = () => {
        switch (chartType) {
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="displayDuration"
                            label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number | undefined) => [`${value || 0} mins`, 'Time Spent']} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} />
                    </PieChart>
                );
            case 'line':
                return (
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} label={{ value: 'Mins', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number | undefined) => [`${value || 0} mins`, 'Active Time']}
                        />
                        <Line type="monotone" dataKey="mins" name="Active Time" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} label={{ value: 'Mins', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number | undefined) => [`${value || 0} mins`, 'Active Time']}
                        />
                        <Area type="monotone" dataKey="mins" name="Active Time" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDur)" />
                    </AreaChart>
                );
            default:
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} label={{ value: 'Mins', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                        <RechartsTooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number | undefined) => [`${value || 0} mins`, 'Time Spent']}
                        />
                        <Bar dataKey="displayDuration" name="Time Spent" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );
        }
    };

    return (
        <Card sx={{
            p: 3,
            borderRadius: 6,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            border: '1px solid #f1f5f9',
            background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)'
        }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InsightsIcon color="primary" /> Hub Analytics
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Time spent across M4Hub platforms</Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={loadData} size="small" sx={{ bgcolor: '#f1f5f9' }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Select
                        size="small"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        sx={{ borderRadius: 3, minWidth: 100, bgcolor: '#fff', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                        <MenuItem value="bar">Bar Chart</MenuItem>
                        <MenuItem value="pie">Donut Chart</MenuItem>
                        <MenuItem value="line">Line Graph</MenuItem>
                        <MenuItem value="area">Area Chart</MenuItem>
                    </Select>

                    <ToggleButtonGroup
                        size="small"
                        value={timeframe}
                        exclusive
                        onChange={(e, val) => val && setTimeframe(val)}
                        sx={{
                            bgcolor: '#f1f5f9',
                            borderRadius: 3,
                            '& .MuiToggleButton-root': {
                                border: 'none',
                                px: 2,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                '&.Mui-selected': { bgcolor: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
                            }
                        }}
                    >
                        <ToggleButton value="daily">Daily</ToggleButton>
                        <ToggleButton value="weekly">Weekly</ToggleButton>
                        <ToggleButton value="monthly">Monthly</ToggleButton>
                        <ToggleButton value="yearly">Yearly</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>

            <Box sx={{
                height: 350,
                width: '100%',
                minWidth: 0,
                position: 'relative',
                display: 'block',
                '& .recharts-responsive-container': {
                    minWidth: 0
                }
            }}>
                {loading ? (
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Skeleton variant="circular" width={48} height={48} animation="wave" />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="40%" height={24} animation="wave" />
                                <Skeleton variant="text" width="60%" height={20} animation="wave" />
                            </Box>
                        </Box>
                        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3 }} animation="wave" />
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 2 }} animation="wave" />
                            <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 2 }} animation="wave" />
                            <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 2 }} animation="wave" />
                        </Box>
                    </Box>
                ) : data.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                        <TrendingUpIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                        <Typography variant="h6" fontWeight={700}>No Activity Data</Typography>
                        <Typography variant="body2">Start using M4Hub to see your analytics</Typography>
                    </Box>
                ) : isMounted && (
                    <ResponsiveContainer width="99%" height="100%" debounce={50}>
                        {renderChart()}
                    </ResponsiveContainer>
                )}
            </Box>
        </Card>
    );
}
