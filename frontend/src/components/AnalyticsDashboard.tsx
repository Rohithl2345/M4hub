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
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import analyticsService, { TabUsageStats } from '@/services/analytics.service';
import RefreshIcon from '@mui/icons-material/Refresh';
import InsightsIcon from '@mui/icons-material/Insights';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const TAB_NAME_MAP: Record<string, string> = {
    'DASHBOARD': 'Dashboard',
    'MUSIC': 'Music',
    'MESSAGES': 'Messages',
    'MONEY': 'Money',
    'NEWS': 'News',
    'PROFILE': 'Profile',
    'dashboard': 'Dashboard',
    'music': 'Music',
    'messages': 'Messages',
    'money': 'Money',
    'news': 'News',
    'profile': 'Profile',
    'explore': 'Profile', // Mobile 'explore' tab is Profile
};

interface ChartData {
    name: string;
    duration: number;
    displayDuration: number;
    [key: string]: any; // For Recharts compatibility
}

export default function AnalyticsDashboard() {
    const theme = useTheme();
    const [timeframe, setTimeframe] = useState('weekly');
    const [chartType, setChartType] = useState('bar');
    const [data, setData] = useState<ChartData[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
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

    useEffect(() => {
        loadData();
    }, [timeframe]);

    const renderChart = () => {
        const isTrendChart = chartType === 'line' || chartType === 'area';
        const activeData = isTrendChart ? trendData : data;

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

            <Box sx={{ height: 350, width: '100%', position: 'relative' }}>
                {loading ? (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.8)', zIndex: 1 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : (
                    data.length === 0 ? (
                        <Box sx={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 2,
                            background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.5) 0%, rgba(226, 232, 240, 0.5) 100%)',
                            borderRadius: 6,
                            border: '2px dashed #e2e8f0',
                            textAlign: 'center',
                            p: 3
                        }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                                mb: 1,
                                animation: 'pulse 2s infinite ease-in-out'
                            }}>
                                <InsightsIcon sx={{ fontSize: 40, color: '#6366f1', opacity: 0.8 }} />
                                <style>{`
                                    @keyframes pulse {
                                        0% { scale: 1; }
                                        50% { scale: 1.05; }
                                        100% { scale: 1; }
                                    }
                                `}</style>
                            </Box>
                            <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                                No Hub Activity
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, lineHeight: 1.6 }}>
                                We haven't recorded any activity for this period yet.
                                <span style={{ display: 'block', marginTop: '8px', fontWeight: 600, color: '#6366f1' }}>
                                    Your journey starts here!
                                </span>
                            </Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart()}
                        </ResponsiveContainer>
                    )
                )}
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>MOST ACTIVE HUB</Typography>
                    <Typography variant="body1" fontWeight={900} color="primary">
                        {data.length > 0 ? [...data].sort((a, b) => b.duration - a.duration)[0].name : '--'}
                    </Typography>
                </Box>
                <Box sx={{ borderLeft: '2px solid #e2e8f0', pl: 3 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL ENGAGEMENT</Typography>
                    <Typography variant="body1" fontWeight={900}>
                        {Math.round(data.reduce((acc, curr) => acc + curr.duration, 0) / 60)} Minutes
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
}
