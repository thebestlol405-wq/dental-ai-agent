'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  Trash2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Home
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  status: 'new' | 'contacted' | 'interested' | 'rejected';
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [lastSentContent, setLastSentContent] = useState<{ subject: string, body: string, email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'scraper' | 'assistant' | 'leads'>('scraper');
  const [searchQuery, setSearchQuery] = useState('');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Assistant State
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const leadsRes = await fetch('/api/leads');
        const leadsData = await leadsRes.json();
        setLeads(leadsData);

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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
        setNotification({ type: 'success', message: `Found ${data.leads.length} new leads!` });
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      setNotification({ type: 'error', message: 'Scraping failed' });
    } finally {
      setIsScraping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim() || isAssistantLoading) return;

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
        setNotification({ type: 'success', message: `Email sent to ${lead.name}` });
      } else {
        setNotification({ type: 'error', message: `Failed to send to ${lead.name}` });
      }
    } catch (error) {
      console.error('Failed to send outreach:', error);
    } finally {
      setIsSending(null);
    }
  };

  const handleBulkSend = async () => {
    const newLeads = leads.filter(l => l.status === 'new');
    if (newLeads.length === 0) {
      setNotification({ type: 'error', message: 'No new leads to send to' });
      return;
    }

    if (!confirm(`Send automated emails to ${newLeads.length} leads?`)) return;

    setIsBulkSending(true);
    let successCount = 0;

    for (const lead of newLeads) {
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
          await fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: lead.id, status: 'contacted' }),
          });
          successCount++;
        }
      } catch (err) {
        console.error(`Bulk send error for ${lead.email}:`, err);
      }
    }

    await refreshLeads();
    setIsBulkSending(false);
    setNotification({ type: 'success', message: `Bulk send complete: ${successCount}/${newLeads.length} successful` });
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await refreshLeads();
        setNotification({ type: 'success', message: 'Lead deleted' });
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      const response = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLead),
      });
      if (response.ok) {
        await refreshLeads();
        setEditingLead(null);
        setNotification({ type: 'success', message: 'Lead updated successfully' });
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
      setNotification({ type: 'error', message: 'Failed to update lead' });
    }
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
    l.company.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(leadSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-screen overflow-hidden">
      {editingLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Lead</h2>
            <form onSubmit={handleUpdateLead} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                <input
                  type="text"
                  value={editingLead.name}
                  onChange={e => setEditingLead({...editingLead, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
                <input
                  type="text"
                  value={editingLead.company}
                  onChange={e => setEditingLead({...editingLead, company: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input
                  type="email"
                  value={editingLead.email}
                  onChange={e => setEditingLead({...editingLead, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                <input
                  type="text"
                  value={editingLead.phone || ''}
                  onChange={e => setEditingLead({...editingLead, phone: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Website</label>
                <input
                  type="text"
                  value={editingLead.website || ''}
                  onChange={e => setEditingLead({...editingLead, website: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  value={editingLead.description || ''}
                  onChange={e => setEditingLead({...editingLead, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition h-20 resize-none"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-bold">{notification.message}</p>
        </div>
      )}

      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 md:p-6 flex flex-col gap-4 md:gap-8 border-b md:border-r border-slate-800 shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition group">
          <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition">
            <ShieldCheck className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DoubleAgent</span>
        </Link>

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

        <div className="mt-auto pt-4 border-t border-slate-800 hidden md:block">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition font-medium"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-full flex flex-col">
        <header className="bg-white border-b px-4 md:px-8 py-4 md:py-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {activeTab === 'scraper' ? 'Agency Scraper' : activeTab === 'assistant' ? 'Email Assistant' : 'Real Estate Leads'}
            </h1>
          </div>
          {activeTab === 'leads' && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
                <Search className="h-3.5 w-3.5 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Filter leads..."
                  value={leadSearchQuery}
                  onChange={e => setLeadSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-slate-900 w-32"
                />
              </div>
              <button
                onClick={handleBulkSend}
                disabled={isBulkSending || leads.filter(l => l.status === 'new').length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isBulkSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                Bulk Send ({leads.filter(l => l.status === 'new').length})
              </button>
            </div>
          )}
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
                  className="flex-1 px-5 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-600 outline-none transition text-sm md:text-base text-slate-900 shadow-sm"
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
                    <div className={`max-w-[85%] px-6 py-3 rounded-2xl ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border shadow-sm rounded-tl-none text-slate-900'
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
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 focus:bg-white border-none focus:ring-2 focus:ring-blue-600 transition outline-none text-slate-900"
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
            <div className="flex flex-col gap-6 h-full pb-20">
              <div className="md:hidden mb-2">
                <div className="flex items-center bg-white rounded-2xl px-4 py-3 border border-slate-200 shadow-sm">
                  <Search className="h-4 w-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search your leads..."
                    value={leadSearchQuery}
                    onChange={e => setLeadSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-slate-900 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{lead.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3" /> {lead.company}
                        </p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        lead.status === 'new' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {lead.status}
                      </span>
                    </div>

                    {lead.description && (
                      <p className="text-xs text-slate-600 italic line-clamp-2">
                        "{lead.description}"
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <Zap className="h-3.5 w-3.5 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.website && (
                        <div className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                          <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                            {lead.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-50 mt-auto">
                      <button
                        onClick={() => handleSendEmail(lead)}
                        disabled={isSending === lead.id || lead.status === 'contacted'}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100"
                      >
                        {isSending === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Outreach
                      </button>
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200"
                        title="Edit Lead"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 border border-rose-100"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {lastSentContent && (
                <div className="fixed bottom-0 left-0 right-0 md:relative bg-white border-t md:border border-slate-200 md:rounded-3xl shadow-2xl md:shadow-sm p-4 md:p-6 z-20">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-slate-900">Recent Outreach Preview</h3>
                    <a
                      href={`mailto:${lastSentContent.email}?subject=${encodeURIComponent(lastSentContent.subject)}&body=${encodeURIComponent(lastSentContent.body)}`}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold flex items-center gap-2"
                    >
                      <Mail className="h-3 w-3" />
                      Open Client
                    </a>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs border max-h-40 overflow-y-auto">
                    <div className="mb-1">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">Subject:</span>
                      <div className="text-slate-900 font-medium">{lastSentContent.subject}</div>
                    </div>
                    <div className="whitespace-pre-wrap text-slate-700 mt-2 pt-2 border-t border-slate-200">
                      {lastSentContent.body}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
