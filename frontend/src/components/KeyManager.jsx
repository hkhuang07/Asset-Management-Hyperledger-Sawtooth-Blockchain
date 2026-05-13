import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIdentity } from '../context/IdentityContext';
import {
    Shield,
    Key,
    RefreshCw,
    Copy,
    Check,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Cpu,
    ChevronRight,
    Database
} from 'lucide-react';
import { motion } from 'framer-motion';

const KeyManager = () => {
    const { t } = useTranslation();
    const { identity, users, logout } = useIdentity();
    const [copied, setCopied] = useState(false);
    const [showPrivate, setShowPrivate] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!identity) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-blue"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <header className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{t('keymgmt.title')}</h2>
                    <p className="text-slate-400 mt-2 flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-brand-cyan" />
                        <span>{t('keymgmt.subtitle')}</span>
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="px-4 py-2 bg-brand-green/10 border border-brand-green/20 rounded-full flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                        <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">{t('keymgmt.active_identity')}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Identity Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 glass-card p-8 border-brand-blue/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-3xl -mr-20 -mt-20 group-hover:bg-brand-blue/10 transition-all"></div>

                    <div className="space-y-8 relative z-10">
                        {/* Public Key */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                                    <Key className="w-3 h-3" />
                                    <span>{t('keymgmt.public_key')}</span>
                                </label>
                                <button
                                    onClick={() => handleCopy(identity.publicKey)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-brand-blue transition-all"
                                >
                                    {copied ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 font-mono text-sm break-all text-slate-300 leading-relaxed">
                                {identity.publicKey}
                            </div>
                        </div>

                        {/* Private Key */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                                    <Lock className="w-3 h-3 text-brand-orange" />
                                    <span>{t('keymgmt.private_key')}</span>
                                </label>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setShowPrivate(!showPrivate)}
                                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-all"
                                    >
                                        {showPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleCopy(identity.privateKey)}
                                        className="p-2 hover:bg-white/5 rounded-lg text-brand-blue transition-all"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl border transition-all duration-300 font-mono text-sm break-all ${showPrivate ? 'bg-brand-orange/5 border-brand-orange/20 text-brand-orange' : 'bg-black/20 border-white/5 text-slate-700 blur-sm select-none'
                                }`}>
                                {identity.privateKey}
                            </div>
                        </div>

                        <div className="pt-4 flex items-center space-x-4">
                            <button
                                onClick={logout}
                                className="px-6 py-2.5 bg-brand-blue rounded-xl font-bold text-white shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all flex items-center space-x-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>{t('keymgmt.rotate') || 'Rotate Keys'}</span>
                            </button>
                            <button
                                onClick={logout}
                                className="px-6 py-2.5 bg-white/5 rounded-xl font-bold text-slate-400 hover:bg-brand-orange/10 hover:text-brand-orange transition-all"
                            >
                                {t('keymgmt.reset')}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Info & Stats Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-6 bg-brand-blue/5 border-brand-blue/20">
                        <div className="flex items-center space-x-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-brand-cyan" />
                            <h4 className="font-bold text-white uppercase text-xs tracking-widest">{t('keymgmt.security_note')}</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            {t('keymgmt.security_note_desc')}
                        </p>
                        <div className="h-px w-full bg-white/5 mb-4"></div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500">{t('keymgmt.encryption')}</span>
                                <span className="text-brand-green font-bold uppercase">secp256k1</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500">{t('keymgmt.storage')}</span>
                                <span className="text-slate-300 font-bold uppercase">{t('keymgmt.browser_enclave')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 border-white/5 group bg-brand-purple/5">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-brand-purple/10 rounded-lg">
                                <Cpu className="w-5 h-5 text-brand-purple" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">SDK Version</h4>
                                <p className="text-[10px] text-slate-500">Sawtooth Core Client 1.0</p>
                            </div>
                        </div>
                        <a
                            href="https://github.com/hyperledger-archives/sawtooth-sdk-python/blob/main/BUILD.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 flex items-center justify-center space-x-2 hover:bg-brand-purple/20 hover:text-white transition-all border border-transparent hover:border-brand-purple/30 no-underline"
                        >
                            <span>{t('keymgmt.view_docs')}</span>
                            <ChevronRight className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="glass-card p-6 border-white/5 bg-brand-cyan/5">
                        <div className="flex items-center space-x-3 mb-4">
                            <Database className="w-5 h-5 text-brand-cyan" />
                            <h4 className="font-bold text-white uppercase text-xs tracking-widest">{t('keymgmt.network_status')}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-2">{t('keymgmt.network_status_desc')}</p>
                        <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                            <span className="text-[10px] text-brand-green font-black uppercase">{t('keymgmt.socket_online')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Identity Registry (List of all users) - Moved to bottom full width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card overflow-hidden border-white/5"
            >
                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Database className="w-5 h-5 text-brand-purple" />
                        <h3 className="text-lg font-bold text-white">{t('keymgmt.identity_registry')}</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{Object.keys(users).length} {t('keymgmt.nodes_registered')}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/20 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">{t('keymgmt.table_user')}</th>
                                <th className="px-6 py-4">{t('keymgmt.table_role')}</th>
                                <th className="px-6 py-4">{t('keymgmt.table_address')}</th>
                                <th className="px-6 py-4 text-right">{t('keymgmt.table_status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {Object.values(users).map((user) => (
                                <tr key={user.name} className={`hover:bg-white/[0.02] transition-colors group ${identity.name === user.name ? 'bg-brand-cyan/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 group-hover:border-brand-cyan transition-colors">
                                                <span className="text-xs font-bold text-slate-300">{user.name[0]}</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">{user.name}</span>
                                            {identity.name === user.name && (
                                                <span className="text-[8px] bg-brand-cyan text-brand-deep px-1.5 py-0.5 rounded font-black uppercase">{t('keymgmt.status_active')}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[250px]">{user.publicKey}</span>
                                            <button 
                                                onClick={() => handleCopy(user.publicKey)}
                                                className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Copy className="w-3 h-3 text-brand-cyan" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                                            <span className="text-[9px] text-brand-green font-black uppercase">{t('keymgmt.status_secure')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default KeyManager;
