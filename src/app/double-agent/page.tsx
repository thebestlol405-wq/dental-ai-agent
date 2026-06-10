'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Send,
  CheckCircle,
  Clock,
  Mail,
  Plus,
  Search,
  Building2,
  LayoutDashboard,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'new' | 'contacted' | 'interested' | 'rejected';
}

export default function DoubleAgentDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [lastSentContent, setLastSentContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'outreach'>('leads');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const refreshLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
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
        setLastSentContent(data.content);
        // Update lead status
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">DoubleAgent</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'leads' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users className="h-5 w-5" />
            Leads
          </button>
          <button
            onClick={() => setActiveTab('outreach')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'outreach' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Send className="h-5 w-5" />
            Outreach
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition font-medium opacity-50 cursor-not-allowed">
            <LayoutDashboard className="h-5 w-5" />
            Analytics
          </button>
        </nav>

        <div className="mt-auto bg-slate-800 p-4 rounded-2xl">
          <p className="text-xs text-slate-400 uppercase font-bold mb-2">Credits</p>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4" />
          </div>
          <p className="text-xs mt-2 font-medium">750 / 1000 searches</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b px-8 py-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'leads' ? 'Real Estate Leads' : 'Outreach Campaign'}
            </h1>
            <p className="text-slate-500 text-sm">Target: Port Saint Lucie, FL</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              <Search className="h-4 w-4" />
              Scrape New Leads
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              <Plus className="h-4 w-4" />
              Add Manual Lead
            </button>
          </div>
        </header>

        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Leads Table/List */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Agent / Company</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{lead.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {lead.company}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                            lead.status === 'contacted' ? 'bg-amber-50 text-amber-700' :
                            'bg-green-50 text-green-700'
                          }`}>
                            {lead.status === 'new' && <Clock className="h-3 w-3" />}
                            {lead.status === 'contacted' && <Send className="h-3 w-3" />}
                            {lead.status === 'interested' && <CheckCircle className="h-3 w-3" />}
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleSendEmail(lead)}
                            disabled={isSending === lead.id || lead.status === 'contacted'}
                            className={`p-2 rounded-lg transition ${
                              lead.status === 'contacted'
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            {isSending === lead.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : lead.status === 'contacted' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Campaign / Preview Pane */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    Campaign: PSL Founders
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Personalized AI Outreach for Real Estate</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Preview</span>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase">llama-3.3-70b</span>
                  </div>
                  {lastSentContent ? (
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {lastSentContent}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic text-center py-12">
                      Send an email to see the AI-generated personalized content here.
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Leads Contacted</span>
                    <span className="font-bold">{leads.filter(l => l.status === 'contacted').length} / {leads.length}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${(leads.filter(l => l.status === 'contacted').length / leads.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg">
                  <LayoutDashboard className="h-5 w-5" />
                  View Campaign Stats
                </button>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  <Link
                    href="/"
                    className="text-xs text-blue-600 font-bold flex items-center justify-center gap-1 hover:underline"
                  >
                    View Public Dental Landing Page
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
