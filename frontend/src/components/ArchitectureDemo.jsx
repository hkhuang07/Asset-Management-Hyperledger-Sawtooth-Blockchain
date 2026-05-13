import React from 'react';
import { useTranslation } from 'react-i18next';
import { Network, Database, Cpu, Layers, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ArchitectureDemo = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">
            <header>
                <h2 className="text-3xl font-bold text-white tracking-tight">{t('architecture.title')}</h2>
                <p className="text-slate-400 mt-1 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-brand-purple" />
                    <span>{t('architecture.subtitle')}</span>
                </p>
            </header>

            <div className="glass-card p-8">
                <p className="text-slate-300 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: t('architecture.desc') }} />

                <div className="relative">
                    {/* Visual Diagram */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
                        {/* Application Domain */}
                        <div className="glass-card p-6 border-brand-cyan/20 bg-brand-cyan/5">
                            <div className="flex items-center space-x-3 mb-4">
                                <Cpu className="w-6 h-6 text-brand-cyan" />
                                <h3 className="text-lg font-bold text-white">{t('architecture.app_domain')}</h3>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">
                                {t('architecture.app_domain_desc')}
                            </p>
                            <div className="space-y-2">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-brand-cyan"></div>
                                    <span>Asset TP (Python)</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                    <span>Settings TP (Rust)</span>
                                </div>
                            </div>
                        </div>

                        {/* Middle Connection */}
                        <div className="hidden md:flex flex-col items-center justify-center space-y-2">
                            <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest text-center" dangerouslySetInnerHTML={{ __html: t('architecture.zmq_comm') }} />
                            <ArrowRightLeft className="w-8 h-8 text-brand-purple animate-pulse" />
                        </div>

                        {/* Core Domain */}
                        <div className="glass-card p-6 border-brand-purple/20 bg-brand-purple/5">
                            <div className="flex items-center space-x-3 mb-4">
                                <Network className="w-6 h-6 text-brand-purple" />
                                <h3 className="text-lg font-bold text-white">{t('architecture.core_system')}</h3>
                            </div>
                            <p className="text-xs text-slate-400 mb-4">
                                {t('architecture.core_system_desc')}
                            </p>
                            <div className="space-y-2">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center space-x-2">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    <span>{t('architecture.validator_node')}</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center space-x-2">
                                    <Database className="w-4 h-4 text-yellow-500" />
                                    <span>{t('architecture.global_state')}</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center space-x-2">
                                    <Layers className="w-4 h-4 text-brand-purple" />
                                    <span>{t('architecture.consensus')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <h4 className="text-white font-bold mb-2">{t('architecture.high_modularity')}</h4>
                        <p className="text-sm text-slate-400">
                            {t('architecture.high_modularity_desc')}
                        </p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <h4 className="text-white font-bold mb-2">{t('architecture.secure_smart_contracts')}</h4>
                        <p className="text-sm text-slate-400">
                            {t('architecture.secure_smart_contracts_desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchitectureDemo;
