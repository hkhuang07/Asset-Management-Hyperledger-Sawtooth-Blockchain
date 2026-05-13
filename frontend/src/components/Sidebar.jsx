import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Network, 
  Package, 
  Search, 
  Zap, 
  Key, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Settings,
  Layers,
  Component
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { t } = useTranslation();


  const menuItems = [
    { id: 'network', icon: Network, label: 'dashboard' },
    { id: 'assets', icon: Package, label: 'assets' },
    { id: 'explorer', icon: Search, label: 'explorer' },
    { id: 'performance', icon: Zap, label: 'performance' },
    { id: 'keymgmt', icon: Key, label: 'keymgmt' },
    { id: 'architecture', icon: Layers, label: 'architecture' },
    { id: 'families', icon: Component, label: 'families' },
  ];

  return (
    <aside 
      className={`glass fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 shadow-2xl border-r border-white/10 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
        <div className="px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all group relative ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-brand-cyan/20 to-transparent text-brand-cyan'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              
              {!collapsed && (
                <span className="ml-4 text-sm font-medium whitespace-nowrap capitalize">
                  {t(`nav.${item.label}`, item.label)}
                </span>
              )}
              
              {collapsed && (
                <div className="absolute left-16 bg-brand-dark border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-50 capitalize">
                  {t(`nav.${item.label}`, item.label)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-white/10">
        {!collapsed && (
          <div className="mb-4 p-3 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
            <div className="flex items-center space-x-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-brand-cyan" />
              <span className="text-[10px] uppercase font-bold text-brand-cyan tracking-wider">{t('nav.system_status')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-brand-cyan font-medium">{t('nav.nodes_synced')}</span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button className="flex-1 p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all flex justify-center">
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
