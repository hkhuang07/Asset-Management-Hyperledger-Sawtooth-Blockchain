import React from 'react';
import { useTranslation } from 'react-i18next';
import { PackageOpen, Settings, Users, Building2, Link2, KeySquare } from 'lucide-react';

const SampleFamilies = () => {
    const { t } = useTranslation();
    const families = [
        {
            name: "Settings",
            icon: <Settings className="w-6 h-6 text-slate-400" />,
            color: "slate",
            description: t('sample_families.list.settings.desc'),
            useCase: t('sample_families.list.settings.use_case')
        },
        {
            name: "Identity",
            icon: <Users className="w-6 h-6 text-brand-purple" />,
            color: "brand-purple",
            description: t('sample_families.list.identity.desc'),
            useCase: t('sample_families.list.identity.use_case')
        },
        {
            name: "IntegerKey",
            icon: <KeySquare className="w-6 h-6 text-brand-cyan" />,
            color: "brand-cyan",
            description: t('sample_families.list.intkey.desc'),
            useCase: t('sample_families.list.intkey.use_case')
        },
        {
            name: "Smallbank",
            icon: <Building2 className="w-6 h-6 text-green-500" />,
            color: "green-500",
            description: t('sample_families.list.smallbank.desc'),
            useCase: t('sample_families.list.smallbank.use_case')
        },
        {
            name: "BlockInfo",
            icon: <Link2 className="w-6 h-6 text-brand-orange" />,
            color: "brand-orange",
            description: t('sample_families.list.blockinfo.desc'),
            useCase: t('sample_families.list.blockinfo.use_case')
        }
    ];

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">
            <header>
                <h2 className="text-3xl font-bold text-white tracking-tight">{t('sample_families.title')}</h2>
                <p className="text-slate-400 mt-1 flex items-center space-x-2">
                    <PackageOpen className="w-4 h-4 text-brand-cyan" />
                    <span>{t('sample_families.subtitle')}</span>
                </p>
            </header>

            <div className="glass-card p-8">
                <p className="text-slate-300 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: t('sample_families.desc') }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {families.map((family, idx) => (
                        <div key={idx} className={`p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group`}>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className={`p-3 rounded-xl bg-black/20`}>
                                    {family.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white">{family.name}</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('sample_families.purpose')}</h4>
                                    <p className="text-sm text-slate-300">{family.description}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('sample_families.use_case')}</h4>
                                    <p className="text-sm text-slate-400">{family.useCase}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Highlight Custom TP */}
                    <div className="p-6 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/10 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-cyan/20 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 rounded-xl bg-brand-cyan/20">
                                    <PackageOpen className="w-6 h-6 text-brand-cyan" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Asset TP <span className="text-[10px] bg-brand-cyan text-white px-2 py-0.5 rounded-full uppercase ml-2">{t('sample_families.custom')}</span></h3>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300">
                                {t('sample_families.asset_tp_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SampleFamilies;
