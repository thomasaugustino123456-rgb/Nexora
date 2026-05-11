import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Zap, Star, MessageSquare } from 'lucide-react';

export function SubscriptionScreen({ 
  onBack, 
  userId, 
  onActivatePro,
  onSendTestNotification
}: { 
  onBack: () => void, 
  userId: string,
  onActivatePro?: () => void,
  onSendTestNotification?: (title: string, body: string) => void
}) {
  const plans = [
    { 
      id: 'weekly',
      name: 'Weekly', 
      price: '$1.99', 
      period: 'per week',
      description: 'Quick boost to your discipline. Perfect for testing the power of Nexora.', 
      features: ['UI Architect Lab', 'Challenge Archiving', '7-Day Access'],
      icon: <Zap className="text-blue-400" size={24} />,
      url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/be209445-5c93-461e-9a2d-5db0e7af2d29?checkout[custom][user_id]=${userId}` 
    },
    { 
      id: 'monthly',
      name: 'Monthly', 
      price: '$4.99', 
      period: 'per month',
      description: 'The standard for consistency legends. Most popular for habit masters.', 
      features: ['All Pro Features', 'UI Architect Lab', 'Priority Support'],
      icon: <Star className="text-amber-400" size={24} />,
      popular: true,
      url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/ca3035cc-8722-4462-bba9-d25bd7d9ea09?checkout[custom][user_id]=${userId}` 
    },
    { 
      id: 'yearly',
      name: 'Yearly', 
      price: '$39.99', 
      period: 'per year',
      description: 'Ultimate transformation. Commit to a year of peak human performance.', 
      features: ['Best Value', 'Unlimited Everything', 'Exclusive content'],
      icon: <Crown className="text-orange-400" size={24} />,
      bestValue: true,
      url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/202b9050-b67b-4857-9d58-fe68b7d12b44?checkout[custom][user_id]=${userId}` 
    },
  ];

  const features = [
    { title: 'UI Architect Lab', description: 'Redesign the app your way. Drag, hide, and reorder anything.' },
    { title: 'Challenge Archive', description: 'Filter official app challenges. Only do what moves the needle for you.' },
    { title: 'Exclusive Mascot Skins', description: 'Customize your companion with premium legendary looks.' },
    { title: 'Advanced Analytics', description: 'Deep insights into your habits and growth over months.' },
    { title: 'Unlimited Custom Plans', description: 'Create as many habit blueprints as you need.' },
    { title: 'AI Consistency Coach', description: 'Get personalized feedback on your discipline score.' },
  ];

  const [showManualPay, setShowManualPay] = React.useState(false);

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
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md group">
              <ArrowLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Nexora Pro</h1>
              <p className="text-slate-400 font-medium text-sm">Elevate your growth journey</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button 
              onClick={() => setShowManualPay(!showManualPay)}
              className="text-[10px] font-black uppercase text-blue-400 tracking-widest border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/10 transition-colors"
            >
              Crypto / Local Pay
            </button>
          </div>
        </div>



        {showManualPay && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-8 p-6 bg-blue-500/10 border-2 border-dashed border-blue-500/30 rounded-3xl"
          >
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Zap className="text-blue-400" size={20} />
              SOUTH SUDAN & CRYPTO OPTIONS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <p className="text-slate-300">If your country isn't supported by standard cards, you can pay via <b>Bitcoin</b>, <b>USDT</b>, or <b>m-Gurush</b> manually.</p>
                <div className="space-y-2">
                  <p className="font-bold text-blue-400">1. CHOOSE A PLAN</p>
                  <p className="text-xs opacity-60">Weekly: $1.99 | Monthly: $4.99 | Yearly: $39.99</p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-blue-400">2. SEND CRYPTO / TRANSFER</p>
                  <p className="text-[10px] text-slate-500 mb-1 italic">Note: Use USDT (TRC20/Tron) to save on fees!</p>
                  <p className="text-xs font-mono bg-black/40 p-2 rounded-lg break-all border border-white/5">BTC: [PASTE_YOUR_BITCOIN_ADDRESS_HERE]</p>
                  <p className="text-xs font-mono bg-black/40 p-2 rounded-lg break-all border border-white/5">USDT (TRC20): [PASTE_YOUR_TRON_USDT_ADDRESS_HERE]</p>
                </div>
              </div>
              <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="font-bold text-amber-400">3. SUBMIT PROOF</p>
                <p className="text-xs text-slate-400 leading-relaxed">Once you transfer, send your <b>Nexora UID ({userId})</b> and a <b>Screenshot of payment</b> to our official WhatsApp.</p>
                <button 
                  onClick={() => window.open(`https://api.whatsapp.com/send?phone=211929635502&text=Hi%20Nexora,%20I'd%20like%20to%20activate%20Pro%20manually.%20My%20UID%20is:%20${userId}`, '_blank')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black text-xs transition-all shadow-lg shadow-emerald-500/20 mb-3 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  CHAT ON WHATSAPP
                </button>
                
                {onActivatePro && (
                  <button 
                    onClick={() => {
                      if (confirm("Developer Mode: Activate Pro instantly for testing?")) {
                        onActivatePro();
                        if (onSendTestNotification) {
                          onSendTestNotification("Welcome to Pro, Bro! 👑", "Your manual payment has been verified. The Nexus is now yours to rebuild.");
                        }
                      }
                    }}
                    className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all border border-blue-500/30"
                  >
                    [ADMIN] Auto-Verify My Payment
                  </button>
                )}
                <p className="text-[10px] text-center text-slate-500 italic">Activation usually takes 2-4 hours.</p>
              </div>
            </div>
          </motion.div>
        )}

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
                    console.warn("Popup blocked! Please allow popups to proceed to payment.");
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
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
            <Zap size={12} className="text-amber-500" /> Optimized for Peak human growth
          </p>
        </div>
      </div>
    </motion.div>
  );
}

