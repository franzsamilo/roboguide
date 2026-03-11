"use client";

import Link from "next/link";
import { Cpu, Zap } from "lucide-react";

const RESOURCE_LINKS = [
  { href: "/wiki", label: "Hardware Registry" },
  { href: "/projects", label: "Community Projects" },
  { href: "/submit", label: "Submit Content" },
];

const CATEGORY_LINKS = [
  { href: "/wiki?category=mcu", label: "Microcontrollers" },
  { href: "/wiki?category=sensor", label: "Sensors" },
  { href: "/wiki?category=communication", label: "Communication" },
  { href: "/wiki?category=display", label: "Displays" },
  { href: "/wiki?category=power", label: "Power Management" },
  { href: "/wiki?category=actuator", label: "Actuators & Motors" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">
                ROBOGUIDE
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your go-to resource for IoT tutorials and electronics guides. Quick, easy, and to the point.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ROBOGUIDE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
