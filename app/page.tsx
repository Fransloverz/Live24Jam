"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(end); // Start with end value for SSR
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCount(0); // Reset to 0 then animate

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  // On server and initial render, show end value to match SSR
  if (!isMounted) {
    return <span suppressHydrationWarning>{end.toLocaleString()}{suffix}</span>;
  }

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Navigation Component
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-gray-900/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">24</span>
            </div>
            <span className="text-xl font-bold text-white">Live24Jam</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#cara-kerja" className="text-gray-300 hover:text-white transition-colors">Cara Kerja</a>
            <a href="#keunggulan" className="text-gray-300 hover:text-white transition-colors">Keunggulan</a>
            <a href="#paket" className="text-gray-300 hover:text-white transition-colors">Paket</a>
            <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Masuk</Link>
            <Link href="/dashboard" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all">
              Coba Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in-up">
            <a href="#cara-kerja" className="text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Cara Kerja</a>
            <a href="#keunggulan" className="text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Keunggulan</a>
            <a href="#paket" className="text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Paket</a>
            <a href="#faq" className="text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <Link href="/login" className="text-gray-300 hover:text-white">Masuk</Link>
            <Link href="/dashboard" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2 rounded-full font-medium text-center">
              Coba Gratis
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section - Completely new design
function Hero() {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full filter blur-[150px]"></div>
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }}></div>
      </div>

      <div className="container relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-orange-400 text-sm font-medium">1,234 channel sedang live sekarang</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Streaming{" "}
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                24 Jam Nonstop
              </span>
              <br />
              Tanpa Komputer Menyala
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-lg">
              Lupakan overheat, listrik mahal, dan internet putus.
              <span className="text-white font-medium"> Live24Jam</span> menangani semuanya dari cloud.
              Kamu cukup upload video sekali, streaming jalan terus 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/dashboard" className="group bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:-translate-y-1">
                Mulai Gratis 7 Hari
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#cara-kerja" className="border border-gray-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lihat Demo
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Tanpa Kartu Kredit</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Setup 5 Menit</span>
              </div>
            </div>
          </div>

          {/* Right - Dashboard Preview */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-3xl filter blur-3xl opacity-50"></div>

              {/* Dashboard mockup */}
              <div className="relative bg-gray-900 rounded-2xl border border-gray-800 p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-gray-500 text-xs">live24jam.com/dashboard</span>
                </div>

                <div className="space-y-3">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-400">5</div>
                      <div className="text-xs text-gray-500">Live Aktif</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">847</div>
                      <div className="text-xs text-gray-500">Viewers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">99.9%</div>
                      <div className="text-xs text-gray-500">Uptime</div>
                    </div>
                  </div>

                  {/* Stream list */}
                  {[
                    { title: "Lo-Fi Study Beats", status: "live", viewers: 234 },
                    { title: "Relaxing Piano", status: "live", viewers: 189 },
                    { title: "Rain ASMR", status: "live", viewers: 156 },
                  ].map((stream, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                        🎵
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{stream.title}</div>
                        <div className="text-xs text-gray-500">YouTube • {stream.viewers} viewers</div>
                      </div>
                      <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-xl animate-float">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-gray-400">Auto-restart</div>
            </div>
            <div className="absolute -bottom-4 -left-6 bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-xl animate-float" style={{ animationDelay: "0.5s" }}>
              <div className="text-2xl mb-1">☁️</div>
              <div className="text-xs text-gray-400">Cloud-based</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Stats Section
function Stats() {
  return (
    <section className="py-16 border-y border-gray-800 bg-gray-900/50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 5000, suffix: "+", label: "Channel Aktif" },
            { value: 99.9, suffix: "%", label: "Uptime Server" },
            { value: 1000000, suffix: "+", label: "Jam Streaming" },
            { value: 24, suffix: "/7", label: "Support" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: "📤",
      title: "Upload Video Kamu",
      desc: "Upload video dari komputer atau langsung dari Google Drive. Support MP4, MOV, hingga 5GB."
    },
    {
      step: "02",
      icon: "⚙️",
      title: "Atur Streaming",
      desc: "Masukkan stream key YouTube/Facebook, pilih kualitas, dan atur jadwal jika perlu."
    },
    {
      step: "03",
      icon: "🚀",
      title: "Klik Start",
      desc: "Satu klik, streaming langsung jalan 24/7 dari server cloud kami. Selesai!"
    },
  ];

  return (
    <section id="cara-kerja" className="py-24 relative">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Cara Kerja</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Semudah <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">1-2-3</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Tidak perlu skill teknis. Dalam 5 menit, live streaming 24 jam kamu sudah berjalan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-500/50 to-transparent -translate-x-1/2 z-0"></div>
              )}

              <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-orange-500/50 transition-all group-hover:-translate-y-2 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">{step.icon}</span>
                  <span className="text-5xl font-bold text-gray-800 group-hover:text-orange-500/20 transition-colors">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features/Benefits Section
function Features() {
  const features = [
    {
      icon: "🖥️",
      title: "Komputer Bebas Mati",
      desc: "Streaming jalan terus di cloud. Komputer kamu bisa dimatikan kapan saja.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "💡",
      title: "Hemat Listrik",
      desc: "Tidak perlu PC gaming menyala 24 jam. Hemat jutaan rupiah per bulan.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "🔄",
      title: "Auto-Restart",
      desc: "Streaming mati? Sistem otomatis restart dalam hitungan detik.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: "📱",
      title: "Kontrol dari HP",
      desc: "Kelola semua streaming langsung dari browser di HP atau tablet.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "📅",
      title: "Jadwal Otomatis",
      desc: "Set jadwal sekali, streaming jalan sesuai waktu yang ditentukan.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: "🔗",
      title: "Multi Platform",
      desc: "YouTube dan Facebook dalam satu dashboard. Streaming ke mana saja.",
      color: "from-red-500 to-pink-500"
    },
  ];

  return (
    <section id="keunggulan" className="py-24 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Keunggulan</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Kenapa Pilih <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Live24Jam</span>?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Solusi lengkap untuk content creator yang ingin monetisasi konten 24/7 tanpa repot.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "149",
      desc: "Untuk pemula yang baru mulai",
      features: [
        "5 Live Stream aktif",
        "720p HD Quality",
        "YouTube Support",
        "10GB Storage",
        "Email Support",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "299",
      desc: "Untuk creator serius",
      features: [
        "15 Live Stream aktif",
        "1080p Full HD",
        "YouTube + Facebook",
        "50GB Storage",
        "Priority Support",
        "Auto-Scheduling",
        "Google Drive Import",
      ],
      popular: true,
    },
    {
      name: "Business",
      price: "499",
      desc: "Untuk agensi & bisnis",
      features: [
        "Unlimited Live Stream",
        "4K Ultra HD",
        "All Platforms",
        "200GB Storage",
        "24/7 WhatsApp Support",
        "API Access",
        "Custom Branding",
        "Team Management",
      ],
      popular: false,
    },
  ];

  return (
    <section id="paket" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Harga</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Pilih Paket <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Sesuai Kebutuhan</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Mulai gratis 7 hari. Tidak perlu kartu kredit. Upgrade kapan saja.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-2xl p-8 ${plan.popular
              ? "bg-gradient-to-b from-orange-500/10 to-red-500/10 border-2 border-orange-500/50"
              : "bg-gray-900 border border-gray-800"
              }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  Paling Populer
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-gray-500 text-lg">Rp</span>
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">k/bln</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/dashboard" className={`block text-center py-3 rounded-full font-semibold transition-all ${plan.popular
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/30"
                : "bg-gray-800 text-white hover:bg-gray-700"
                }`}>
                Mulai Sekarang
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Apa itu Live24Jam?",
      a: "Live24Jam adalah platform streaming 24/7 berbasis cloud. Kamu cukup upload video sekali, dan streaming akan berjalan terus menerus dari server kami tanpa perlu komputer atau HP menyala."
    },
    {
      q: "Apakah bisa streaming ke YouTube dan Facebook?",
      a: "Ya! Live24Jam mendukung streaming ke YouTube dan Facebook. Kamu bisa mengatur kedua platform dari satu dashboard yang sama."
    },
    {
      q: "Bagaimana cara upload video dari Google Drive?",
      a: "Cukup hubungkan akun Google Drive kamu, lalu pilih video yang ingin di-streaming. Tidak perlu download ulang ke komputer."
    },
    {
      q: "Apakah streaming akan mati jika internet saya putus?",
      a: "Tidak! Karena streaming berjalan di server cloud kami, kondisi internet kamu tidak berpengaruh. Streaming tetap jalan 24/7."
    },
    {
      q: "Bisa dibatalkan kapan saja?",
      a: "Tentu! Tidak ada kontrak jangka panjang. Kamu bisa upgrade, downgrade, atau berhenti kapan saja sesuai kebutuhan."
    },
  ];

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Pertanyaan <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Umum</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold pr-4">{faq.q}</span>
                <svg className={`w-5 h-5 text-orange-500 flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-gray-400 animate-fade-in-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTA() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="relative bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-3xl p-12 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-orange-500/20 rounded-full filter blur-[100px]"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Streaming 24 Jam Nonstop?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Gabung dengan ribuan content creator yang sudah menghasilkan uang tidur dengan Live24Jam.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all">
              Mulai Gratis Sekarang
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-gray-800 py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">24</span>
              </div>
              <span className="text-xl font-bold text-white">Live24Jam</span>
            </div>
            <p className="text-gray-500 text-sm">
              Platform streaming 24/7 berbasis cloud. Upload sekali, live terus tanpa ribet.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produk</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a></li>
              <li><a href="#keunggulan" className="hover:text-white transition-colors">Keunggulan</a></li>
              <li><a href="#paket" className="hover:text-white transition-colors">Harga</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="mailto:support@live24jam.com" className="hover:text-white transition-colors">📧 Email</a></li>
              <li><a href="https://wa.me/6281234567890" className="hover:text-white transition-colors">💬 WhatsApp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">📖 Panduan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/refund" className="hover:text-white transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          © 2025 Live24Jam. All rights reserved.
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
        <Stats />
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
