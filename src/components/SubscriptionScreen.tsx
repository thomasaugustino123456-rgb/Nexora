import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Crown, Zap, Star } from 'lucide-react';

export function SubscriptionScreen({ onBack }: { onBack: () => void }) {
  const plans = [
    { name: 'Weekly', price: '$3.99', url: 'https://nexora-daily.lemonsqueezy.com/checkout/buy/be209445-5c93-461e-9a2d-5db0e7af2d29' },
    { name: 'Monthly', price: '$9.99', url: 'https://nexora-daily.lemonsqueezy.com/checkout/buy/ca3035cc-8722-4462-bba9-d25bd7d9ea09' },
    { name: 'Yearly', price: '$29.90', url: 'https://nexora-daily.lemonsqueezy.com/checkout/buy/202b9050-b67b-4857-9d58-fe68b7d12b44' },
  ];

  const features = [
    'Unlimited streaks',
    'Exclusive mascot skins',
    'Advanced progress analytics',
    'Ad-free experience',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 pb-24 min-h-screen bg-blue-50 text-blue-950"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-blue-100 transition-colors">
          <ArrowLeft size={24} className="text-blue-900" />
        </button>
        <h1 className="text-3xl font-black text-blue-900">Upgrade to Pro</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-amber-100 rounded-2xl text-amber-600">
            <Crown size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-blue-900">Nexora Pro</h2>
            <p className="text-blue-600 font-medium">Unlock your full potential</p>
          </div>
        </div>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-blue-800 font-medium">
              <div className="bg-emerald-100 p-1 rounded-full text-emerald-600">
                <Check size={16} />
              </div>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between hover:border-amber-300 transition-all">
            <div>
              <h3 className="font-black text-xl text-blue-900">{plan.name}</h3>
              <p className="text-sm text-blue-500 font-medium">Best for {plan.name.toLowerCase()} consistency</p>
            </div>
            <button 
              onClick={() => {
                const newWindow = window.open(plan.url, '_blank');
                if (!newWindow) {
                  alert("Popup blocked! Please allow popups to proceed to payment.");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              {plan.price}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
