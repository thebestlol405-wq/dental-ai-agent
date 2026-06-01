'use client';

import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, Zap, ArrowRight, MessageCircle, Copy, Check } from 'lucide-react';

export default function LandingPage() {
  const INSTAGRAM_LINK = "https://instagram.com/dsi_gnerai"; 
  const SOLANA_WALLET = "9P6tP5XQeMuygKNAja1CoFaMfXjhWS1BSNxLu2tM5jKT"; 
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SOLANA_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ShieldCheck className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">DentalAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Pricing</a>
              <a 
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                DM Me on Instagram
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6 border border-blue-100">
              <Zap className="h-4 w-4" />
              <span>Next-Gen Dental Practice Automation</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
              AI Receptionist That <br />
              <span className="text-blue-600 italic">Books 30% More Patients</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop losing patients to voicemail. Our Dental AI handles 24/7 booking, insurance verification, and FAQs so your staff can focus on the chair.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group"
              >
                DM Me on Instagram
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </a>
              <button className="bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition">
                Watch Demo
              </button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
              <span className="font-bold">Trusted by 200+ Clinics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Transparent Enterprise Pricing</h2>
            <p className="text-slate-400">Scale your practice with a tireless digital team member.</p>
          </div>

          <div className="max-w-md mx-auto bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden group mb-12">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-10 translate-x-10 translate-y-4 rotate-45">
              Popular
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">Practice Growth Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$297</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-sm text-blue-400 font-medium mt-2">+ $497 One-time Setup Fee</p>
            </div>

            <ul className="space-y-4 mb-10">
              {[
                '24/7 AI Phone Receptionist',
                'Seamless PMS Integration',
                'Insurance Verification AI',
                'Review Generation Bot',
                'Advanced Appointment Dashboard',
                'HIPAA Compliant Security'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <a 
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              DM Me on Instagram
              <MessageCircle className="h-5 w-5" />
            </a>
            
            <p className="text-center text-slate-400 text-sm mt-6">
              Questions? DM <a href={INSTAGRAM_LINK} className="text-blue-400 hover:underline">@dsi_gnerai</a> on Instagram
            </p>
          </div>

          {/* Crypto Section */}
          <div className="max-w-md mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-blue-500/30 shadow-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Founding Client Special: $397 USDC</h3>
            
            <div className="mb-6 flex justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-lg shadow-blue-500/20">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=solana:9P6tP5XQeMuygKNAja1CoFaMfXjhWS1BSNxLu2tM5jKT" 
                  alt="Solana Wallet QR Code"
                  className="w-40 h-40"
                />
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-700 flex flex-col items-center gap-3">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Send $397 USDC on Solana network only</span>
              <code className="text-blue-400 font-mono break-all text-xs leading-relaxed">{SOLANA_WALLET}</code>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition bg-slate-800 px-4 py-2 rounded-lg"
              >
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy Wallet Address'}
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              DM <a href={INSTAGRAM_LINK} className="text-blue-400 hover:underline">@dsi_gnerai</a> on Instagram with transaction hash.<br />
              <span className="text-blue-400 font-semibold italic mt-2 block">Your AI agent goes live in 24 hours.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <ShieldCheck className="text-white h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">DentalAI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 DentalAI. HIPAA Compliant. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-600 text-sm">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-slate-600 text-sm">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
