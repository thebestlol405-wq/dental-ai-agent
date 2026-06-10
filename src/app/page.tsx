'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Send,
  Bot,
  Search,
  Users,
  Mail,
  Building2,
  Loader2,
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'new' | 'contacted' | 'interested' | 'rejected';
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [lastSentContent, setLastSentContent] = useState<{ subject: string, body: string, email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'scraper' | 'assistant' | 'leads'>('scraper');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  // Assistant State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch leads
        const leadsRes = await fetch('/api/leads');
        const leadsData = await leadsRes.json();
        setLeads(leadsData);

        // Fetch chat history
        const chatRes = await fetch('/api/chat');
        const chatData = await chatRes.json();
        if (chatData && chatData.length > 0) {
          setMessages(chatData);
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const refreshLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsScraping(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      if (data.leads) {
        await refreshLeads();
        setActiveTab('leads');
      }
    } catch (error) {
      console.error('Scraping failed:', error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim() || isAssistantLoading) return;

    // Mobile: hide keyboard on submit
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const userMessage = assistantInput.trim();
    setAssistantInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsAssistantLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      if (data.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      }
    } catch (error) {
      console.error('Assistant error:', error);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const handleSendEmail = async (lead: Lead) => {
    setIsSending(lead.id);
    setLastSentContent(null);
    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          name: lead.name,
          company: lead.company,
          email: lead.email
        }),
      });
      const data = await response.json();

      if (data.success) {
        setLastSentContent({
          subject: data.subject,
          body: data.content,
          email: lead.email
        });
        await fetch('/api/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lead.id, status: 'contacted' }),
        });
        await refreshLeads();
      }
    } catch (error) {
      console.error('Failed to send outreach:', error);
    } finally {
      setIsSending(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 md:p-6 flex flex-col gap-4 md:gap-8 border-b md:border-r border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">DoubleAgent</span>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('scraper')}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-xl transition font-medium whitespace-nowrap ${activeTab === 'scraper' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
            Scraper
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-xl transition font-medium whitespace-nowrap ${activeTab === 'assistant' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Bot className="h-4 w-4 md:h-5 md:w-5" />
            Assistant
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-xl transition font-medium whitespace-nowrap ${activeTab === 'leads' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users className="h-4 w-4 md:h-5 md:w-5" />
            Leads
          </button>
        </nav>

        <div className="mt-auto bg-slate-800 p-4 rounded-2xl hidden md:block">
          <p className="text-xs text-slate-400 uppercase font-bold mb-2">Credits</p>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4" />
          </div>
          <p className="text-xs mt-2 font-medium">750 / 1000 searches</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full flex flex-col">
        <header className="bg-white border-b px-4 md:px-8 py-4 md:py-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {activeTab === 'scraper' ? 'Agency Scraper' : activeTab === 'assistant' ? 'Email Assistant' : 'Real Estate Leads'}
            </h1>
            <p className="text-slate-500 text-xs md:text-sm">Targeting: USA & Canada</p>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {activeTab === 'scraper' && (
            <div className="max-w-2xl mx-auto py-6 md:py-12 text-center">
              <Zap className="h-10 w-10 md:h-12 md:w-12 text-blue-600 mx-auto mb-4 md:mb-6" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 md:mb-4">Find Real Estate Agencies</h2>
              <p className="text-slate-600 mb-6 md:mb-8 text-sm md:text-base">Enter a city or region to scrape agency data and contact emails.</p>

              <form onSubmit={handleScrape} className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Miami, FL or Toronto, ON"
                  className="flex-1 px-5 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-600 outline-none transition text-sm md:text-base"
                />
                <button
                  disabled={isScraping || !searchQuery.trim()}
                  className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-xl shadow-blue-200 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {isScraping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  Scrape
                </button>
              </form>
            </div>
          )}

          {activeTab === 'assistant' && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-full max-h-[700px] border border-slate-200">
              <div className="p-6 border-b flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="text-blue-600 h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Personal Outreach Assistant</h3>
                  <p className="text-xs text-slate-500">Helping you write professional emails</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Ask me to draft an email for a specific lead or purpose.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-6 py-3 rounded-2xl ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border shadow-sm rounded-tl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isAssistantLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border px-4 py-2 rounded-2xl shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask me to write an email..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 focus:bg-white border-none focus:ring-2 focus:ring-blue-600 transition outline-none"
                />
                <button
                  disabled={isAssistantLoading || !assistantInput.trim()}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="flex flex-col gap-6 h-full">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 md:px-6 py-3 md:py-4">Agent / Company</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Contact</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                          <div className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {lead.company}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            lead.status === 'new' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-600">{lead.email}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <button
                            onClick={() => handleSendEmail(lead)}
                            disabled={isSending === lead.id || lead.status === 'contacted'}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                          >
                            {isSending === lead.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-6 shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm md:text-base">Generated Outreach</h3>
                  {lastSentContent && (
                    <a
                      href={`mailto:${lastSentContent.email}?subject=${encodeURIComponent(lastSentContent.subject)}&body=${encodeURIComponent(lastSentContent.body)}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                      <Mail className="h-3 w-3" />
                      Open in Email Client
                    </a>
                  )}
                </div>
                {lastSentContent ? (
                  <div className="bg-slate-50 p-4 rounded-xl text-sm border">
                    <div className="mb-2 pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Subject:</span>
                      <div className="text-slate-900 font-medium">{lastSentContent.subject}</div>
                    </div>
                    <div className="whitespace-pre-wrap text-slate-700">
                      {lastSentContent.body}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">Send an email to preview content here.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
