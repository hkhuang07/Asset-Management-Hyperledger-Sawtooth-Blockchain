import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdentity } from './context/IdentityContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EventBar from './components/EventBar';
import Dashboard from './components/Dashboard';
import AssetManager from './components/AssetManager';
import BlockchainExplorer from './components/BlockchainExplorer';
import PerformanceTest from './components/PerformanceTest';
import KeyManager from './components/KeyManager';
import ArchitectureDemo from './components/ArchitectureDemo';
import SampleFamilies from './components/SampleFamilies';
import CryptoDemo from './components/CryptoDemo';

function App() {
  const { loading: identityLoading } = useIdentity();
  const [activeTab, setActiveTab] = useState('network');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (identityLoading) {
    return (
      <div className="h-screen w-full bg-brand-deep flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
          <p className="text-slate-500 font-mono text-xs animate-pulse">Initializing Identity...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'network':
        return <Dashboard />;
      case 'assets':
        return <AssetManager setActiveTab={setActiveTab} />;
      case 'explorer':
        return <BlockchainExplorer />;
      case 'performance':
        return <PerformanceTest />;
      case 'keymgmt':
        return <KeyManager />;
      case 'architecture':
        return <ArchitectureDemo />;
      case 'families':
        return <SampleFamilies />;
      case 'crypto':
        return <CryptoDemo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-deep selection:bg-brand-cyan/30">
      {/* Universal Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Collapsible Modern Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          collapsed={isSidebarCollapsed} 
          setCollapsed={setIsSidebarCollapsed} 
        />

        
        {/* Main Content Area */}
        <main 
          className={`flex-1 overflow-y-auto px-6 md:px-10 py-8 no-scrollbar transition-all duration-300 ${
            activeTab === 'network' ? 'bg-transparent' : ''
          } ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-16 lg:ml-64'}`}
        >

          {/* Framer Motion Tab Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          
          {/* Space for Event Bar */}
          <div className="h-20"></div>
        </main>
      </div>
      
      {/* Modern Bottom Event Bar (Collapsible) */}
      <EventBar />
    </div>
  )
}

export default App
