import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Crown, Zap, Star } from 'lucide-react';

export function SubscriptionScreen({ onBack, userId }: { onBack: () => void, userId: string }) {
  const plans = [
    { name: 'Weekly', price: '$3.99', description: 'Perfect for a quick boost to your routine.', url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/be209445-5c93-461e-9a2d-5db0e7af2d29?checkout[custom][user_id]=${userId}` },
    { name: 'Monthly', price: '$9.99', description: 'The most popular choice for steady progress.', url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/ca3035cc-8722-4462-bba9-d25bd7d9ea09?checkout[custom][user_id]=${userId}` },
    { name: 'Yearly', price: '$29.90', description: 'Best value for long-term transformation.', url: `https://nexora-daily.lemonsqueezy.com/checkout/buy/202b9050-b67b-4857-9d58-fe68b7d12b44?checkout[custom][user_id]=${userId}` },
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

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-3xl font-black text-white drop-shadow-lg">Upgrade to Pro</h1>
        </div>

        {/* Animated Subscription Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <motion.img 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src="https://i.postimg.cc/yxF522mf/Subscription-plan-selection-for-Nexora.png" 
            alt="Subscription Plan" 
            className="w-full max-w-md rounded-3xl shadow-2xl shadow-amber-500/20 border border-white/10"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-500/30">
              <Crown size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Nexora Pro</h2>
              <p className="text-amber-300 font-medium">Unlock your full potential</p>
            </div>
          </div>
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                key={feature.title} 
                className="flex items-start gap-3 text-white/90"
              >
                <div className="bg-emerald-500/20 p-1 rounded-full text-emerald-400 mt-1 flex-shrink-0 border border-emerald-500/30">
                  <Check size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{feature.title}</h4>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {plans.map((plan, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              key={plan.name} 
              className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between hover:border-amber-400/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex-1 mr-4">
                <h3 className="font-black text-xl text-white group-hover:text-amber-300 transition-colors">{plan.name}</h3>
                <p className="text-sm text-white/50 font-medium">{plan.description}</p>
              </div>
              <button 
                onClick={() => {
                  const newWindow = window.open(plan.url, '_blank');
                  if (!newWindow) {
                    alert("Popup blocked! Please allow popups to proceed to payment.");
                  }
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-6 py-3 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-amber-500/25"
              >
                {plan.price}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

