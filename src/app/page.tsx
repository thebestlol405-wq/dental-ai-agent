import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Search,
  Bot,
  Mail,
  ArrowRight,
  CheckCircle2,
  Globe,
  Users
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <ShieldCheck className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">DoubleAgent</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition">How it Works</a>
              <Link href="/dashboard" className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2">
                Launch App <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-8 animate-bounce">
            <Zap className="h-4 w-4" /> Now Powered by Gemini 1.5 Flash
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Scale Your Real Estate <br />
            <span className="text-blue-600">Outreach with AI</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Find leads, draft personalized emails, and manage your pipeline all in one place.
            DoubleAgent is the ultimate companion for modern real estate professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition shadow-2xl flex items-center justify-center gap-3">
              Get Started for Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#features" className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-slate-300 transition flex items-center justify-center gap-3">
              View Features
            </Link>
          </div>
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-1">500+</div>
              <div className="text-sm text-slate-500 font-medium">Agencies Found</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-1">10k+</div>
              <div className="text-sm text-slate-500 font-medium">Emails Sent</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-1">98%</div>
              <div className="text-sm text-slate-500 font-medium">AI Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-1">24/7</div>
              <div className="text-sm text-slate-500 font-medium">Automation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Built for Growth</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Stop wasting hours on manual research and generic templates.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-blue-600 transition group shadow-sm hover:shadow-xl">
              <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">AI Scraper</h3>
              <p className="text-slate-600 leading-relaxed">
                Instantly discover real estate agencies and agents in any city.
                Our AI validates emails and finds specialized niche agents for your outreach.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-blue-600 transition group shadow-sm hover:shadow-xl">
              <div className="bg-purple-100 text-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Bot className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">Personal Assistant</h3>
              <p className="text-slate-600 leading-relaxed">
                Chat with an AI that knows your leads. Draft perfect follow-ups,
                refine your value proposition, and schedule outreach in natural language.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-blue-600 transition group shadow-sm hover:shadow-xl">
              <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">Bulk Outreach</h3>
              <p className="text-slate-600 leading-relaxed">
                Send personalized emails to hundreds of leads with a single click.
                DoubleAgent generates unique content for every recipient to maximize open rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-slate-900 py-32 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8">How it Works</h2>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Search & Scrape</h4>
                    <p className="text-slate-400">Enter a target region and let our AI find the top-performing agencies in that area.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Review & Edit</h4>
                    <p className="text-slate-400">Manage your leads in a clean, organized dashboard. Filter, edit details, and prepare for outreach.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Automate Outreach</h4>
                    <p className="text-slate-400">Connect your SMTP and start sending personalized emails that actually get replies.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700 shadow-2xl relative">
                <div className="absolute -inset-4 bg-blue-600/20 blur-3xl -z-10" />
                <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-slate-800 rounded animate-pulse" />
                        <div className="pt-4 space-y-2">
                            <div className="h-10 w-full bg-blue-600 rounded-xl" />
                            <div className="h-10 w-full bg-slate-800 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.5),transparent)] pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to double your pipeline?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto relative z-10">
              Join dozens of agencies using DoubleAgent to automate their lead generation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/dashboard" className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-slate-50 transition shadow-xl">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-600 h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">DoubleAgent</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Support</a>
          </div>
          <div className="text-sm text-slate-400">
            © 2026 DoubleAgent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
