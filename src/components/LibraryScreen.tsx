import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2, Power, PowerOff, Package } from 'lucide-react';
import { LibraryItem } from '../types';

export function LibraryScreen({ 
  items, 
  onActivate, 
  onDeactivate, 
  onDelete, 
  onBack 
}: { 
  items: LibraryItem[]; 
  onActivate: (id: string) => void; 
  onDeactivate: (id: string) => void; 
  onDelete: (id: string) => void; 
  onBack: () => void; 
}) {
  const powerUps = items.filter(item => item.type === 'power-up');
  const skins = items.filter(item => item.type === 'skin');
  const gifts = items.filter(item => item.type === 'gift');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 pb-24 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-blue-100 transition-colors">
          <ArrowLeft size={24} className="text-blue-900" />
        </button>
        <h1 className="text-3xl font-black text-blue-900">My Library</h1>
        <div className="ml-auto p-2 bg-blue-100 rounded-xl">
          <Package size={24} className="text-blue-600" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Package size={40} className="text-blue-200" />
          </div>
          <h2 className="text-xl font-bold text-blue-900 mb-2">Your library is empty</h2>
          <p className="text-blue-900/40 max-w-xs">Visit the shop to buy items and they will appear here!</p>
          <button 
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {powerUps.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Active Power-Ups</h2>
              <div className="grid grid-cols-1 gap-4">
                {powerUps.map((item) => (
                  <LibraryItemCard 
                    key={item.id} 
                    item={item} 
                    onActivate={onActivate} 
                    onDeactivate={onDeactivate} 
                    onDelete={onDelete} 
                  />
                ))}
              </div>
            </section>
          )}

          {skins.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Mascot Styles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skins.map((item) => (
                  <LibraryItemCard 
                    key={item.id} 
                    item={item} 
                    onActivate={onActivate} 
                    onDeactivate={onDeactivate} 
                    onDelete={onDelete} 
                  />
                ))}
              </div>
            </section>
          )}

          {gifts.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Mystery Gifts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gifts.map((item) => (
                  <LibraryItemCard 
                    key={item.id} 
                    item={item} 
                    onActivate={onActivate} 
                    onDeactivate={onDeactivate} 
                    onDelete={onDelete} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </motion.div>
  );
}

function LibraryItemCard({ 
  item, 
  onActivate, 
  onDeactivate, 
  onDelete 
}: { 
  item: LibraryItem; 
  onActivate: (id: string) => void; 
  onDeactivate: (id: string) => void; 
  onDelete: (id: string) => void; 
}) {
  return (
    <div className={`glass-card p-4 flex items-center gap-4 transition-all ${item.activated ? 'border-blue-500 bg-blue-50/50' : 'border-transparent'}`}>
      <div className="text-4xl drop-shadow-sm">{item.icon}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-blue-900 truncate">{item.name}</h3>
        <p className="text-[10px] text-blue-900/40 font-medium">
          {item.activated ? 'Currently Active' : 'Inactive'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {item.activated ? (
          <button 
            onClick={() => onDeactivate(item.id)}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            title="Deactivate"
          >
            <PowerOff size={18} />
          </button>
        ) : (
          <button 
            onClick={() => onActivate(item.id)}
            className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
            title="Activate"
          >
            <Power size={18} />
          </button>
        )}
        <button 
          onClick={() => onDelete(item.id)}
          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          title="Delete (Return to Shop)"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
