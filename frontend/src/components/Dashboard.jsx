import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Database, 
  Shield, 
  TrendingUp, 
  Box, 
  Clock, 
  Server, 
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        assets: 0,
        blocks: 0,
        transactions: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch assets
            const assetsRes = await fetch('http://localhost:3001/api/assets');
            const assetsData = await assetsRes.json();
            const assetCount = Array.isArray(assetsData) ? assetsData.length : 0;

            // Fetch blocks
            const blocksRes = await fetch('http://localhost:3001/api/blocks');
            const blocksData = await blocksRes.json();
            const blockCount = Array.isArray(blocksData) ? blocksData.length : 0;

            setStats({
                assets: assetCount,
                blocks: blockCount,
                transactions: blockCount > 0 ? blocksData.reduce((acc, b) => acc + (b.batches?.length || 0), 0) : 0
            });

            // Prepare chart data (last 20 blocks)
            let totalLoad = 0;
            if (Array.isArray(blocksData) && blocksData.length > 0) {
                const history = [...blocksData].slice(0, 20).reverse().map((b, i) => {
                    const txCount = b.batches?.length || 0;
                    totalLoad += txCount;
                    return {
                        name: `B-${b.header?.block_num || i}`,
                        txs: txCount
                    };
                });
                setChartData(history);
                
                // Calculate dynamic network load (based on 100 tx/block max capacity)
                const avgLoad = (totalLoad / Math.min(blocksData.length, 20)) / 100;
                const loadPercent = Math.min(avgLoad * 100, 100).toFixed(1);
                
                setStats(prev => ({
                    ...prev,
                    load: `${loadPercent}%`
                }));
            } else {
                setStats(prev => ({ ...prev, load: '0.0%' }));
            }
        } catch (err) {
            console.error('Dashboard data error:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ active }) => (
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            active ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-orange/10 text-brand-orange'
        }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-brand-green animate-pulse' : 'bg-brand-orange'}`}></div>
            <span>{active ? t('nav.online') : t('nav.offline')}</span>
        </div>
    );

    const metricCards = [
        { id: 'assets', label: t('dashboard.registered_assets'), value: stats.assets, icon: Database, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
        { id: 'blocks', label: t('dashboard.block_height'), value: stats.blocks, icon: Box, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
        { id: 'txs', label: t('dashboard.total_txs'), value: stats.transactions, icon: Shield, color: 'text-brand-green', bg: 'bg-brand-green/10' },
        { id: 'load', label: t('dashboard.network_load'), value: stats.load || '0.0%', icon: TrendingUp, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Real-time Status Banner */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-blue/10 rounded-2xl border border-brand-blue/20">
                        <Activity className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">{t('dashboard.stats_title')}</h2>
                        <div className="flex items-center space-x-2 text-slate-500 mt-1">
                            <Server className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{t('dashboard.chain_id')}: sawtooth-asset-demo-v1</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                     <StatusBadge active={true} />
                     <div className="h-4 w-px bg-white/10 mx-2"></div>
                     <div className="text-right">
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.network_latency')}</p>
                         <p className="text-xs font-black text-brand-cyan">12ms</p>
                     </div>
                </div>
            </header>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((stat, i) => (
                    <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 border-white/5 relative group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        <h4 className="text-3xl font-black text-white mt-1 tracking-tighter">
                            {loading ? '---' : stat.value}
                        </h4>
                    </motion.div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 glass-card p-8 border-brand-blue/20"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{t('dashboard.tx_velocity')}</h3>
                            <p className="text-xs text-slate-500">{t('dashboard.processing_volume')}</p>
                        </div>
                        <div className="flex space-x-2">
                             <span className="px-3 py-1 bg-brand-blue/10 rounded-lg text-[10px] font-bold text-brand-blue uppercase">{t('dashboard.live_feed')}</span>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTxs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#007ACC" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#007ACC" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#555" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#555" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1E1E1E', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        color: '#fff'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="txs" 
                                    stroke="#007ACC" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorTxs)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Events */}
                <div className="space-y-6">
                    <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-brand-cyan" />
                            <span>{t('dashboard.recent_events')}</span>
                        </h3>
                        <div className="space-y-6">
                            {[
                                { t: 'Validator-0', e: 'Block Proposed', time: '2s ago', s: 'done' },
                                { t: 'REST-API', e: 'Batch Submitted', time: '14s ago', s: 'done' },
                                { t: 'Identity', e: 'Session Rotate', time: '1m ago', s: 'warn' },
                            ].map((ev, i) => (
                                <div key={i} className="flex items-start space-x-4 relative">
                                    {i < 2 && <div className="absolute left-[7px] top-6 bottom-[-16px] w-px bg-white/5"></div>}
                                    <div className={`mt-1.5 w-4 h-4 rounded-full border-2 ${ev.s === 'done' ? 'border-brand-green bg-brand-green/20' : 'border-brand-orange bg-brand-orange/20'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-white">{ev.e}</span>
                                            <span className="text-[9px] text-slate-500 uppercase">{ev.time}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{ev.t}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-brand-orange/5 border-brand-orange/10">
                        <div className="flex items-center space-x-3 text-brand-orange mb-4">
                            <AlertCircle className="w-5 h-5" />
                            <h4 className="text-xs font-black uppercase tracking-widest">{t('dashboard.protocol_monitor')}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            {t('dashboard.devmode_desc')}
                        </p>
                    </div>

                    <div className="glass-card p-6 bg-brand-purple/5 border-brand-purple/20 relative overflow-hidden group">
                        <div className="flex items-center space-x-3 text-brand-purple mb-4 relative z-10">
                            <Server className="w-5 h-5" />
                            <h4 className="text-xs font-black uppercase tracking-widest">{t('architecture.title')}</h4>
                        </div>
                        <div className="relative z-10 space-y-3">
                            <div className="p-3 bg-brand-deep/80 rounded-xl border border-white/5 flex flex-col">
                                <span className="text-[10px] text-brand-cyan font-bold uppercase mb-1">{t('dashboard.core_system')}</span>
                                <span className="text-xs text-white font-medium">{t('dashboard.validator_consensus')}</span>
                                <p className="text-[9px] text-slate-400 mt-1">{t('dashboard.core_desc')}</p>
                            </div>
                            <div className="flex justify-center">
                                <Activity className="w-4 h-4 text-brand-purple animate-pulse" />
                            </div>
                            <div className="p-3 bg-brand-deep/80 rounded-xl border border-white/5 flex flex-col">
                                <span className="text-[10px] text-brand-purple font-bold uppercase mb-1">{t('dashboard.app_domain')}</span>
                                <div className="space-y-2 mt-1">
                                    <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-lg">
                                        <span className="text-white">Asset TP</span>
                                        <span className="text-green-400 text-[10px]">Python</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-lg">
                                        <span className="text-white">Settings TP</span>
                                        <span className="text-green-400 text-[10px]">Rust</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-purple/20 blur-3xl rounded-full group-hover:scale-150 transition-all"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
