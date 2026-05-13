import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, Languages, LayoutDashboard } from 'lucide-react';
import { useIdentity } from '../context/IdentityContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { t, i18n } = useTranslation();
  const { identity, users, switchIdentity } = useIdentity();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 shadow-2xl">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-purple rounded-xl flex items-center justify-center glow-cyan">
          <LayoutDashboard className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-white">
          Sawtooth Asset
        </span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex space-x-1">
          {['network', 'assets', 'explorer', 'performance', 'keymgmt', 'architecture', 'families', 'crypto'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-brand-cyan/20 text-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t(`nav.${tab === 'network' ? 'dashboard' : tab}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center space-x-2 group"
            title={i18n.language === 'en' ? 'Tiếng Việt' : 'English'}
          >
            <Languages className="w-5 h-5 text-slate-400 group-hover:text-brand-cyan" />
            <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase transition-colors">
              {i18n.language === 'en' ? 'VN' : 'EN'}
            </span>
          </button>
          
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative group">
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-brand-cyan" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-cyan rounded-full border border-brand-deep"></span>
          </button>
          
          <div className="relative group cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/10 group-hover:border-brand-cyan transition-all">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-white group-hover:text-brand-cyan transition-all">
                  {identity?.name || 'Loading...'}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {identity?.role || 'User'}
                </p>
              </div>
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#000624] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2 space-y-1">
                {Object.values(users).map(user => (
                  <button
                    key={user.name}
                    onClick={() => switchIdentity(user.name)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      identity?.name === user.name
                        ? 'bg-brand-cyan/20 text-brand-cyan'
                        : 'text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
