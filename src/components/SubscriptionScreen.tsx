import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Zap, Star } from 'lucide-react';

export function SubscriptionScreen({ onBack, userId }: { onBack: () => void, userId: string }) {
  const plans = [
    { 
      id: 'weekly',
      name: 'Weekly', 
      price: '$3.99', 
      period: 'per week',
      description: 'Full access for 7 days. Perfect for a quick boost to your routine.', 
      features: ['All Pro Features', '7-Day Access', 'Cancel Anytime'],
      icon: <Zap className="text-blue-400" size={24} />,
      url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/be209445-5c93-461e-9a2d-5db0e7af2d29?checkout[custom][user_id]=${userId}` 
    },
    { 
      id: 'monthly',
      name: 'Monthly', 
      price: '$9.99', 
      period: 'per month',
      description: 'The most popular choice for steady progress and lasting habits.', 
      features: ['All Pro Features', 'Monthly Billing', 'Priority Support'],
      icon: <Star className="text-amber-400" size={24} />,
      popular: true,
      url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/ca3035cc-8722-4462-bba9-d25bd7d9ea09?checkout[custom][user_id]=${userId}` 
    },
    { 
      id: 'yearly',
      name: 'Yearly', 
      price: '$29.90', 
      period: 'per year',
      description: 'Ultimate value for long-term transformation and peak performance.', 
      features: ['All Pro Features', 'Best Value (Save 75%)', 'Exclusive Content'],
      icon: <Crown className="text-orange-400" size={24} />,
      bestValue: true,
      url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/202b9050-b67b-4857-9d58-fe68b7d12b44?checkout[custom][user_id]=${userId}` 
    },
  ];

  const features = [
    { title: 'Unlimited Streaks', description: 'Never lose your progress, even if you miss a day.' },
    { title: 'Exclusive Mascot Skins', description: 'Customize your companion with premium looks.' },
    { title: 'Advanced Progress Analytics', description: 'Deep insights into your habits and growth.' },
    { title: 'Ad-free Experience', description: 'Focus entirely on your journey without distractions.' },
    { title: 'Custom Challenge Goals', description: 'Set your own pace with adjustable daily targets.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 pb-24 min-h-screen relative overflow-hidden bg-slate-950 text-white"
    >
      {/* Animated Glowing Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/20 blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/20 blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md group">
            <ArrowLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Nexora Pro</h1>
            <p className="text-slate-400 font-medium">Choose the plan that fits your journey</p>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              className={`relative group rounded-3xl p-8 flex flex-col h-full transition-all duration-500 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-2 border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]' 
                  : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              {plan.bestValue && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Best Value
                </div>
              )}

              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.popular ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm font-medium">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed min-h-[3rem]">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className={`p-0.5 rounded-full ${plan.popular ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-slate-400'}`}>
                      <Check size={14} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const newWindow = window.open(plan.url, '_blank');
                  if (!newWindow) {
                    alert("Popup blocked! Please allow popups to proceed to payment.");
                  }
                }}
                className={`w-full py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-amber-500/25'
                    : 'bg-white text-slate-950 hover:bg-slate-100'
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Crown size={120} className="text-amber-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-500/30">
                <Crown size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Pro Features</h2>
                <p className="text-amber-300/80 font-bold uppercase text-[10px] tracking-[0.2em]">Unlock your full potential</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={feature.title} 
                  className="flex items-start gap-4"
                >
                  <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400 mt-1 flex-shrink-0 border border-amber-500/30">
                    <Check size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust/Security Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-xs font-medium flex items-center justify-center gap-2">
            <Zap size={12} className="text-amber-500" /> Secure checkout powered by Lemon Squeezy
          </p>
        </div>
      </div>
    </motion.div>
  );
}

