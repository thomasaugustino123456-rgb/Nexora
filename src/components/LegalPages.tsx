import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, FileText, HelpCircle, Mail, Send, CheckCircle2, ChevronDown, Sparkles, Heart, Smartphone, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { MascotImage } from './MascotImage';
import { vibrate } from '../lib/vibrate';

interface LegalPageProps {
  onBack: () => void;
  initialTab?: 'terms' | 'privacy' | 'support';
}

export function LegalPagesContainer({ onBack, initialTab = 'terms' }: LegalPageProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'support'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [supportSent, setSupportSent] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: '', email: '', category: 'General Inquiry', message: '' });

  const faqs = [
    {
      q: "How does Nexora sync my data across different devices?",
      a: "Nexora uses Google Cloud Firestore for secure real-time synchronization. Once you create an account and log in with your email on your smartphone, tablet, or desktop, your hydration logs, push-up counts, breathing progress, and customized mascot cosmetics synchronize automatically.",
      category: "Account & Sync"
    },
    {
      q: "Can I customize my daily hydration and exercise goals?",
      a: "Yes! Navigate to the Settings screen (the gear icon in your dashboard). From there, you can adjust your daily water intake target (in ml), change your push-up milestone goal, and toggle audio/vibration feedback to match your lifestyle.",
      category: "Habits"
    },
    {
      q: "How do I unlock new Mascot skins, hats, and aura effects?",
      a: "You earn Nexora Coins and XP by completing your daily habits—drinking water, doing push-ups, completing breathing cycles, and sketching in the studio. You can spend your earned coins in the Nexora Cosmetic Shop to unlock legendary skins like Cosmic, Volcanic Fire, Glacier Ice, along with wizard hats and particle auras.",
      category: "Mascot & Shop"
    },
    {
      q: "Is Nexora suitable as a medical replacement?",
      a: "No. Nexora is an intuitive wellness and lifestyle companion designed to motivate healthy daily habits. It is not a medical device or healthcare diagnostic tool. Please consult a qualified medical professional for health, medical, or dietary advice.",
      category: "Health & Safety"
    },
    {
      q: "What happens if I lose internet connection?",
      a: "Nexora includes offline persistence! Your habit entries and drawing canvas sketches are cached safely in your device storage and will automatically synchronize with your cloud account the moment you reconnect.",
      category: "Account & Sync"
    },
    {
      q: "How can I delete my account or export my habit data?",
      a: "You have complete ownership over your data. In the Settings tab, you can request an instant export of your habit logs or initiate a permanent account deletion request. You can also contact our support team at support@nexora.app.",
      category: "Privacy"
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    vibrate(20);
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportForm({ name: '', email: '', category: 'General Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 sm:py-12 px-4 sm:px-6 relative selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => { vibrate(10); onBack(); }} 
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 font-bold text-sm cursor-pointer active:scale-95"
              aria-label="Back to landing page"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <MascotImage alt="Nexora" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-black text-slate-900 tracking-tight">Nexora Legal & Help</span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 w-full sm:w-auto justify-center">
            {[
              { id: 'terms', label: 'Terms of Service', icon: <FileText size={15} /> },
              { id: 'privacy', label: 'Privacy Policy', icon: <Lock size={15} /> },
              { id: 'support', label: 'Support & FAQ', icon: <HelpCircle size={15} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  vibrate(5);
                  setActiveTab(tab.id as any);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-xs ring-1 ring-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200/80 shadow-sm space-y-8">
          
          {/* TERMS OF SERVICE TAB */}
          {activeTab === 'terms' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-100 pb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                  <ShieldCheck size={14} />
                  <span>Last Updated: August 2026</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Welcome to Nexora! Please read these terms carefully before using our gamified wellness ecosystem.
                </p>
              </div>

              <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
                
                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
                  <p>
                    By registering, accessing, or using Nexora on web, mobile, or desktop, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue your use of Nexora immediately.
                  </p>
                </section>

                <section className="space-y-2 bg-amber-50/60 border border-amber-200/60 p-5 rounded-2xl">
                  <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                    <AlertCircle size={20} className="text-amber-600" />
                    <span>2. Health & Wellness Disclaimer</span>
                  </h2>
                  <p className="text-amber-900/90 text-sm">
                    <strong>Nexora is an intuitive lifestyle habit tracker, not a medical provider.</strong> The hydration trackers, push-up milestones, and guided breathing exercises provided within the application are intended solely for personal wellness encouragement. None of the content or suggestions should be construed as medical diagnosis, advice, or therapy. Always consult with a qualified medical professional before undertaking new physical exercise regimens.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">3. User Accounts & Data Security</h2>
                  <p>
                    When creating an account with Nexora, you agree to provide accurate and complete information. You are responsible for safeguarding your login credentials and for all activities that occur under your account. Nexora employs encrypted cloud authentication to protect your account integrity.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">4. Virtual Currencies & Cosmetic Items</h2>
                  <p>
                    Nexora includes in-app virtual currencies (such as Coins and XP) and digital cosmetics (skins, hats, auras). These items are purely virtual, possess no real-world monetary value, and cannot be redeemed for fiat currency or exchanged outside of Nexora. Nexora reserves the right to manage, adjust, or retire virtual cosmetic offerings.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">5. Acceptable Community Conduct</h2>
                  <p>
                    You agree not to engage in any activity that abuses, disrupts, or compromises the security of the Nexora platform, including unauthorized data scraping, reverse engineering, or exploiting bugs. We reserve the right to suspend or terminate accounts that breach these standards.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">6. Modifications to the Service</h2>
                  <p>
                    We continually enhance Nexora by adding new features, exercises, and companion assets. We reserve the right to modify or discontinue any part of the service with reasonable notice to our users.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-100 pb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                  <Lock size={14} />
                  <span>Privacy First Ecosystem</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Your privacy and data autonomy are paramount. Here is how Nexora collects, utilizes, and protects your information.
                </p>
              </div>

              <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
                
                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
                  <p>To provide a tailored companion experience, Nexora collects the following types of information:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li><strong>Account Credentials:</strong> Email address and authentication tokens for secure login.</li>
                    <li><strong>Habit & Activity Data:</strong> Daily water intake volume, completed push-ups, breathing duration, and streak records.</li>
                    <li><strong>Customization Preferences:</strong> Mascot skin selections, equipped hats, custom audio settings, and drawing canvas sketches.</li>
                    <li><strong>Device Diagnostics:</strong> Basic anonymous performance telemetry to ensure fast loading times and fix crashes.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">2. How We Protect & Store Your Data</h2>
                  <p>
                    All personal data is encrypted in transit (TLS 1.3) and at rest utilizing enterprise-grade Google Cloud Firestore infrastructure. We strictly enforce Firebase Security Rules ensuring that your habit logs and mascot status are only accessible by your authenticated account.
                  </p>
                </section>

                <section className="space-y-2 bg-blue-50/60 border border-blue-200/60 p-5 rounded-2xl">
                  <h2 className="text-xl font-bold text-blue-950 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-blue-600" />
                    <span>3. Zero Data Selling Commitment</span>
                  </h2>
                  <p className="text-blue-900/90 text-sm">
                    <strong>We do not sell, rent, or monetize your personal health, activity, or contact information to advertisers or third-party data brokers.</strong> Your data exists solely to power your personalized Nexora wellness journey.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">4. Your Data Rights (GDPR & CCPA Compliant)</h2>
                  <p>Regardless of your geographic location, you possess full sovereignty over your data:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li><strong>Right to Access & Export:</strong> Request a complete copy of all your tracked habits and companion data.</li>
                    <li><strong>Right to Rectification:</strong> Edit or correct any inaccurate account details at any time in Settings.</li>
                    <li><strong>Right to Erasure (Be Forgotten):</strong> Request permanent and total deletion of your Firestore user document and all associated records.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">5. Contact Our Data Protection Officer</h2>
                  <p>
                    If you have questions regarding our privacy architecture or wish to exercise your data rights, please email us directly at <a href="mailto:privacy@nexora.app" className="text-blue-600 font-bold hover:underline">privacy@nexora.app</a>.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* SUPPORT & FAQ TAB */}
          {activeTab === 'support' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-100 pb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">
                  <HelpCircle size={14} />
                  <span>24/7 Knowledge & Helpdesk</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Support & FAQ</h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Have questions or need assistance? Find quick answers below or reach out to our dedicated support team.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions (e.g., sync, mascot, push-ups, export)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-10 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Interactive Accordion FAQs */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No matching questions found for "{searchQuery}". Try another keyword or send us a message below.
                  </div>
                ) : (
                  filteredFaqs.map((faq, idx) => (
                    <div 
                      key={idx}
                      className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <button
                        onClick={() => {
                          vibrate(5);
                          setOpenFaq(openFaq === idx ? null : idx);
                        }}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md inline-block">
                            {faq.category}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
                        </div>
                        <div className={`w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 transition-transform duration-200 shrink-0 ${openFaq === idx ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                          <ChevronDown size={18} />
                        </div>
                      </button>
                      
                      {openFaq === idx && (
                        <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-white">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Interactive Contact Form & Email Card */}
              <div className="pt-6 border-t border-slate-100">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-3xl p-6 sm:p-8 border border-blue-100 space-y-6">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                      <Mail size={20} className="text-blue-600" />
                      <span>Direct Support Contact</span>
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Our human support team typically replies within 2–4 hours.
                    </p>
                  </div>

                  {supportSent ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                      <span>Thank you! Your inquiry has been sent to our support team. We'll be in touch shortly.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSupportSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Your Name</label>
                          <input
                            required
                            type="text"
                            placeholder="Alex Smith"
                            value={supportForm.name}
                            onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Email Address</label>
                          <input
                            required
                            type="email"
                            placeholder="alex@example.com"
                            value={supportForm.email}
                            onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Category</label>
                        <select
                          value={supportForm.category}
                          onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option>General Inquiry</option>
                          <option>Bug Report / Technical Issue</option>
                          <option>Account & Cloud Sync</option>
                          <option>Cosmetic Shop & Coins</option>
                          <option>Feature Request</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Message</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="How can we assist you with your Nexora experience?"
                          value={supportForm.message}
                          onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <a 
                          href="mailto:support@nexora.app" 
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Or email directly: support@nexora.app
                        </a>
                        <button
                          type="submit"
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          <Send size={16} />
                          <span>Send Message</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
        
      </div>
    </div>
  );
}

// Backward-compatible individual exports
export const TermsPage = ({ onBack }: { onBack: () => void }) => (
  <LegalPagesContainer onBack={onBack} initialTab="terms" />
);

export const PrivacyPage = ({ onBack }: { onBack: () => void }) => (
  <LegalPagesContainer onBack={onBack} initialTab="privacy" />
);

export const SupportPage = ({ onBack }: { onBack: () => void }) => (
  <LegalPagesContainer onBack={onBack} initialTab="support" />
);

