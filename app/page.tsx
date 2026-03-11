"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Cpu, Radio, Zap, Wifi, Monitor, Cog, ArrowRight, BookOpen, FolderOpen, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getRegistryItems } from "@/lib/firebase/registryService";
import { getProjects } from "@/lib/firebase/projectService";
import type { RegistryItem, Project } from "@/lib/schemas";

const CATEGORIES = [
  {
    id: "mcu",
    name: "Microcontrollers",
    description: "Arduino, ESP32, STM32 and more. Learn how to program and interface with popular MCUs.",
    icon: Cpu,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "sensor",
    name: "Sensors",
    description: "Temperature, motion, pressure, and more. Interface sensors with your microcontroller projects.",
    icon: Radio,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
  },
  {
    id: "power",
    name: "Power Management",
    description: "Voltage regulators, battery management, and power supply circuits for your projects.",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    id: "communication",
    name: "Communication",
    description: "WiFi, Bluetooth, LoRa, and serial protocols. Connect your devices to the world.",
    icon: Wifi,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    id: "display",
    name: "Displays",
    description: "OLED, LCD, TFT, and LED displays. Add visual output to your electronics projects.",
    icon: Monitor,
    color: "from-sky-500 to-cyan-600",
    bgColor: "bg-sky-50",
    textColor: "text-sky-600",
  },
  {
    id: "actuator",
    name: "Actuators & Motors",
    description: "Servos, stepper motors, DC motors, and solenoids. Add movement to your builds.",
    icon: Cog,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Home() {
  const [recentItems, setRecentItems] = useState<RegistryItem[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    getRegistryItems({ pageSize: 6 })
      .then((res) => setRecentItems(res.items))
      .catch(() => {});
    getProjects({ pageSize: 4 })
      .then((res) => setRecentProjects(res.projects))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-semibold text-blue-600">
                  Your IoT Learning Hub
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-5 leading-[1.1]"
              >
                Learn IoT{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  the Easy Way
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Quick, easy, and to the point! Tutorials, pinouts, datasheets, and community projects for Arduino, ESP32, sensors, and more.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/wiki" className="btn-primary px-8 py-3 text-base">
                  <BookOpen className="h-5 w-5" />
                  Explore Components
                </Link>
                <Link href="/projects" className="btn-outline px-8 py-3 text-base">
                  <FolderOpen className="h-5 w-5" />
                  View Projects
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Category Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Browse by Category
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Dive into our curated collection of IoT components, tutorials, and guides organized by category.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                >
                  <Link href={`/wiki?category=${cat.id}`}>
                    <div className="category-card h-full">
                      <div className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${cat.textColor}`} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed grow">
                        {cat.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 mt-1 group-hover:gap-2 transition-all">
                        Explore <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Recently Added Components */}
        {recentItems.length > 0 && (
          <section className="bg-gray-50 py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recently Added</h2>
                  <p className="text-gray-500 text-sm mt-1">Latest components in the registry</p>
                </div>
                <Link
                  href="/wiki"
                  className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentItems.map((item, i) => (
                  <motion.div
                    key={item.slug}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href={`/wiki/${item.slug}`}>
                      <div className="card overflow-hidden h-full">
                        <div className="h-44 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <Cpu className="h-14 w-14 text-gray-200" />
                          )}
                        </div>
                        <div className="p-5">
                          <span className="badge badge-blue text-xs mb-2">{item.category}</span>
                          <h3 className="text-base font-semibold text-gray-900 mb-1.5">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                          )}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="badge text-xs">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8 sm:hidden">
                <Link href="/wiki" className="btn-outline">
                  View All Components <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Community Projects */}
        {recentProjects.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Community Projects</h2>
                <p className="text-gray-500 text-sm mt-1">See what makers are building</p>
              </div>
              <Link
                href="/projects"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <div className="card overflow-hidden h-full">
                      <div className="h-40 bg-gray-50 border-b border-gray-100 overflow-hidden">
                        {project.coverImage ? (
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FolderOpen className="h-10 w-10 text-gray-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{project.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                        {project.authorName && (
                          <p className="text-xs text-gray-400 mt-2">by {project.authorName}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
