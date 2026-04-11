import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { BookOpen, Cpu, FolderOpen, ArrowRight, Sparkles, Compass, Lightbulb, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Getting Started",
  description: "New to ROBOGUIDE? Start here. Three paths for learning, following tutorials, or building your own IoT project.",
};

const PATHS = [
  {
    id: "learn",
    title: "Learn a Component",
    tagline: "I want to understand how a chip, sensor, or module works.",
    icon: Cpu,
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    href: "/wiki",
    cta: "Browse the Hardware Wiki",
    steps: [
      "Pick a category (MCU, sensor, display, etc.)",
      "Read specs, pinouts, and datasheet links",
      "See community guides and real projects using it",
    ],
  },
  {
    id: "follow",
    title: "Follow a Tutorial",
    tagline: "I want step-by-step instructions to get something working.",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    href: "/guides",
    cta: "Explore Guides",
    steps: [
      "Search for your component or topic",
      "Follow hyperlocal tips from people in your region",
      "Bookmark what you want to come back to",
    ],
  },
  {
    id: "build",
    title: "Build Something",
    tagline: "I want to make my own project and share it.",
    icon: FolderOpen,
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    href: "/projects",
    cta: "See Community Projects",
    steps: [
      "Browse what others have built",
      "Reuse parts lists and code snippets",
      "Share your own build when it's ready",
    ],
  },
];

const TIPS = [
  {
    icon: Compass,
    title: "Use URL-sharable filters",
    desc: "Every category, search, and tag updates the URL — share /wiki?category=sensor with a friend and they see exactly what you see.",
  },
  {
    icon: Lightbulb,
    title: "Markdown everywhere",
    desc: "Descriptions, guides, and projects all render full markdown — use headings, code blocks, and links to make your content shine.",
  },
  {
    icon: Wrench,
    title: "Link your parts to the wiki",
    desc: "When you submit a project, use the part picker to link components from the wiki. Readers can click through to specs and datasheets.",
  },
  {
    icon: Sparkles,
    title: "Bookmark and come back",
    desc: "Hit Save on any component, guide, or project and find them later on your profile. No folders, no fuss.",
  },
];

export default function StartPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 to-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600">New here?</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-5">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">ROBOGUIDE</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Three paths depending on what you&apos;re trying to do. Pick the one that fits
              and we&apos;ll get you moving in less than a minute.
            </p>
          </div>
        </section>

        {/* Three paths */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PATHS.map((path) => {
              const Icon = path.icon;
              return (
                <Link
                  key={path.id}
                  href={path.href}
                  className={`card-flat p-6 flex flex-col gap-4 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all group`}
                >
                  <div className={`w-12 h-12 rounded-xl ${path.bg} border ${path.border} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${path.text}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1.5">{path.title}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">{path.tagline}</p>
                  </div>
                  <ol className="space-y-2 mt-1">
                    {path.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full ${path.bg} ${path.text} font-bold text-xs flex items-center justify-center`}>
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${path.text} group-hover:gap-2 transition-all`}>
                      {path.cta} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Tips */}
        <section className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
                Things you should know
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Small details that make ROBOGUIDE much more useful once you know about them.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {TIPS.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="card-flat p-6 flex gap-4 bg-white hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contribute CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to contribute?</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-6">
            Know something about a component, have a tutorial in your head, or just
            finished a cool build? Share it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/submit?type=component" className="btn-outline">
              <Cpu className="h-4 w-4" /> Add a Component
            </Link>
            <Link href="/submit?type=guide" className="btn-outline">
              <BookOpen className="h-4 w-4" /> Write a Guide
            </Link>
            <Link href="/submit?type=project" className="btn-primary">
              <FolderOpen className="h-4 w-4" /> Share a Project
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
