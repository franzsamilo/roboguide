"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/ui/Navbar";
import AdaptiveSidebar from "@/components/wiki/AdaptiveSidebar";
import RegistryCard from "@/components/wiki/RegistryCard";
import { Search, Radar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RegistryItem } from "@/lib/schemas";

// Mock Data
const MOCK_ITEMS: RegistryItem[] = [
  {
    slug: "esp32-wroom-32",
    name: "ESP32-WROOM-32D",
    category: "mcu",
    tags: ["Wi-Fi", "Bluetooth", "Dual-Core"],
    specifications: { "Voltage": "3.3V", "Clock": "240MHz", "Cores": 2 },
    image: "https://www.espressif.com/sites/default/files/esp32-wroom-32d_32u_front.png"
  },
  {
    slug: "dht22-sensor",
    name: "DHT22 Temperature & Humidity",
    category: "sensor",
    tags: ["Digital", "I2C", "Low Power"],
    specifications: { "Range": "-40 to 80C", "Accuracy": "0.5C", "Voltage": "3-5V" }
  },
  {
    slug: "tp4056-charger",
    name: "TP4056 Li-Ion Charger",
    category: "power",
    tags: ["USB-C", "1A", "Protection"],
    specifications: { "Input": "5V", "Output": "4.2V", "Current": "1A" }
  }
];

const CATEGORIES = [
  { id: "mcu", name: "Microcontrollers", count: 1 },
  { id: "sensor", name: "Sensors", count: 1 },
  { id: "power", name: "Power Management", count: 1 }
];

export default function WikiPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                           item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !activeCategory || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter mb-2 font-sans uppercase">Hardware Registry</h1>
              <p className="text-slate-500 font-mono text-sm tracking-wide">
                SYSTEM_ACCESS: READ_ONLY // {filteredItems.length} DATABASE_ENTRIES
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="PROXIMITY_SEARCH [TAGS/NAME]..."
                className="block w-full pl-10 pr-12 py-3 border border-technical-border bg-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Radar className={`h-4 w-4 ${search ? 'text-blue-500 animate-pulse' : 'text-slate-300'}`} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-12">
          <AdaptiveSidebar 
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="flex-grow">
            <AnimatePresence mode="popLayout">
              {filteredItems.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RegistryCard item={item} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="technical-card p-12 text-center border-dashed border-slate-300"
                >
                  <p className="font-mono text-sm text-slate-400">NO_RECORDS_FOUND_FOR_QUERY</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
