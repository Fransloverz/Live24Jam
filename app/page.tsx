"use client";

import { useState } from "react";
import Link from "next/link";

// Navigation Component
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">24</span>
            </div>
            <span className="text-xl font-bold text-white">Live24Jam</span>
          </a>

          <div className="flex items-center gap-4">
            <a href="#paket" className="hidden sm:block text-gray-300 hover:text-white transition-colors">Paket</a>
            <a
              href="https://wa.me/6288238880227?text=Halo,%20saya%20mau%20order%20jasa%20live%20streaming"
              target="_blank"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Hero Section
function Hero() {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center pt-20">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/20 rounded-full filter blur-[120px] animate-pulse"></div>
      </div>

      <div className="container relative z-10 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-sm font-medium">Jasa Live Streaming Terpercaya</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Live Streaming{" "}
            <span className="text-orange-500">
              16 Jam
            </span>
            <br />
            <span className="text-3xl md:text-5xl text-yellow-400">Cuma Rp 10.000!</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Tinggal kirim video dan stream key, kami yang streamingkan 24 jam nonstop.
            <span className="text-white font-medium"> Tanpa ribet, tanpa komputer menyala!</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="https://wa.me/6288238880227?text=Halo,%20saya%20mau%20order%20jasa%20live%20streaming%2024%20jam"
              target="_blank"
              className="group bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-green-500/30 transition-all"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Order via WhatsApp
            </a>
            <a href="#paket" className="border border-gray-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
              Lihat Paket
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Proses Cepat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Bayar via Transfer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Support 24 Jam</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function Pricing() {
  const plans = [
    {
      name: "1 x 16 Jam",
      price: "10",
      desc: "Live streaming 16 jam nonstop",
      features: [
        "1 Channel Streaming",
        "HD Quality (720p/1080p)",
        "YouTube / Facebook / TikTok",
        "Auto-restart jika error",
        "Video tersimpan di YouTube",
        "Support WhatsApp",
      ],
      popular: true,
    },
    {
      name: "3 x 16 Jam",
      price: "25",
      desc: "Hemat untuk 3 hari streaming",
      features: [
        "1 Channel Streaming",
        "HD Quality (720p/1080p)",
        "YouTube / Facebook / TikTok",
        "Auto-restart jika error",
        "Video tersimpan di YouTube",
        "Support WhatsApp 24/7",
        "Bonus: Setup gratis",
      ],
      popular: false,
    },
    {
      name: "7 x 16 Jam",
      price: "50",
      desc: "Paket mingguan terbaik",
      features: [
        "1 Channel Streaming",
        "Full HD Quality",
        "Multi Platform",
        "Auto-restart jika error",
        "Video tersimpan di YouTube",
        "Priority WhatsApp Support",
        "Setup gratis",
        "Monitoring harian",
      ],
      popular: false,
    },
  ];

  return (
    <section id="paket" className="py-20 bg-gray-900/50">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Harga Terjangkau</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Pilih <span className="text-orange-500">Paket</span> Kamu
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Tinggal kirim video dan stream key, kami yang handle semuanya!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-2xl p-6 ${plan.popular
              ? "bg-gradient-to-b from-orange-500/10 to-red-500/10 border-2 border-orange-500/50 scale-105"
              : "bg-gray-800/50 border border-gray-700"
              }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  PALING LARIS
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-gray-500">Rp</span>
                  <span className="text-5xl font-bold text-orange-500">{plan.price}</span>
                  <span className="text-gray-500">rb</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`https://wa.me/6288238880227?text=Halo,%20saya%20mau%20order%20paket%20${encodeURIComponent(plan.name)}`}
                target="_blank"
                className={`block text-center py-3 rounded-full font-semibold transition-all ${plan.popular
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
              >
                💬 Order WhatsApp
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How to Order Section
function HowToOrder() {
  const steps = [
    { icon: "1️⃣", title: "Hubungi WhatsApp", desc: "Chat kami di 088238880227" },
    { icon: "2️⃣", title: "Kirim Video & Stream Key", desc: "Upload video via Google Drive" },
    { icon: "3️⃣", title: "Transfer Pembayaran", desc: "Bayar sesuai paket yang dipilih" },
    { icon: "4️⃣", title: "Streaming Jalan!", desc: "Kami proses, streaming langsung live" },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Order</h2>
          <p className="text-gray-400">Prosesnya cepat dan mudah!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Contact Banner
function ContactBanner() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-3xl p-8 md:p-12 text-center">
          <span className="text-5xl block mb-4">📱</span>
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Hubungi Kami Sekarang!</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Respon cepat, proses mudah. Streaming Anda langsung jalan dalam hitungan menit!
          </p>
          <a
            href="https://wa.me/6288238880227?text=Halo,%20saya%20mau%20order%20jasa%20live%20streaming"
            target="_blank"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-full font-bold text-xl transition-all hover:shadow-xl hover:shadow-green-500/30"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            088238880227
          </a>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-gray-800 py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">24</span>
            </div>
            <span className="font-bold text-white">Live24Jam</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="https://wa.me/6288238880227" className="hover:text-white transition-colors">
              📱 088238880227
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Login Admin
            </Link>
          </div>

          <p className="text-gray-600 text-sm">
            © 2025 Live24Jam
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Pricing />
        <HowToOrder />
        <ContactBanner />
      </main>
      <Footer />
    </>
  );
}
