"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import SpecsTable from "@/components/registry/SpecsTable";
import MediaGallery from "@/components/registry/MediaGallery";
import TraceLineSVG from "@/components/registry/TraceLineSVG";
import { VoltageIcon, PinoutIcon, SensorIcon, PowerIcon } from "@/components/icons/hardware/Icons";
import { motion } from "framer-motion";
import { MapPin, Globe, Share2, Printer } from "lucide-react";

// Mock Data (matches WikiPage)
const MOCK_ITEMS = {
  "esp32-wroom-32": {
    slug: "esp32-wroom-32",
    name: "ESP32-WROOM-32D",
    category: "mcu",
    tags: ["Wi-Fi", "Bluetooth", "Dual-Core"],
    description: "The ESP32-WROOM-32D is a powerful, generic Wi-Fi+BT+BLE MCU module that targets a wide variety of applications, ranging from low-power sensor networks to the most demanding tasks.",
    specifications: { 
      "Voltage": "3.3V", 
      "Clock Speed": "240 MHz", 
      "Core Count": "2x Xtensa® Dual-Core 32-bit LX6",
      "Flash Memory": "4 MB",
      "RAM": "520 KB SRAM",
      "Interface": "GPIO, UART, SPI, I2C, I2S"
    },
    image: "https://www.espressif.com/sites/default/files/esp32-wroom-32d_32u_front.png",
    media: [
      "https://www.espressif.com/sites/default/files/esp32-wroom-32d_32u_front.png",
      "https://m.media-amazon.com/images/I/61M6YhN6E6L._AC_SL1500_.jpg"
    ],
    guides: [
      {
        id: "1",
        title: "Initial Setup and Hello World",
        hyperlocalTags: ["Region: Globl", "Supplier: AliExpress"],
        content: "Detailed setup instructions for the Arduino IDE..."
      }
    ]
  }
};

export default function RegistryDetailPage() {
  const { slug } = useParams();
  const item = MOCK_ITEMS[slug as keyof typeof MOCK_ITEMS] || Object.values(MOCK_ITEMS)[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative">
        <TraceLineSVG />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          {/* Left Column: Image & Media */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="technical-card p-12 aspect-square flex items-center justify-center bg-white"
            >
              <div className="absolute top-4 left-4 font-mono text-[10px] text-slate-400">REFERENCE_UNIT_A1</div>
              <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
            </motion.div>

            <div className="space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Visual Evidence</h3>
              <MediaGallery urls={item.media} />
            </div>
          </div>

          {/* Right Column: Title, Specs, Content */}
          <div className="lg:col-span-7 space-y-12">
            <header>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 border border-blue-500 text-blue-600 text-[10px] font-mono font-bold uppercase">
                  {item.category}
                </span>
                <span className="text-slate-300 font-mono text-[10px]">VERIFIED_COMPONENT</span>
              </div>
              <h1 className="text-5xl font-bold tracking-tighter uppercase mb-4">{item.name}</h1>
              <p className="text-slate-600 text-lg leading-relaxed font-sans max-w-2xl">
                {item.description}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <SpecsTable specs={item.specifications} />
              </div>

              <div className="space-y-6">
                <div className="technical-card p-6 flex flex-col gap-4">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2">Active State Indicators</h4>
                  <div className="flex justify-between items-center group cursor-default">
                    <div className="flex items-center gap-2">
                      <VoltageIcon active />
                      <span className="text-xs font-mono">SUPPLY_VOLTAGE</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600">3.3V DC</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-default">
                    <div className="flex items-center gap-2">
                      <PinoutIcon active />
                      <span className="text-xs font-mono">PIN_DENSITY</span>
                    </div>
                    <span className="text-xs font-mono font-bold">38-PIN</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-default">
                    <div className="flex items-center gap-2">
                      <PowerIcon active />
                      <span className="text-xs font-mono">POWER_PROFILE</span>
                    </div>
                    <span className="text-xs font-mono font-bold">LOW_SLEEP</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 px-4 py-3 border border-technical-border font-mono text-[10px] font-bold uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" /> Share blueprint
                  </button>
                  <button className="flex-1 px-4 py-3 border border-technical-border font-mono text-[10px] font-bold uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Printer className="h-4 w-4" /> Export data
                  </button>
                </div>
              </div>
            </div>

            {/* Hyperlocal Guides */}
            <section className="pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight uppercase">Hyperlocal Knowledge</h2>
                <button className="text-xs font-mono font-bold text-blue-600 hover:underline">CONTRIBUTE_LOCAL_GUIDE</button>
              </div>

              <div className="space-y-6">
                {item.guides.map(guide => (
                  <motion.div 
                    key={guide.id}
                    whileHover={{ x: 5 }}
                    className="technical-card p-8 group"
                  >
                    <div className="flex flex-wrap gap-2 mb-4">
                      {guide.hyperlocalTags.map(tag => (
                        <div key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 text-white font-mono text-[9px] uppercase tracking-wider">
                          <MapPin className="h-3 w-3 text-blue-400" />
                          {tag}
                        </div>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors uppercase">{guide.title}</h3>
                    <p className="text-slate-500 text-sm mb-6">{guide.content}</p>
                    <button className="px-4 py-2 border border-slate-200 font-mono text-[10px] font-bold uppercase hover:circuit-glow">
                      Open documentation node
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
