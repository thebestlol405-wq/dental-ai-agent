'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, ShieldCheck, Zap, ArrowRight, MessageCircle, Copy, Check, Send, User, Bot, Phone } from 'lucide-react';

export default function LandingPage() {
  const INSTAGRAM_LINK = "https://instagram.com/desi_gnerai"; 
  // Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSendMessage triggered', { input, isLoading });
    if (!input.trim() || isLoading) {
      console.log('Returning early', { input: !!input.trim(), isLoading });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    console.log('Fetching /api/chat...', newMessages);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      // Artificial delay for "Sarah is typing..."
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (data.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
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
                DM @desi_gnerai on Instagram
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </a>
              <a 
                href="#sarah-chat"
                className="bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition flex items-center justify-center"
              >
                Test Sarah Live ↓
              </a>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
              <span className="font-bold">Trusted by 200+ Clinics</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW Pricing Section */}
      <section id="pricing" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">PSL Founding Clinic Special</h2>
            <p className="text-slate-600 text-lg">Claim one of the 3 remaining founding spots in Port Saint Lucie.</p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border-2 border-blue-600 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-10 translate-x-10 translate-y-4 rotate-45">
              Limited
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900">$500</span>
                <span className="text-slate-500 font-medium">Setup</span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-blue-600">+$100</span>
                <span className="text-blue-600/70 font-medium">/mo</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {[
                '24/7 AI receptionist Sarah',
                'Books directly to your calendar',
                'After-hours phone + text coverage',
                'Custom branded to your clinic',
                'Cancel anytime'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <a 
              href="#sarah-chat"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-lg"
            >
              Claim Your Spot ↓
            </a>
            
            <p className="text-center text-red-600 text-xs mt-6 font-bold uppercase tracking-tighter animate-pulse">
              Only 3 spots available. Price goes to $1,997 after.
            </p>
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section id="sarah-chat" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Test Sarah - AI Receptionist</h2>
            <p className="text-slate-600">Experience how Sarah handles patients in real-time.</p>
          </div>

          <div className="bg-slate-100 rounded-[3rem] p-4 shadow-2xl border-[8px] border-slate-800 relative max-w-sm mx-auto overflow-hidden">
            {/* Phone Header */}
            <div className="bg-white px-6 pt-8 pb-4 border-b flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="text-blue-600 h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Sarah (AI)</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-500 font-medium">Online Now</span>
                </div>
              </div>
              <Phone className="ml-auto h-4 w-4 text-slate-400" />
            </div>

            {/* Chat Area */}
            <div className="h-[400px] overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      &quot;Hi! I&apos;m Sarah. I can help you book an appointment or answer questions about our clinic.&quot;
                    </p>
                  </div>
                  <p className="text-xs font-bold text-blue-600 animate-bounce">Type &quot;I need a cleaning&quot; to start</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <button 
                type="button"
                onClick={(e) => handleSendMessage(e as unknown as React.FormEvent)}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
            Live demo. Full phone version activates after setup.
          </p>
        </div>
      </section>

      {/* Finalize Section */}
      <section id="payment" className="py-24 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">PSL Founding Clinic Special</h2>
            <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-2xl font-bold mb-4">
              $500 Setup + $100/mo
            </div>
            <p className="text-slate-400 text-lg">
              $600 due today covers setup + first month.<br />
              Next bill day 60. Cancel anytime.
            </p>
          </div>
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-2xl text-center text-slate-900">
            <h3 className="text-2xl font-bold mb-6">Ready to start?</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              We are currently accepting only 3 more clinics for the Founding Special. 
              DM us on Instagram to receive your secure payment link and start your 24-hour setup.
            </p>
            <a 
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-lg"
            >
              DM @desi_gnerai to Secure Spot
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="text-xs text-slate-400 mt-6">
              Your AI agent goes live in 24 hours after setup.
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
