import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIdentity } from '../context/IdentityContext';
import { Shield, Key, FileText, CheckCircle2, XCircle, Fingerprint, Lock, Unlock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const CryptoDemo = () => {
    const { t } = useTranslation();
    const { identity } = useIdentity();
    
    // Hash Demo State
    const [hashInput, setHashInput] = useState('Hello Sawtooth Blockchain');
    const [hashOutput, setHashOutput] = useState('');
    
    // Sign Demo State
    const [signMessage, setSignMessage] = useState('This is a highly classified transaction payload.');
    const [signature, setSignature] = useState('');
    const [isSigning, setIsSigning] = useState(false);
    
    // Verify Demo State
    const [verifyMessage, setVerifyMessage] = useState('');
    const [verifySignature, setVerifySignature] = useState('');
    const [verifyStatus, setVerifyStatus] = useState(null); // true, false, null

    // Real-time Hash Calculation
    useEffect(() => {
        const calculateHash = async () => {
            const msgBuffer = new TextEncoder().encode(hashInput);
            const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setHashOutput(hashHex);
        };
        calculateHash();
    }, [hashInput]);

    // Copy Sign payload to Verify payload
    useEffect(() => {
        if (signature) {
            setVerifyMessage(signMessage);
            setVerifySignature(signature);
            setVerifyStatus(null);
        }
    }, [signature]);

    const handleSign = async () => {
        if (!identity) return;
        setIsSigning(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: signMessage,
                    privateKey: identity.privateKey
                })
            });
            const data = await res.json();
            if (data.success) {
                setSignature(data.signature);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSigning(false);
        }
    };

    const handleVerify = async () => {
        if (!identity || !verifySignature) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/assets/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: verifyMessage,
                    signature: verifySignature,
                    publicKey: identity.publicKey
                })
            });
            const data = await res.json();
            setVerifyStatus(data.isValid);
        } catch (err) {
            console.error(err);
            setVerifyStatus(false);
        }
    };

    if (!identity) return null;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">{t('crypto.title')}</h2>
                <p className="text-slate-400 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-brand-cyan" />
                    <span>{t('crypto.subtitle')}</span>
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Hashing Demonstration */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border-brand-cyan/20 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <div className="flex items-center space-x-3 mb-6 relative z-10">
                        <div className="p-2 bg-brand-cyan/10 rounded-lg">
                            <Fingerprint className="w-5 h-5 text-brand-cyan" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{t('crypto.hashing_title')}</h3>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-6">
                        {t('crypto.hashing_desc')}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('crypto.input_data')}</label>
                            <textarea
                                value={hashInput}
                                onChange={(e) => setHashInput(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-cyan transition-all resize-none"
                                rows="3"
                            ></textarea>
                        </div>
                        
                        <div className="flex items-center justify-center">
                            <div className="h-8 w-px bg-white/20"></div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-brand-cyan uppercase tracking-wider mb-2">{t('crypto.resulting_hash')}</label>
                            <div className="p-4 bg-[#000624] rounded-xl border border-brand-cyan/20 font-mono text-[11px] text-brand-cyan break-all leading-relaxed shadow-[0_0_15px_rgba(0,212,255,0.05)] inset-shadow">
                                {hashOutput}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Digital Signatures */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 border-brand-purple/20 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <div className="flex items-center space-x-3 mb-6 relative z-10">
                        <div className="p-2 bg-brand-purple/10 rounded-lg">
                            <Lock className="w-5 h-5 text-brand-purple" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{t('crypto.signing_title')}</h3>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-6">
                        {t('crypto.signing_desc')}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('crypto.tx_payload')}</label>
                            <textarea
                                value={signMessage}
                                onChange={(e) => setSignMessage(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-purple transition-all resize-none"
                                rows="2"
                            ></textarea>
                        </div>

                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 bg-white/5 p-2 rounded-lg border border-white/5">
                            <Key className="w-3 h-3 text-brand-orange" />
                            <span>{t('crypto.signing_with')}: <span className="font-mono text-brand-orange">{identity.privateKey.substring(0,16)}...</span></span>
                        </div>

                        <button
                            onClick={handleSign}
                            disabled={isSigning || !signMessage}
                            className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-xl font-bold text-white shadow-lg shadow-brand-purple/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                        >
                            {isSigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            <span>{t('crypto.gen_sig')}</span>
                        </button>

                        {signature && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <label className="block text-[10px] font-bold text-brand-purple uppercase tracking-wider mb-2 mt-4">{t('crypto.sig_label')}</label>
                                <div className="p-3 bg-[#000624] rounded-xl border border-brand-purple/20 font-mono text-[10px] text-brand-purple break-all">
                                    {signature}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* 3. Signature Verification */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`lg:col-span-2 glass-card p-6 border-2 transition-colors duration-500 ${verifyStatus === true ? 'border-green-500/50 bg-green-500/5' : verifyStatus === false ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-700/50 rounded-lg">
                                <Unlock className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{t('crypto.verify_title')}</h3>
                        </div>
                        {verifyStatus === true && (
                            <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded-full flex items-center space-x-1">
                                <CheckCircle2 className="w-4 h-4" /> <span>{t('crypto.valid_tx')}</span>
                            </div>
                        )}
                        {verifyStatus === false && (
                            <div className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase rounded-full flex items-center space-x-1">
                                <XCircle className="w-4 h-4" /> <span>{t('crypto.invalid_tx')}</span>
                            </div>
                        )}
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-6">
                        {t('crypto.verify_desc')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('crypto.received_payload')}</label>
                            <textarea
                                value={verifyMessage}
                                onChange={(e) => {
                                    setVerifyMessage(e.target.value);
                                    setVerifyStatus(null);
                                }}
                                className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white outline-none transition-all resize-none ${verifyStatus === false ? 'border-red-500/50' : 'border-white/10 focus:border-brand-cyan'}`}
                                rows="3"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('crypto.received_sig')}</label>
                            <textarea
                                value={verifySignature}
                                onChange={(e) => {
                                    setVerifySignature(e.target.value);
                                    setVerifyStatus(null);
                                }}
                                className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-brand-purple font-mono text-xs outline-none transition-all resize-none ${verifyStatus === false ? 'border-red-500/50' : 'border-white/10 focus:border-brand-purple'}`}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                            <Key className="w-3 h-3 text-brand-cyan" />
                            <span>{t('crypto.verifying_with')}: <span className="font-mono text-brand-cyan">{identity.publicKey}</span></span>
                        </div>
                        
                        <button
                            onClick={handleVerify}
                            disabled={!verifyMessage || !verifySignature}
                            className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center space-x-2 ${
                                verifyStatus === true ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' 
                                : verifyStatus === false ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                                : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                        >
                            <Shield className="w-4 h-4" />
                            <span>{t('crypto.verify_btn')}</span>
                        </button>
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default CryptoDemo;
