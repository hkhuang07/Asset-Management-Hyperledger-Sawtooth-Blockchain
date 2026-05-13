import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useIdentity } from '../context/IdentityContext';
import {
    Package,
    Plus,
    Send,
    Database,
    Shield,
    Clock,
    Search,
    ChevronRight,
    Fingerprint,
    TrendingUp,
    User,
    CheckCircle,
    AlertCircle,
    Loader,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Toast Notification Component ────────────────────────────────────────── */
const Toast = ({ toasts, removeToast }) => (
    <div
        className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none"
        style={{ minWidth: 340, maxWidth: 420 }}
    >
        <AnimatePresence>
            {toasts.map((toast) => (
                <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, x: 60, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 60, scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl
                        shadow-2xl border backdrop-blur-xl
                        ${toast.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500/40 shadow-emerald-900/30'
                            : toast.type === 'pending'
                            ? 'bg-amber-950/90 border-amber-500/40 shadow-amber-900/30'
                            : 'bg-red-950/90 border-red-500/40 shadow-red-900/30'
                        }`}
                >
                    {/* Icon */}
                    <div className="mt-0.5 shrink-0">
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        {toast.type === 'pending' && <Loader className="w-5 h-5 text-amber-400 animate-spin" />}
                        {toast.type === 'error'   && <AlertCircle className="w-5 h-5 text-red-400" />}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-snug
                            ${toast.type === 'success' ? 'text-emerald-300'
                            : toast.type === 'pending'  ? 'text-amber-300'
                            : 'text-red-300'}`}>
                            {toast.title}
                        </p>
                        {toast.message && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed break-words whitespace-pre-line">
                                {toast.message}
                            </p>
                        )}
                    </div>

                    {/* Close */}
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="shrink-0 text-slate-500 hover:text-white transition-colors mt-0.5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

/* ─── Main Component ───────────────────────────────────────────────────────── */
const AssetManager = ({ setActiveTab }) => {
    const { t } = useTranslation();
    const { identity, users } = useIdentity();

    const [assets, setAssets]                   = useState([]);
    const [form, setForm]                       = useState({ name: '', value: '' });
    const [loading, setLoading]                 = useState(false);
    const [searchTerm, setSearchTerm]           = useState('');
    const [transferringAsset, setTransferringAsset] = useState(null);
    const [recipient, setRecipient]             = useState('');
    const [toasts, setToasts]                   = useState([]);

    /* Toast helpers */
    const addToast = useCallback((type, title, message = '') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 7000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    /* Fetch assets from blockchain state */
    useEffect(() => { fetchAssets(); }, []);

    const fetchAssets = async () => {
        try {
            const res  = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets`);
            const data = await res.json();
            setAssets(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            console.error('Fetch assets error:', err);
            setAssets([]);
        }
    };

    /* Polling Batch Status */
    const pollBatchStatus = async (batchId, type = 'create') => {
        const startTime = Date.now();
        const maxWait = 30000; // 30 seconds
        let warningShown = false;

        const check = async () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed > maxWait) {
                addToast('error', '⏳ Transaction Timeout', 'Mạng lưới không phản hồi sau 30s. Có thể validator đang khởi động lại hoặc có lỗi cấu hình. Hãy kiểm tra tab Explorer hoặc logs hệ thống.');
                return;
            }

            if (elapsed > 10000 && !warningShown) {
                addToast('pending', '⚠️ Validator Slow', 'Giao dịch vẫn đang chờ xử lý. Mạng lưới có thể đang bận hoặc Devmode engine đang trễ.');
                warningShown = true;
            }

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets/batch/${batchId}`);
                const data = await res.json();

                if (data.status === 'COMMITTED') {
                    addToast('success', '✅ Block Created', 'Tài sản đã được ghi nhận thành công vào sổ cái Blockchain!');
                    fetchAssets();
                    return;
                }

                if (data.status === 'INVALID') {
                    const msg = data.invalid_transactions?.[0]?.message || 'Giao dịch bị từ chối do vi phạm quy tắc logic của TP.';
                    addToast('error', '❌ Transaction Invalid', `Lỗi: ${msg}`);
                    return;
                }

                // Still PENDING or UNKNOWN -> continue polling
                setTimeout(check, 2000);
            } catch (err) {
                console.warn('Poll error:', err);
                setTimeout(check, 3000); // Wait a bit longer on network error
            }
        };

        check();
    };

    /* ── Create Asset ─────────────────────────────────────────────────────── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const assetId = Math.random().toString(36).substring(2) +
                        Math.random().toString(36).substring(2);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets`,
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        assetId,
                        name:       form.name,
                        value:      form.value,
                        privateKey: identity.privateKey,
                    }),
                }
            );

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.error || 'Transaction failed');
            }

            /* Backend trả về PENDING ngay (không chờ commit) */
            addToast(
                'pending',
                '⏳ Giao dịch đã gửi — Đang xử lý',
                `Yêu cầu tạo tài sản đã được gửi lên mạng lưới Sawtooth. Hệ thống sẽ tự động cập nhật sau vài giây khi giao dịch được xác thực (Batch: ${result.batchId?.substring(0, 16)}...).`
            );

            setForm({ name: '', value: '' });

            /* Bắt đầu polling để theo dõi trạng thái thực tế */
            pollBatchStatus(result.batchId, 'create');

        } catch (err) {
            console.error('[AssetManager] Submit error:', err);
            addToast('error', '❌ Transaction Failed', err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ── Transfer Asset ───────────────────────────────────────────────────── */
    const handleTransfer = async () => {
        if (!transferringAsset || !recipient) return;
        setLoading(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets/transfer`,
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        assetId:     transferringAsset.asset_id,
                        newOwnerKey: users[recipient].publicKey,
                        privateKey:  identity.privateKey,
                    }),
                }
            );

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.error || 'Transfer failed');
            }

            addToast(
                'pending',
                `⏳ Transfer Submitted — PENDING`,
                `Chuyển nhượng tài sản sang ${recipient} đang được xử lý.\nBatch: ${result.batchId?.substring(0, 28)}...`
            );

            setTransferringAsset(null);
            setRecipient('');
            pollBatchStatus(result.batchId, 'transfer');

        } catch (err) {
            console.error('[AssetManager] Transfer error:', err);
            addToast('error', '❌ Transfer Failed', err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ── Helpers ──────────────────────────────────────────────────────────── */
    const getOwnerName = (publicKey) => {
        if (!publicKey) return 'Unknown';
        const user = Object.values(users).find((u) => u.publicKey === publicKey);
        return user ? user.name : `${publicKey.substring(0, 8)}...`;
    };

    const filteredAssets = assets.filter(
        (a) =>
            a && (
                a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.asset_id || a.asset_id)?.toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    /* ── Render ───────────────────────────────────────────────────────────── */
    return (
        <div className="space-y-8 pb-20">
            {/* Toast Portal */}
            <Toast toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{t('assets.title')}</h2>
                    <p className="text-slate-400 mt-1 flex items-center space-x-2">
                        <Database className="w-4 h-4 text-brand-purple" />
                        <span>Tamper-proof asset registry on Hyperledger Sawtooth</span>
                    </p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-cyan transition-colors" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/5 transition-all w-full md:w-64"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Creation Form ─────────────────────────────────────── */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 border-brand-cyan/10"
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-brand-cyan/10 rounded-lg">
                                <Plus className="w-5 h-5 text-brand-cyan" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{t('assets.create_asset')}</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {t('assets.asset_name')}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-cyan transition-all"
                                    placeholder="e.g. Real Estate Token"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {t('assets.asset_value')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        value={form.value}
                                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-cyan transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">STW</span>
                                </div>
                            </div>

                            <div className="p-4 bg-brand-purple/5 rounded-2xl border border-brand-purple/10">
                                <div className="flex items-start space-x-3">
                                    <Shield className="w-4 h-4 text-brand-purple mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        Submitting this transaction will cryptographically sign the data
                                        with your private key and broadcast it to the Sawtooth validator network.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-xl font-bold text-white shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>{t('assets.submit')}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Stats Widget */}
                    <div className="mt-6 glass-card p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Registry Value</p>
                                <p className="text-lg font-bold text-white">
                                    {assets.reduce((sum, a) => sum + parseInt(a?.value || 0), 0).toLocaleString()} STW
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Assets List ───────────────────────────────────────── */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">
                            {t('assets.list_title')} ({filteredAssets.length})
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Real-time sync
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {filteredAssets.length === 0 ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <Package className="w-12 h-12 text-slate-700 mb-4" />
                                    <p className="text-slate-500 font-medium">{t('assets.no_assets')}</p>
                                </div>
                            ) : (
                                filteredAssets.map((asset, i) => {
                                    if (!asset) return null;
                                    const assetOwner = asset.owner_key || asset.owner;
                                    const isOwner = assetOwner === identity.publicKey;
                                    return (
                                        <motion.div
                                            key={asset.asset_id || i}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="glass-card hover:bg-white/[0.05] p-5 group relative overflow-hidden"
                                        >
                                            {isOwner && (
                                                <div className="absolute top-0 right-0 px-3 py-1 bg-brand-cyan/20 border-b border-l border-brand-cyan/30 rounded-bl-xl">
                                                    <span className="text-[8px] font-black text-brand-cyan uppercase tracking-wider">
                                                        {t('assets.my_asset')}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center border border-white/10 group-hover:border-brand-cyan/50 transition-all">
                                                        <Fingerprint className="w-5 h-5 text-brand-cyan" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-all">
                                                            {asset.name}
                                                        </h4>
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            <User className="w-3 h-3 text-slate-500" />
                                                            <span className="text-[10px] text-slate-400 font-bold">
                                                                {getOwnerName(assetOwner)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right pt-2">
                                                    <p className="text-sm font-black text-white flex items-baseline justify-end space-x-1">
                                                        <span>{asset.value}</span>
                                                        <span className="text-[9px] text-slate-500 font-bold">STW</span>
                                                    </p>
                                                    <div className="flex items-center justify-end space-x-1 mt-1">
                                                        <span className="text-[9px] text-green-500/80 font-bold uppercase tracking-widest">
                                                            Verified
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-px w-full bg-white/5 mb-4" />

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-3 h-3 text-slate-500" />
                                                    <span className="text-[10px] text-slate-500">
                                                        {asset.timestamp
                                                            ? new Date(asset.timestamp).toLocaleString()
                                                            : 'Recent Block'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    {isOwner && (
                                                        <button
                                                            onClick={() => setTransferringAsset(asset)}
                                                            className="flex items-center space-x-1 text-[10px] font-bold text-brand-purple hover:text-brand-cyan transition-colors uppercase"
                                                        >
                                                            <Send className="w-3 h-3" />
                                                            <span>{t('assets.transfer')}</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setActiveTab('explorer')}
                                                        className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase"
                                                    >
                                                        <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Transfer Modal ─────────────────────────────────────────── */}
            <AnimatePresence>
                {transferringAsset && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-brand-deep/80 backdrop-blur-sm"
                            onClick={() => setTransferringAsset(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card p-8 w-full max-w-md relative z-10 border-brand-purple/30"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">{t('assets.transfer_to')}</h3>
                            <p className="text-xs text-slate-400 mb-6">
                                Asset: <span className="text-brand-cyan font-bold">{transferringAsset.name}</span>
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        {t('assets.select_recipient')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.keys(users)
                                            .filter((u) => u !== identity.name)
                                            .map((userName) => (
                                                <button
                                                    key={userName}
                                                    onClick={() => setRecipient(userName)}
                                                    className={`p-4 rounded-xl border transition-all text-center ${
                                                        recipient === userName
                                                            ? 'bg-brand-purple/20 border-brand-purple text-white'
                                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-2">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold">{userName}</span>
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => { setTransferringAsset(null); setRecipient(''); }}
                                        className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-all"
                                    >
                                        {t('assets.cancel')}
                                    </button>
                                    <button
                                        disabled={!recipient || loading}
                                        onClick={handleTransfer}
                                        className="flex-1 py-3 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-xl font-bold text-white shadow-lg shadow-brand-purple/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        {loading
                                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <Send className="w-4 h-4" />
                                        }
                                        <span>{t('assets.confirm_transfer')}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssetManager;
