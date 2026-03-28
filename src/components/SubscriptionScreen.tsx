import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Crown } from 'lucide-react';

export function SubscriptionScreen({ onBack }: { onBack: () => void }) {
  const plans = [
    { name: 'Weekly', price: '$3.99', url: 'https://nexora-daily.lemonsqueezy.com/checkout/buy/be209445-5c93-461e-9a2d-5db0e7af2d29' },
    { name: 'Monthly', price: '$9.99', url: 'https://nexora-daily.lemonsqueezy.com/checkout/buy/ca3035cc-8722-4462-bba9-d25bd7d9ea09' },
    { name: 'Yearly', price: '$29.90', url: 'https://nexora-daily.lemonsqueezy.com/checkout/buy/202b9050-b67b-4857-9d58-fe68b7d12b44' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 pb-24 min-h-screen bg-slate-950 text-white"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black">Upgrade to Pro</h1>
      </div>

      <div className="space-y-6">
        {plans.map((plan) => (
          <div key={plan.name} className="glass-card p-6 border border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-transparent rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full text-amber-500">
                <Crown size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl">{plan.name}</h3>
                <p className="text-sm text-slate-400">Unlock all premium features</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const newWindow = window.open(plan.url, '_blank');
                if (!newWindow) {
                  alert("Popup blocked! Please allow popups to proceed to payment.");
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-black transition-all active:scale-95"
            >
              {plan.price}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
