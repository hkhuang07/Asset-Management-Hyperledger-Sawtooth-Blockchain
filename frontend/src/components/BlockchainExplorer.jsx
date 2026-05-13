import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Box, 
  Database, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  X,
  Hash,
  Link as LinkIcon,
  Clock,
  ArrowRight,
  Unlink,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

const BlockchainExplorer = () => {
    const { t } = useTranslation();
    const [blocks, setBlocks] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tamperedBlockIndex, setTamperedBlockIndex] = useState(null);
    const [showTransactions, setShowTransactions] = useState(false);

    useEffect(() => {
        fetchBlocks();
        const interval = setInterval(fetchBlocks, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchBlocks = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/blocks`);
            const data = await res.json();
            // Đảm bảo data luôn là mảng để tránh lỗi .map()
            setBlocks(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            console.error('Fetch error:', err);
            setBlocks([]); // Dự phòng mảng rỗng
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        if (!blocks.length) return;
        const ws = XLSX.utils.json_to_sheet(blocks.map((b, i) => ({
            Height: blocks.length - i,
            BlockHash: b.header_signature,
            PreviousHash: b.header?.previous_block_id,
            Transactions: b.batch_ids?.length || 1,
            StateRoot: b.header?.state_root_hash
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Blocks");
        XLSX.writeFile(wb, "Sawtooth_Registry_Log.xlsx");
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{t('explorer.title')}</h2>
                    <p className="text-slate-400 mt-1 flex items-center space-x-2">
                        <Box className="w-4 h-4 text-brand-cyan" />
                        <span>Interactive block history of the Sawtooth ledger</span>
                    </p>
                </div>
            </header>

            {/* Horizontal Timeline */}
            <div className="relative">
                {tamperedBlockIndex !== null && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-4 shadow-lg shadow-red-500/10"
                    >
                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">Tamper Detected!</h4>
                            <p className="text-xs text-red-400 leading-relaxed">
                                The cryptographic link between Block #{blocks.length - tamperedBlockIndex} and Block #{blocks.length - tamperedBlockIndex + 1} is broken. 
                                The <span className="font-bold text-white bg-white/10 px-1 rounded">Previous Hash</span> property of the newer block does not match the modified data hash of the older block. This invalidates the entire chain from this point forward, demonstrating blockchain immutability.
                            </p>
                        </div>
                        <button 
                            onClick={() => setTamperedBlockIndex(null)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
                
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-bold text-white">{t('explorer.latest_blocks')}</h3>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setTamperedBlockIndex(blocks.length > 1 ? 1 : 0)}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all uppercase tracking-widest mr-4"
                        >
                            Simulate Attack
                        </button>
                        <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex overflow-x-auto no-scrollbar space-x-4 pb-6 px-2 mask-linear-right">
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="min-w-[280px] h-48 rounded-3xl bg-white/5 animate-pulse border border-white/5"></div>
                        ))
                    ) : (
                        blocks.map((block, i) => (
                            <motion.div
                                key={block.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedBlock(block)}
                                className="min-w-[280px] glass-card p-6 cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 blur-2xl group-hover:bg-brand-cyan/10 transition-all"></div>
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-brand-cyan/10 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Box className="w-6 h-6 text-brand-cyan" />
                                    </div>
                                    <span className="text-[10px] font-black text-brand-cyan bg-brand-cyan/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                                        Verified
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('explorer.block_height')}</p>
                                    <h4 className="text-2xl font-black text-white mt-1">#{blocks.length - i}</h4>
                                    
                                    {tamperedBlockIndex !== null && i <= tamperedBlockIndex && (
                                        <div className="mt-2 p-1.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-500 font-bold flex items-center space-x-1">
                                            {i === tamperedBlockIndex ? <X className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                                            <span>{i === tamperedBlockIndex ? 'HASH TAMPERED' : 'INVALID PREV_HASH'}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Activity className="w-3 h-3 text-brand-purple" />
                                        <span className="text-[10px] text-slate-400 font-bold">{block.batch_ids?.length || 1} Transactions</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-cyan transition-all translate-x-0 group-hover:translate-x-1" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Blocks Table (Backup view) */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Registry Log</h3>
                    <button onClick={downloadExcel} className="text-xs font-bold text-brand-cyan uppercase hover:underline">Download Excel.xlsx</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 uppercase text-[10px] font-black text-slate-500 tracking-wider">
                                <th className="px-6 py-4">Height</th>
                                <th className="px-6 py-4">Block Hash</th>
                                <th className="px-6 py-4">Transactions</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {blocks.map((block, i) => (
                                <tr key={block.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-300">#{blocks.length - i}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Hash className={`w-3 h-3 ${tamperedBlockIndex !== null && i <= tamperedBlockIndex ? 'text-red-500' : 'text-slate-500'}`} />
                                            <span className={`text-xs font-mono group-hover:text-brand-cyan transition-colors line-clamp-1 max-w-[200px] ${tamperedBlockIndex !== null && i <= tamperedBlockIndex ? 'text-red-500 line-through' : 'text-slate-500'}`}>
                                                {tamperedBlockIndex === i ? 'BAD0' + block.header_signature.substring(4) : block.header_signature}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full">
                                            {block.batch_ids?.length || 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            <span className="text-[10px] text-green-500 font-black uppercase">Committed</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedBlock(block)}
                                            className="text-xs font-bold text-slate-400 hover:text-brand-cyan transition-colors"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Block Details Modal */}
            <AnimatePresence>
                {selectedBlock && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBlock(null)}
                            className="absolute inset-0 bg-brand-deep/80 backdrop-blur-md"
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl glass-card border border-brand-cyan/20 overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                                    <Database className="w-5 h-5 text-brand-cyan" />
                                    <span>{t('explorer.block_details')} #{selectedBlock.header?.block_num || '??'}</span>
                                </h3>
                                <button 
                                    onClick={() => {
                                        setSelectedBlock(null);
                                        setShowTransactions(false);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('explorer.hash')}</p>
                                        <div className={`p-3 rounded-xl border flex items-center justify-between group ${tamperedBlockIndex !== null && blocks.indexOf(selectedBlock) === tamperedBlockIndex ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5'}`}>
                                            <span className={`text-xs font-mono break-all leading-relaxed ${tamperedBlockIndex !== null && blocks.indexOf(selectedBlock) === tamperedBlockIndex ? 'text-red-500' : 'text-slate-300'}`}>
                                                {tamperedBlockIndex !== null && blocks.indexOf(selectedBlock) === tamperedBlockIndex 
                                                    ? 'BAD0' + selectedBlock.header_signature.substring(4) 
                                                    : selectedBlock.header_signature}
                                            </span>
                                            {tamperedBlockIndex !== null && blocks.indexOf(selectedBlock) === tamperedBlockIndex && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 ml-2" />}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('explorer.prev_hash')}</p>
                                        <div className={`p-3 rounded-xl border ${tamperedBlockIndex !== null && blocks.indexOf(selectedBlock) < tamperedBlockIndex ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5'}`}>
                                            <span className={`text-xs font-mono ${tamperedBlockIndex !== null && blocks.indexOf(selectedBlock) < tamperedBlockIndex ? 'text-red-400' : 'text-slate-500'}`}>
                                                {selectedBlock.header?.previous_block_id || 'Genesis Block'}
                                            </span>
                                        </div>
                                        {tamperedBlockIndex !== null && blocks.indexOf(selectedBlock) === tamperedBlockIndex - 1 && (
                                            <p className="text-[9px] text-red-500 font-bold mt-1 uppercase">❌ Mismatch with Block #{blocks.length - tamperedBlockIndex} Hash</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-brand-cyan/5 rounded-2xl border border-brand-cyan/10">
                                        <div className="flex items-center space-x-3">
                                            <LinkIcon className="w-5 h-5 text-brand-cyan" />
                                            <span className="text-sm font-bold text-white">{t('explorer.state_root')}</span>
                                        </div>
                                        <span className="text-xs font-mono text-brand-cyan">{selectedBlock.header?.state_root_hash?.substring(0, 24)}...</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-brand-purple/5 rounded-2xl border border-brand-purple/10">
                                        <div className="flex items-center space-x-3">
                                            <Clock className="w-5 h-5 text-brand-purple" />
                                            <span className="text-sm font-bold text-white">Batch Count</span>
                                        </div>
                                        <span className="text-sm font-bold text-brand-purple">{selectedBlock.batch_ids?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showTransactions && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-8 pb-6 border-t border-white/10 pt-6 bg-black/20"
                                    >
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Transactions / Batches</h4>
                                        <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar">
                                            {selectedBlock.batch_ids && selectedBlock.batch_ids.length > 0 ? (
                                                selectedBlock.batch_ids.map((batchId, i) => (
                                                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center space-x-3">
                                                        <Activity className="w-4 h-4 text-brand-purple shrink-0" />
                                                        <div className="overflow-hidden">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Batch ID</p>
                                                            <p className="text-xs font-mono text-slate-300 truncate">{batchId}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-slate-500 text-sm">
                                                    No transactions found in this block.
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="p-6 bg-white/5 text-center">
                                <button 
                                    onClick={() => setShowTransactions(!showTransactions)}
                                    className="px-8 py-2 bg-brand-cyan rounded-xl font-bold text-white shadow-lg shadow-brand-cyan/20 hover:scale-105 transition-all"
                                >
                                    {showTransactions ? 'Hide Transactions' : 'Explore Transactions'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlockchainExplorer;
