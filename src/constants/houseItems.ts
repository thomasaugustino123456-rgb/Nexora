import { HouseItem } from '../types';

export const HOUSE_ITEMS: HouseItem[] = [
  // Room 0 (Isometric)
  { id: 'h0-picture', name: 'Art Frame', description: 'A beautiful landscape for your wall.', price: 5, coinPrice: 100, icon: '🖼️', room: 0, category: 'decoration' },
  { id: 'h0-table', name: 'Work Table', description: 'A sturdy wooden table for your projects.', price: 15, coinPrice: 300, icon: '🪑', room: 0, category: 'furniture' },
  { id: 'h0-laptop', name: 'Nexora Laptop', description: 'High-performance laptop for work.', price: 25, coinPrice: 500, icon: '💻', room: 0, category: 'electronics' },
  { id: 'h0-chair', name: 'Ergo Chair', description: 'Comfortable chair for long sessions.', price: 10, coinPrice: 200, icon: '💺', room: 0, category: 'furniture' },
  { id: 'h0-plant', name: 'Desk Plant', description: 'A touch of green for your space.', price: 3, coinPrice: 50, icon: '🪴', room: 0, category: 'decoration' },
  { id: 'h0-lamp', name: 'Ceiling Lamp', description: 'Brightens up the whole room.', price: 8, coinPrice: 150, icon: '💡', room: 0, category: 'lighting' },

  // Room 1 (Cartoon)
  { id: 'h1-window', name: 'Pink Window', description: 'Let the sunshine in.', price: 12, coinPrice: 250, icon: '🪟', room: 1, category: 'other' },
  { id: 'h1-shelves', name: 'Wall Shelves', description: 'Perfect for your book collection.', price: 10, coinPrice: 200, icon: '📚', room: 1, category: 'furniture' },
  { id: 'h1-dresser', name: 'Yellow Dresser', description: 'Store all your mascot skins.', price: 18, coinPrice: 350, icon: '🚪', room: 1, category: 'furniture' },
  { id: 'h1-vanity', name: 'Makeup Vanity', description: 'Check your look before heading out.', price: 20, coinPrice: 400, icon: '🪞', room: 1, category: 'furniture' },
  { id: 'h1-sofa', name: 'White Sofa', description: 'Super comfy for relaxing.', price: 30, coinPrice: 600, icon: '🛋️', room: 1, category: 'furniture' },
  { id: 'h1-bed', name: 'Green Bed', description: 'Rest well for tomorrow\'s challenges.', price: 35, coinPrice: 700, icon: '🛏️', room: 1, category: 'furniture' },
  { id: 'h1-bookshelf', name: 'Tall Bookshelf', description: 'A massive shelf for a massive brain.', price: 22, coinPrice: 450, icon: '📖', room: 1, category: 'furniture' },
  { id: 'h1-desk', name: 'Study Desk', description: 'Where the magic happens.', price: 15, coinPrice: 300, icon: '✍️', room: 1, category: 'furniture' },
  { id: 'h1-chair', name: 'Pink Chair', description: 'Stylish and functional.', price: 10, coinPrice: 200, icon: '🪑', room: 1, category: 'furniture' },

  // Room 2 (Cozy)
  { id: 'h2-fireplace', name: 'Stone Fireplace', description: 'Warmth and comfort for your home.', price: 50, coinPrice: 1000, icon: '🔥', room: 2, category: 'furniture' },
  { id: 'h2-chair-left', name: 'Cozy Armchair (L)', description: 'Perfect for reading by the fire.', price: 25, coinPrice: 500, icon: '🛋️', room: 2, category: 'furniture' },
  { id: 'h2-chair-right', name: 'Cozy Armchair (R)', description: 'Another one for your friends.', price: 25, coinPrice: 500, icon: '🛋️', room: 2, category: 'furniture' },
  { id: 'h2-coffee-table', name: 'Wood Coffee Table', description: 'A place for your water bottle.', price: 15, coinPrice: 300, icon: '☕', room: 2, category: 'furniture' },
  { id: 'h2-side-table', name: 'Small Side Table', description: 'Handy for small items.', price: 8, coinPrice: 150, icon: '🪵', room: 2, category: 'furniture' },
  { id: 'h2-shelf', name: 'Display Shelf', description: 'Show off your trophies.', price: 12, coinPrice: 250, icon: '🖼️', room: 2, category: 'furniture' },
  { id: 'h2-lamp', name: 'Floor Lamp', description: 'Soft lighting for cozy nights.', price: 10, coinPrice: 200, icon: '💡', room: 2, category: 'lighting' },
];
