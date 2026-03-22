import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
}

const PageLayout = ({ title, children, onBack }: { title: string, children: React.ReactNode, onBack: () => void }) => (
  <div className="min-h-screen bg-blue-50 py-12 px-6 overflow-y-auto">
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 relative">
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 p-3 rounded-full hover:bg-blue-50 text-blue-900/60 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-3xl md:text-4xl font-black text-blue-900 mb-8 text-center mt-4">{title}</h1>
      <div className="prose prose-blue max-w-none text-blue-900/80 space-y-6">
        {children}
      </div>
    </div>
  </div>
);

export const TermsPage = ({ onBack }: LegalPageProps) => (
  <PageLayout title="Terms of Service" onBack={onBack}>
    <section>
      <h3 className="text-xl font-bold text-blue-900 mb-2">1. Acceptance of Terms</h3>
      <p>By accessing and using Nexora, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our application.</p>
    </section>
    
    <section>
      <h3 className="text-xl font-bold text-blue-900 mb-2">2. Health Disclaimer</h3>
      <p>Nexora is a habit-tracking and wellness application designed to encourage a healthy lifestyle. <strong>It is not a substitute for professional medical advice, diagnosis, or treatment.</strong> Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
    </section>
    
    <section>
      <h3 className="text-xl font-bold text-blue-900 mb-2">3. User Accounts</h3>
      <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. Please notify us immediately if you suspect any unauthorized use of your account.</p>
    </section>
    
    <section>
      <h3 className="text-xl font-bold text-blue-900 mb-2">4. Acceptable Use</h3>
      <p>You agree not to use the app for any unlawful purpose or in any way that interrupts, damages, or impairs the service. We reserve the right to terminate accounts that violate these terms.</p>
    </section>
  </PageLayout>
);

export const PrivacyPage = ({ onBack }: LegalPageProps) => (
  <PageLayout title="Privacy Policy" onBack={onBack}>
    <section>
      <h3 className="text-xl font-bold text-blue-900 mb-2">1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as when you create an account, update your profile, or log your daily activities (water intake, push-ups, breathing sessions, etc.). This helps us tailor your experience and track your progress.</p>
    </section>
    
    <section>
      <h3 className="text-xl font-bold text-blue-900 mb-2">2. How We Use Your Information</h3>
      <p>We use the information we collect to provide, maintain, and improve our services. This includes personalizing your dashboard, updating your mascot's status, and monitoring the overall effectiveness of our app to make it better for everyone.</p>
    </section>
    
    <section>
      <h3 className="text-xl font-bold text-blue-900 mb-2">3. Data Security</h3>
      <p>We implement reasonable security measures to protect your personal information. Your data is securely stored using industry-standard cloud services (Firebase). We do not sell your personal data to third parties.</p>
    </section>
    
    <section>
      <h3 className="text-xl font-bold text-blue-900 mb-2">4. Your Rights</h3>
      <p>You have the right to access, update, or delete your personal information at any time. You can manage your data directly through the app settings or by contacting our support team.</p>
    </section>
  </PageLayout>
);

export const SupportPage = ({ onBack }: LegalPageProps) => (
  <PageLayout title="Support & FAQ" onBack={onBack}>
    <section>
      <h3 className="text-2xl font-bold text-blue-900 mb-6">Frequently Asked Questions</h3>
      <div className="space-y-6">
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2">How do I change my daily goals?</h4>
          <p>You can change your daily water and push-up goals at any time by navigating to the Settings menu (the gear icon) inside the app.</p>
        </div>
        
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2">Is my data synced across devices?</h4>
          <p>Yes! As long as you log in with the same account, your progress, mascot, and history are securely synced across all your devices in real-time.</p>
        </div>
        
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2">I found a bug. How do I report it?</h4>
          <p>We're always looking to improve Nexora. Please send an email to our support team with a description of the issue, and we'll look into it right away.</p>
        </div>
      </div>
    </section>
    
    <section className="mt-12 p-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl text-center">
      <h4 className="text-xl font-black text-blue-900 mb-2">Still need help?</h4>
      <p className="mb-4">Our team is here for you. Reach out to us anytime.</p>
      <a href="mailto:support@nexora.app" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:-translate-y-1 transition-transform">
        Contact Support
      </a>
    </section>
  </PageLayout>
);
