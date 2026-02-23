"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { X, ChevronLeft, ChevronRight, ShoppingBag, Droplets, Star, Sparkles } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  is_featured: boolean
}

// ── Extract accent color from product name ─────────────────────────────────────
function getAccentFromName(name: string): { accent: string; bg: string; glow: string } {
  const n = name.toLowerCase()

  // Match color keywords — order matters (more specific first)
  if (n.includes("tiffany blue") || n.includes("tiffany"))
    return { accent: "#0ABAB5", bg: "linear-gradient(160deg,#FFFDF9 0%,#E8FAF9 50%,#C8F5F3 100%)", glow: "rgba(10,186,181,0.18)" }
  if (n.includes("deep purple") || n.includes("purple"))
    return { accent: "#7C3AED", bg: "linear-gradient(160deg,#FDFAFF 0%,#F3EEFF 50%,#E8DCFF 100%)", glow: "rgba(124,58,237,0.15)" }
  if (n.includes("light pink") || n.includes("pink"))
    return { accent: "#F06292", bg: "linear-gradient(160deg,#FFFAF9 0%,#FFF0F5 50%,#FFE0EE 100%)", glow: "rgba(240,98,146,0.15)" }
  if (n.includes("black gray") || n.includes("black grey") || n.includes("charcoal"))
    return { accent: "#374151", bg: "linear-gradient(160deg,#F9FAFB 0%,#F3F4F6 50%,#E5E7EB 100%)", glow: "rgba(55,65,81,0.15)" }
  if (n.includes("(black)") || n.includes("matte black") || (n.endsWith(" black") && !n.includes("black gray")))
    return { accent: "#1A1A2E", bg: "linear-gradient(160deg,#F8F8FC 0%,#EFEFFA 50%,#E2E2F0 100%)", glow: "rgba(26,26,46,0.14)" }
  if (n.includes("(white)") || n.includes("pearl white") || n.includes("ivory"))
    return { accent: "#9CA3AF", bg: "linear-gradient(160deg,#FEFEFE 0%,#F9F9F9 50%,#F0F0F0 100%)", glow: "rgba(156,163,175,0.2)" }
  if (n.includes("sage green") || n.includes("sage"))
    return { accent: "#6B8F71", bg: "linear-gradient(160deg,#F7FAF7 0%,#EAF3EB 50%,#D4E8D6 100%)", glow: "rgba(107,143,113,0.15)" }
  if (n.includes("forest green") || n.includes("dark green") || n.includes("hunter green"))
    return { accent: "#166534", bg: "linear-gradient(160deg,#F0FDF4 0%,#DCFCE7 50%,#BBF7D0 100%)", glow: "rgba(22,101,52,0.15)" }
  if (n.includes("mint green") || n.includes("mint"))
    return { accent: "#34D399", bg: "linear-gradient(160deg,#F0FDF9 0%,#DCFDF2 50%,#A7F3D0 100%)", glow: "rgba(52,211,153,0.15)" }
  if (n.includes("green"))
    return { accent: "#16A34A", bg: "linear-gradient(160deg,#F0FDF4 0%,#DCFCE7 50%,#BBF7D0 100%)", glow: "rgba(22,163,74,0.15)" }
  if (n.includes("sky blue") || n.includes("baby blue") || n.includes("powder blue"))
    return { accent: "#38BDF8", bg: "linear-gradient(160deg,#F0F9FF 0%,#E0F2FE 50%,#BAE6FD 100%)", glow: "rgba(56,189,248,0.15)" }
  if (n.includes("navy blue") || n.includes("navy") || n.includes("ocean blue"))
    return { accent: "#1E40AF", bg: "linear-gradient(160deg,#EFF6FF 0%,#DBEAFE 50%,#BFDBFE 100%)", glow: "rgba(30,64,175,0.15)" }
  if (n.includes("royal blue") || n.includes("cobalt"))
    return { accent: "#2563EB", bg: "linear-gradient(160deg,#EFF6FF 0%,#DBEAFE 50%,#BFDBFE 100%)", glow: "rgba(37,99,235,0.15)" }
  if (n.includes("blue"))
    return { accent: "#3B82F6", bg: "linear-gradient(160deg,#EFF6FF 0%,#DBEAFE 50%,#BFDBFE 100%)", glow: "rgba(59,130,246,0.15)" }
  if (n.includes("coral") || n.includes("salmon"))
    return { accent: "#F87171", bg: "linear-gradient(160deg,#FFF5F5 0%,#FEE2E2 50%,#FECACA 100%)", glow: "rgba(248,113,113,0.15)" }
  if (n.includes("red") || n.includes("crimson") || n.includes("scarlet"))
    return { accent: "#DC2626", bg: "linear-gradient(160deg,#FFF5F5 0%,#FEE2E2 50%,#FECACA 100%)", glow: "rgba(220,38,38,0.15)" }
  if (n.includes("orange") || n.includes("burnt orange") || n.includes("tangerine"))
    return { accent: "#EA580C", bg: "linear-gradient(160deg,#FFF7ED 0%,#FFEDD5 50%,#FED7AA 100%)", glow: "rgba(234,88,12,0.15)" }
  if (n.includes("yellow") || n.includes("mustard") || n.includes("golden") || n.includes("gold"))
    return { accent: "#CA8A04", bg: "linear-gradient(160deg,#FEFCE8 0%,#FEF9C3 50%,#FEF08A 100%)", glow: "rgba(202,138,4,0.15)" }
  if (n.includes("lavender") || n.includes("lilac"))
    return { accent: "#A78BFA", bg: "linear-gradient(160deg,#FDFAFF 0%,#F5F3FF 50%,#EDE9FE 100%)", glow: "rgba(167,139,250,0.16)" }
  if (n.includes("violet") || n.includes("indigo"))
    return { accent: "#6366F1", bg: "linear-gradient(160deg,#FDFAFF 0%,#EEF2FF 50%,#E0E7FF 100%)", glow: "rgba(99,102,241,0.15)" }
  if (n.includes("rose") || n.includes("blush"))
    return { accent: "#FB7185", bg: "linear-gradient(160deg,#FFF5F7 0%,#FFE4E8 50%,#FECDD3 100%)", glow: "rgba(251,113,133,0.15)" }
  if (n.includes("sand") || n.includes("beige") || n.includes("tan") || n.includes("nude"))
    return { accent: "#B45309", bg: "linear-gradient(160deg,#FFFBEB 0%,#FEF3C7 50%,#FDE68A 100%)", glow: "rgba(180,83,9,0.13)" }
  if (n.includes("brown") || n.includes("chocolate") || n.includes("mocha") || n.includes("espresso"))
    return { accent: "#92400E", bg: "linear-gradient(160deg,#FFFBEB 0%,#FEF3C7 50%,#F5DEB3 100%)", glow: "rgba(146,64,14,0.14)" }
  if (n.includes("teal") || n.includes("seafoam"))
    return { accent: "#0D9488", bg: "linear-gradient(160deg,#F0FDFA 0%,#CCFBF1 50%,#99F6E4 100%)", glow: "rgba(13,148,136,0.15)" }
  if (n.includes("cyan") || n.includes("aqua"))
    return { accent: "#06B6D4", bg: "linear-gradient(160deg,#ECFEFF 0%,#CFFAFE 50%,#A5F3FC 100%)", glow: "rgba(6,182,212,0.15)" }
  if (n.includes("silver") || n.includes("chrome") || n.includes("metallic"))
    return { accent: "#6B7280", bg: "linear-gradient(160deg,#F9FAFB 0%,#F3F4F6 50%,#E5E7EB 100%)", glow: "rgba(107,114,128,0.15)" }
  if (n.includes("grey") || n.includes("gray") || n.includes("slate"))
    return { accent: "#64748B", bg: "linear-gradient(160deg,#F8FAFC 0%,#F1F5F9 50%,#E2E8F0 100%)", glow: "rgba(100,116,139,0.15)" }

  // Default warm fallback
  return { accent: "#FF6B35", bg: "linear-gradient(160deg,#FFFDF9 0%,#FFF8EE 50%,#F0FAF8 100%)", glow: "rgba(255,107,53,0.15)" }
}

// ── 3D tilt on mouse move ──────────────────────────────────────────────────────
function use3DTilt(strength = 15) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const cur = useRef({ rx: 0, ry: 0 })
  const tgt = useRef({ rx: 0, ry: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width  - 0.5
      const y = (e.clientY - r.top)  / r.height - 0.5
      tgt.current = { rx: -y * strength, ry: x * strength }
    }
    const onLeave = () => { tgt.current = { rx: 0, ry: 0 } }

    const tick = () => {
      const ease = 0.07
      cur.current.rx += (tgt.current.rx - cur.current.rx) * ease
      cur.current.ry += (tgt.current.ry - cur.current.ry) * ease
      if (el) {
        el.style.transform = `perspective(1000px) rotateX(${cur.current.rx}deg) rotateY(${cur.current.ry}deg)`
      }
      raf.current = requestAnimationFrame(tick)
    }

    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    raf.current = requestAnimationFrame(tick)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [strength])

  return ref
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedProductIndex, setSelectedProductIndex] = useState(0)

  const tiltRef = use3DTilt(14)

  const getImageUrl = (p: string) => {
    if (!p) return "/placeholder.svg"
    if (p.startsWith("http")) return p
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    return `${BASE}/${p.startsWith("images/products/") ? p : `images/products/${p}`}`
  }

  useEffect(() => {
    fetch("/api/products?paginate=false")
      .then(r => r.ok ? r.json() : [])
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!products.length || selectedProduct) return
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % products.length), 5000)
    return () => clearInterval(t)
  }, [products.length, selectedProduct])

  const addToCart = (product: Product) => {
    if (!localStorage.getItem("userToken")) { window.location.href = "/login"; return }
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    }).then(r => alert(r.ok ? `${product.name} added to cart!` : "Failed."))
      .catch(() => alert("Error."))
  }

  const curProduct = products[currentSlide]

  // ── Derive accent + bg from current product name ──
  const { accent, bg, glow } = curProduct
    ? getAccentFromName(curProduct.name)
    : { accent: "#FF6B35", bg: "linear-gradient(160deg,#FFFDF9 0%,#FFF8EE 50%,#F0FAF8 100%)", glow: "rgba(255,107,53,0.15)" }

  // Also derive for selected product in modal
  const modalColors = selectedProduct
    ? getAccentFromName(selectedProduct.name)
    : { accent, bg, glow }

  const next = () => setCurrentSlide(p => (p + 1) % products.length)
  const prev = () => setCurrentSlide(p => p === 0 ? products.length - 1 : p - 1)

  const ticker = [
    "STAY HYDRATED", "FREE SHIPPING", "24H COLD RETENTION",
    "BPA FREE", "STAINLESS STEEL", "PREMIUM QUALITY",
    "STAY HYDRATED", "FREE SHIPPING", "24H COLD RETENTION",
    "BPA FREE", "STAINLESS STEEL", "PREMIUM QUALITY",
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700;12..96,800&family=Nunito:wght@300;400;600;700&display=swap');

        .hr { font-family: 'Nunito', sans-serif; background: #FFFDF9; color: #1A1A1A; }
        .hr * { box-sizing: border-box; }
        .display { font-family: 'Bricolage Grotesque', sans-serif; }

        /* ── Ticker ── */
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tk-track { display:flex; width:max-content; animation: ticker 28s linear infinite; }
        .tk-item  {
          display:flex; align-items:center; gap:1.25rem; padding:0 1.75rem;
          white-space:nowrap; font-size:0.65rem; font-weight:800;
          letter-spacing:0.25em; text-transform:uppercase; color: #1A1A1A;
        }
        .tk-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

        /* ── Entry animations ── */
        @keyframes slideUp   { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn     { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }

        .su { animation: slideUp  0.85s cubic-bezier(.22,1,.36,1) both; }
        .sl { animation: slideLeft 0.85s cubic-bezier(.22,1,.36,1) both; }
        .pi { animation: popIn 0.7s cubic-bezier(.34,1.56,.64,1) both; }
        .fi { animation: fadeIn 1s ease both; }

        .d1{animation-delay:.08s} .d2{animation-delay:.2s}  .d3{animation-delay:.34s}
        .d4{animation-delay:.48s} .d5{animation-delay:.62s} .d6{animation-delay:.76s}

        /* ── Product float ── */
        @keyframes float {
          0%,100% { transform:translateY(0px) rotate(-2deg) scale(1); }
          40%     { transform:translateY(-22px) rotate(0deg) scale(1.02); }
          70%     { transform:translateY(-10px) rotate(-1deg) scale(1.01); }
        }
        .float-img { animation: float 5s ease-in-out infinite; }

        /* ── Shadow breathe ── */
        @keyframes shadow-breathe {
          0%,100% { transform:scaleX(1) scaleY(1);   opacity:0.5; }
          50%     { transform:scaleX(0.75) scaleY(0.6); opacity:0.25; }
        }
        .shadow-breathe { animation: shadow-breathe 5s ease-in-out infinite; }

        /* ── Blob morph ── */
        @keyframes morph {
          0%,100% { border-radius: 62% 38% 70% 30% / 45% 55% 45% 55%; }
          25%     { border-radius: 40% 60% 45% 55% / 60% 40% 60% 40%; }
          50%     { border-radius: 55% 45% 35% 65% / 40% 60% 50% 50%; }
          75%     { border-radius: 70% 30% 60% 40% / 55% 45% 65% 35%; }
        }
        .blob { animation: morph 10s ease-in-out infinite; }

        /* ── Hero BG smooth transition ── */
        .hero-bg { transition: background 0.8s cubic-bezier(.22,1,.36,1); }

        /* ── 3D card ── */
        .card-3d {
          transform-style: preserve-3d;
          will-change: transform;
        }
        .depth-shadow {
          filter: drop-shadow(0 40px 60px rgba(0,0,0,0.18)) drop-shadow(0 8px 20px rgba(0,0,0,0.1));
          transition: filter 0.6s ease;
        }
        .card-3d:hover .depth-shadow {
          filter: drop-shadow(0 60px 80px rgba(0,0,0,0.25)) drop-shadow(0 16px 32px rgba(0,0,0,0.14));
        }

        /* ── Buttons ── */
        .btn-main {
          display:inline-flex; align-items:center; gap:0.6rem;
          color: #fff;
          font-family:'Nunito',sans-serif; font-weight:800; font-size:0.85rem;
          letter-spacing:0.04em;
          padding:0.9rem 2rem; border:none; cursor:pointer;
          border-radius:999px; position:relative; overflow:hidden;
          transition:transform 0.25s ease, box-shadow 0.3s ease;
          text-decoration:none;
        }
        .btn-main:hover { transform:translateY(-3px) scale(1.02); }

        .btn-outline {
          display:inline-flex; align-items:center; gap:0.5rem;
          background:transparent; color:#1A1A1A;
          font-family:'Nunito',sans-serif; font-weight:700; font-size:0.85rem;
          padding:0.875rem 1.75rem; border:2px solid rgba(26,26,26,0.15); cursor:pointer;
          border-radius:999px; transition:all 0.3s ease; text-decoration:none;
        }
        .btn-outline:hover { background:#1A1A1A; color:#fff; border-color:#1A1A1A; }

        /* ── Stat pill ── */
        .stat-pill {
          display:flex; flex-direction:column; align-items:center;
          padding:0.875rem 1.25rem;
          background:white; border-radius:20px;
          box-shadow:0 2px 20px rgba(0,0,0,0.06);
          border:1.5px solid rgba(0,0,0,0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor:default;
        }
        .stat-pill:hover {
          transform:translateY(-4px);
          box-shadow:0 8px 32px rgba(0,0,0,0.1);
        }

        /* ── Thumb ── */
        .thumb {
          width:56px; height:56px; position:relative; flex-shrink:0;
          border-radius:14px; overflow:hidden; cursor:pointer;
          border:2.5px solid transparent;
          background:white; box-shadow:0 2px 12px rgba(0,0,0,0.08);
          transition:all 0.35s cubic-bezier(.34,1.56,.64,1);
        }
        .thumb:hover { transform:scale(1.1) translateY(-2px); }
        .thumb.on { transform:scale(1.12) translateY(-3px); }

        /* ── Nav button ── */
        .nav-btn {
          width:40px; height:40px; border:2px solid rgba(0,0,0,0.1);
          background:white; display:flex; align-items:center; justify-content:center;
          cursor:pointer; border-radius:50%; color:#666;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          transition:all 0.25s ease; flex-shrink:0;
        }
        .nav-btn:hover { transform:scale(1.1); }

        /* ── Product card ── */
        .product-card {
          background:white; border-radius:24px;
          box-shadow:0 4px 30px rgba(0,0,0,0.08);
          overflow:hidden;
          transition: box-shadow 0.4s ease;
        }
        .product-card:hover { box-shadow:0 12px 50px rgba(0,0,0,0.12); }

        /* ── View btn ── */
        .view-btn {
          font-family:'Nunito',sans-serif; font-weight:800; font-size:0.7rem;
          letter-spacing:0.06em; padding:0.5rem 1.1rem;
          border-radius:999px; border:none; cursor:pointer;
          transition:all 0.25s ease;
          color:white;
        }
        .view-btn:hover { transform:scale(1.05); }

        /* ── Modal ── */
        @keyframes modalIn { from{opacity:0;transform:scale(0.92)translateY(30px)} to{opacity:1;transform:scale(1)translateY(0)} }
        .modal-bg {
          position:fixed; inset:0; z-index:200;
          background:rgba(26,16,10,0.6); backdrop-filter:blur(20px);
          display:flex; align-items:center; justify-content:center; padding:1rem;
        }
        .modal-card {
          background:white; max-width:740px; width:100%;
          max-height:90vh; overflow-y:auto; position:relative;
          border-radius:32px;
          box-shadow:0 40px 100px rgba(0,0,0,0.25);
          animation: modalIn 0.45s cubic-bezier(.22,1,.36,1) both;
        }
        .modal-close {
          position:absolute; top:1.25rem; right:1.25rem; z-index:10;
          width:38px; height:38px; border-radius:50%;
          background:rgba(0,0,0,0.06); border:none;
          display:flex; align-items:center; justify-content:center; cursor:pointer;
          transition:background 0.2s ease; color:#666;
        }
        .modal-close:hover { background:rgba(0,0,0,0.12); color:#1A1A1A; }

        /* ── Wobble badge ── */
        @keyframes wobble { 0%,100%{transform:rotate(-6deg) scale(1)} 50%{transform:rotate(-4deg) scale(1.05)} }
        .wobble-badge { animation: wobble 3s ease-in-out infinite; }

        /* ── Progress bar ── */
        .prog-track { height:3px; background:rgba(0,0,0,0.08); border-radius:999px; flex:1; overflow:hidden; }
        .prog-fill  { height:100%; border-radius:999px; transition:width 0.6s cubic-bezier(.22,1,.36,1); }

        @media(max-width:900px) {
          .hero-grid  { grid-template-columns:1fr !important; }
          .side-thumbs{ display:none !important; }
          .modal-grid { grid-template-columns:1fr !important; }
          .modal-imgp { min-height:240px !important; border-radius:32px 32px 0 0 !important; }
        }
      `}</style>

      <div className="hr">

        {/* ── Ticker bar — color synced ── */}
        <div style={{
          background: `${accent}18`,
          borderBottom: `2px solid ${accent}22`,
          height: "40px", overflow: "hidden",
          display: "flex", alignItems: "center",
          transition: "background 0.8s ease, border-color 0.8s ease",
        }}>
          <div className="tk-track">
            {ticker.map((t, i) => (
              <div key={i} className="tk-item">
                <span className="tk-dot" style={{ background: accent, transition:"background 0.8s ease" }} />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <section
          className="hero-bg"
          style={{
            minHeight: "calc(100vh - 40px)",
            background: bg,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative blobs — now using product-derived glow color */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
            <div className="blob" style={{
              position:"absolute", top:"-8%", right:"-8%",
              width:"55vw", height:"55vw", maxWidth:"700px", maxHeight:"700px",
              background:`radial-gradient(ellipse at 60% 40%, ${glow.replace("rgba","rgba").replace(/,[\d.]+\)/, ",0.45)")} 0%, transparent 70%)`,
              transition:"background 0.9s ease",
            }} />
            <div className="blob" style={{
              position:"absolute", bottom:"-10%", left:"-5%",
              width:"40vw", height:"40vw", maxWidth:"500px", maxHeight:"500px",
              background:`radial-gradient(ellipse at 40% 60%, ${glow.replace(/,[\d.]+\)/, ",0.3)")} 0%, transparent 70%)`,
              animationDelay:"-4s",
              transition:"background 0.9s ease",
            }} />
            {/* Large soft halo behind product side */}
            <div style={{
              position:"absolute", top:"50%", right:"5%",
              transform:"translate(0,-50%)",
              width:"500px", height:"500px",
              borderRadius:"50%",
              background:`radial-gradient(circle, ${glow.replace(/,[\d.]+\)/, ",0.5)")} 0%, transparent 65%)`,
              filter:"blur(48px)",
              transition:"background 0.9s ease",
              pointerEvents:"none",
            }} />
            {/* Dot grid */}
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.35 }}>
              <defs>
                <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill={accent} fillOpacity="0.18" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
            {/* Diagonal accent stripe */}
            <div style={{
              position:"absolute", top:0, right:"30%",
              width:"1px", height:"100%",
              background:`linear-gradient(to bottom, transparent 0%, ${accent}22 30%, ${accent}18 70%, transparent 100%)`,
              transform:"rotate(12deg) scaleY(1.5)",
              transition:"background 0.8s ease",
            }} />
          </div>

          <div className="hero-grid" style={{
            display:"grid", gridTemplateColumns:"1fr 1fr",
            minHeight:"calc(100vh - 40px)",
            maxWidth:"1360px", margin:"0 auto",
            padding:"0 2.5rem",
            position:"relative", zIndex:2,
          }}>

            {/* ════ LEFT ════ */}
            <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", padding:"5rem 3rem 5rem 1rem", gap:"1.75rem" }}>

              {/* Eyebrow badge */}
              <div className="sl d1" style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:"0.5rem",
                  background: `${accent}18`,
                  border:`1.5px solid ${accent}44`,
                  borderRadius:"999px",
                  padding:"0.35rem 0.9rem",
                  fontSize:"0.65rem", fontWeight:800,
                  letterSpacing:"0.2em", textTransform:"uppercase",
                  color: accent,
                  transition:"background 0.6s ease, border-color 0.6s ease, color 0.6s ease",
                }}>
                  <Droplets size={11} strokeWidth={2.5} />
                  Premium Drinkware
                </div>
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:"0.35rem",
                  background:"#FFF3CD", borderRadius:"999px",
                  padding:"0.35rem 0.8rem",
                  fontSize:"0.62rem", fontWeight:700, color:"#B8860B",
                }}>
                  <Star size={10} fill="#B8860B" strokeWidth={0} />
                  Top Rated
                </div>
              </div>

              {/* Headline */}
              <div className="su d2">
                <h1 className="display" style={{
                  fontSize:"clamp(3.5rem, 7vw, 6.5rem)",
                  lineHeight:0.95,
                  fontWeight:800,
                  margin:0,
                  color:"#1A1A1A",
                  letterSpacing:"-0.02em",
                }}>
                  Your Cup,<br />
                  <span style={{ color: accent, transition:"color 0.6s ease" }}>
                    Your Vibe.
                  </span>
                </h1>
              </div>

              {/* Body */}
              <p className="su d3" style={{
                fontSize:"1rem", lineHeight:1.8,
                color:"#666", maxWidth:"38ch", fontWeight:400, margin:0,
              }}>
                Insulated stainless steel tumblers that keep your drinks ice-cold for 24 hours. Built for your everyday adventures.
              </p>

              {/* Stat pills */}
              <div className="su d4" style={{ display:"flex", gap:"0.875rem", flexWrap:"wrap" }}>
                {[
                  { icon:"🧊", n:"24H", l:"Ice Cold" },
                  { icon:"💧", n:"18oz", l:"Capacity" },
                  { icon:"✅", n:"100%", l:"BPA Free" },
                ].map(s => (
                  <div key={s.n} className="stat-pill">
                    <span style={{ fontSize:"1.2rem", marginBottom:"0.2rem" }}>{s.icon}</span>
                    <span className="display" style={{ fontSize:"1.5rem", fontWeight:800, color:"#1A1A1A", lineHeight:1 }}>{s.n}</span>
                    <span style={{ fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#999", marginTop:"0.2rem" }}>{s.l}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="su d5" style={{ display:"flex", gap:"0.875rem", flexWrap:"wrap", alignItems:"center" }}>
                <Link href="/menu" className="btn-main" style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                  boxShadow: `0 8px 30px ${accent}55`,
                  transition:"background 0.6s ease, box-shadow 0.6s ease",
                }}>
                  <ShoppingBag size={16} strokeWidth={2.5} />
                  Shop Now
                </Link>
                <Link href="/reservations" className="btn-outline">
                  Learn More →
                </Link>
              </div>

              {/* Trust row */}
              <div className="fi d6" style={{
                display:"flex", gap:"1.25rem", flexWrap:"wrap",
                paddingTop:"1.25rem", borderTop:`1.5px dashed ${accent}33`,
                transition:"border-color 0.6s ease",
              }}>
                {[
                  { e:"🚚", t:"Free Shipping" },
                  { e:"↩️", t:"30-Day Returns" },
                  { e:"🏆", t:"Lifetime Warranty" },
                ].map(x => (
                  <span key={x.t} style={{ fontSize:"0.7rem", fontWeight:600, color:"#888", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                    <span>{x.e}</span> {x.t}
                  </span>
                ))}
              </div>
            </div>

            {/* ════ RIGHT — 3D Product Stage ════ */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              padding:"3rem 1rem 3rem 2rem",
            }}>
              {loading ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"500px", width:"100%" }}>
                  <div style={{
                    width:"36px", height:"36px",
                    border:`3px solid ${accent}33`,
                    borderTop:`3px solid ${accent}`,
                    borderRadius:"50%",
                    animation:"ticker 0.8s linear infinite",
                  }} />
                </div>
              ) : !products.length ? (
                <p style={{ color:"#999" }}>No products available.</p>
              ) : curProduct ? (
                <div style={{ display:"flex", gap:"1rem", alignItems:"flex-start", width:"100%", maxWidth:"480px" }}>

                  {/* Vertical thumbnails */}
                  <div className="side-thumbs" style={{ display:"flex", flexDirection:"column", gap:"0.6rem", paddingTop:"0.75rem" }}>
                    {products.slice(0, 6).map((p, i) => {
                      const thumbAccent = getAccentFromName(p.name).accent
                      return (
                        <div
                          key={p.id}
                          className={`thumb ${i === currentSlide ? "on" : ""}`}
                          onClick={() => setCurrentSlide(i)}
                          style={{ borderColor: i === currentSlide ? thumbAccent : "transparent" }}
                        >
                          <Image src={getImageUrl(p.image)} alt={p.name} fill className="object-cover" sizes="56px" />
                        </div>
                      )
                    })}
                    {products.length > 6 && (
                      <div style={{
                        width:"56px", height:"56px", borderRadius:"14px",
                        background:"#F5F5F5", display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:"0.65rem", fontWeight:800,
                        color:"#999", cursor:"pointer",
                      }}>
                        +{products.length - 6}
                      </div>
                    )}
                  </div>

                  {/* Main product stage */}
                  <div style={{ flex:1, minWidth:0 }}>

                    {/* ── 3D Tilt Card ── */}
                    <div
                      ref={tiltRef}
                      className="card-3d"
                      onClick={() => { setSelectedProduct(curProduct); setSelectedProductIndex(currentSlide) }}
                      style={{
                        width:"100%", height:"340px",
                        marginBottom:"1rem",
                        cursor:"pointer",
                        position:"relative",
                      }}
                    >
                      {/* Blob glow behind product */}
                      <div className="blob" style={{
                        position:"absolute", inset:"10%",
                        background:`radial-gradient(ellipse, ${glow.replace(/,[\d.]+\)/, ",0.6)")} 0%, transparent 70%)`,
                        filter:"blur(20px)",
                        transition:"background 0.8s ease",
                        zIndex:0,
                      }} />

                      {/* Decorative ring */}
                      <div style={{
                        position:"absolute",
                        top:"50%", left:"50%",
                        transform:"translate(-50%,-50%)",
                        width:"75%", height:"75%",
                        borderRadius:"50%",
                        border:`2px dashed ${accent}44`,
                        zIndex:0,
                        animation:"ticker 20s linear infinite",
                        transition:"border-color 0.6s ease",
                      }} />

                      {/* Floating product image */}
                      <div className="float-img" style={{
                        position:"absolute", inset:"4%", zIndex:2,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <div style={{ position:"relative", width:"100%", height:"100%" }}>
                          <Image
                            src={getImageUrl(curProduct.image)}
                            alt={curProduct.name}
                            fill
                            className="object-contain depth-shadow"
                            sizes="380px"
                          />
                        </div>
                      </div>

                      {/* Ground shadow ellipse */}
                      <div className="shadow-breathe" style={{
                        position:"absolute", bottom:"3%", left:"50%",
                        transform:"translateX(-50%)",
                        width:"55%", height:"18px", borderRadius:"50%",
                        background:`radial-gradient(ellipse, ${glow.replace(/,[\d.]+\)/, ",0.9)")} 0%, transparent 70%)`,
                        filter:"blur(8px)", zIndex:1,
                        transition:"background 0.8s ease",
                      }} />

                      {/* Wobble NEW badge */}
                      <div className="wobble-badge" style={{
                        position:"absolute", top:"0.75rem", left:"0.75rem", zIndex:5,
                        background: accent, color:"white",
                        fontSize:"0.6rem", fontWeight:900, letterSpacing:"0.12em",
                        padding:"0.3rem 0.75rem", borderRadius:"999px",
                        boxShadow:`0 4px 16px ${accent}66`,
                        display:"flex", alignItems:"center", gap:"0.3rem",
                        transition:"background 0.6s ease, box-shadow 0.6s ease",
                      }}>
                        <Sparkles size={10} strokeWidth={2.5} />
                        NEW
                      </div>

                      {/* Tap hint */}
                      <div style={{
                        position:"absolute", bottom:"0.75rem", right:"0.75rem", zIndex:5,
                        background:"rgba(255,255,255,0.85)", backdropFilter:"blur(8px)",
                        fontSize:"0.58rem", fontWeight:700, color:"#888",
                        padding:"0.3rem 0.7rem", borderRadius:"999px",
                        boxShadow:"0 2px 12px rgba(0,0,0,0.08)",
                      }}>
                        Tap to view ✦
                      </div>
                    </div>

                    {/* Product info card */}
                    <div className="product-card" style={{ padding:"1.25rem" }}>
                      {/* Category badge */}
                      <div style={{
                        display:"inline-flex", alignItems:"center",
                        background:`${accent}18`, color:accent,
                        fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.18em",
                        textTransform:"uppercase", padding:"0.3rem 0.75rem",
                        borderRadius:"999px", marginBottom:"0.6rem",
                        transition:"background 0.6s ease, color 0.6s ease",
                      }}>
                        {curProduct.category}
                      </div>

                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem" }}>
                        <div style={{ minWidth:0 }}>
                          <h3 className="display" style={{
                            fontSize:"1.1rem", fontWeight:700, color:"#1A1A1A",
                            margin:"0 0 0.25rem",
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                          }}>
                            {curProduct.name}
                          </h3>
                          {curProduct.price > 0 && (
                            <div className="display" style={{
                              fontSize:"1.6rem", fontWeight:800,
                              color: accent, transition:"color 0.6s ease",
                            }}>
                              ₱{Number(curProduct.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                        <button
                          className="view-btn"
                          style={{ background: accent, boxShadow:`0 4px 16px ${accent}55`, flexShrink:0, transition:"background 0.6s ease" }}
                          onClick={() => { setSelectedProduct(curProduct); setSelectedProductIndex(currentSlide) }}
                        >
                          View →
                        </button>
                      </div>

                      {/* Nav progress */}
                      <div style={{
                        display:"flex", alignItems:"center", gap:"0.6rem",
                        marginTop:"1rem", paddingTop:"1rem",
                        borderTop:`1.5px dashed ${accent}22`,
                        transition:"border-color 0.6s ease",
                      }}>
                        <button className="nav-btn" onClick={prev} style={{ borderColor:`${accent}33` }}>
                          <ChevronLeft size={15} strokeWidth={2.5} />
                        </button>
                        <div className="prog-track">
                          <div className="prog-fill" style={{
                            width:`${((currentSlide + 1) / products.length) * 100}%`,
                            background:`linear-gradient(90deg, ${accent}, ${accent}88)`,
                            transition:"width 0.6s cubic-bezier(.22,1,.36,1), background 0.6s ease",
                          }} />
                        </div>
                        <span style={{ fontSize:"0.62rem", fontWeight:800, color:"#999", flexShrink:0 }}>
                          {String(currentSlide + 1).padStart(2,"0")} / {String(products.length).padStart(2,"0")}
                        </span>
                        <button className="nav-btn" onClick={next} style={{ borderColor:`${accent}33` }}>
                          <ChevronRight size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {/* ════════════ MODAL ════════════ */}
      {selectedProduct && (
        <div className="modal-bg" onClick={() => setSelectedProduct(null)}>
          {products.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); const i = selectedProductIndex === 0 ? products.length - 1 : selectedProductIndex - 1; setSelectedProductIndex(i); setSelectedProduct(products[i]) }}
                style={{ position:"absolute", left:"1.25rem", top:"50%", transform:"translateY(-50%)", zIndex:210, width:"48px", height:"48px", background:"white", border:"none", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 4px 20px rgba(0,0,0,0.15)", color:"#1A1A1A" }}
              ><ChevronLeft size={20} /></button>
              <button
                onClick={e => { e.stopPropagation(); const i = (selectedProductIndex + 1) % products.length; setSelectedProductIndex(i); setSelectedProduct(products[i]) }}
                style={{ position:"absolute", right:"1.25rem", top:"50%", transform:"translateY(-50%)", zIndex:210, width:"48px", height:"48px", background:"white", border:"none", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 4px 20px rgba(0,0,0,0.15)", color:"#1A1A1A" }}
              ><ChevronRight size={20} /></button>
            </>
          )}

          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>
              <X size={16} strokeWidth={2.5} />
            </button>

            <div className="modal-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
              {/* Image panel — uses modal product's own color */}
              <div className="modal-imgp" style={{
                minHeight:"380px",
                background:`linear-gradient(145deg, ${modalColors.accent}18 0%, ${modalColors.accent}08 100%)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                padding:"2.5rem", position:"relative", borderRadius:"32px 0 0 32px",
              }}>
                {/* Glow circle */}
                <div style={{
                  position:"absolute", top:"50%", left:"50%",
                  transform:"translate(-50%,-50%)",
                  width:"280px", height:"280px",
                  borderRadius:"50%",
                  background:`radial-gradient(circle, ${modalColors.glow.replace(/,[\d.]+\)/, ",0.6)")} 0%, transparent 70%)`,
                  filter:"blur(32px)",
                }} />
                <div style={{ position:"relative", width:"100%", height:"300px", zIndex:2 }}>
                  <Image
                    src={getImageUrl(selectedProduct.image)}
                    alt={selectedProduct.name}
                    fill className="object-contain" sizes="360px"
                    style={{ filter:"drop-shadow(0 24px 50px rgba(0,0,0,0.2))" }}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZGRjhFRSIvPjwvc3ZnPg=="
                  />
                </div>
                {products.length > 1 && (
                  <div style={{
                    position:"absolute", bottom:"1.25rem", right:"1.25rem",
                    background:"white", borderRadius:"999px",
                    fontSize:"0.62rem", fontWeight:800, color:"#999",
                    padding:"0.3rem 0.75rem", boxShadow:"0 2px 10px rgba(0,0,0,0.1)",
                    zIndex:3,
                  }}>
                    {selectedProductIndex + 1} of {products.length}
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div style={{ padding:"2.5rem 2rem 2rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
                <div style={{
                  display:"inline-flex", alignItems:"center",
                  background:`${modalColors.accent}18`, color:modalColors.accent,
                  fontSize:"0.6rem", fontWeight:800, letterSpacing:"0.18em",
                  textTransform:"uppercase", padding:"0.3rem 0.8rem",
                  borderRadius:"999px", width:"fit-content",
                }}>
                  {selectedProduct.category}
                </div>

                <h2 className="display" style={{
                  fontSize:"clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight:800, color:"#1A1A1A",
                  margin:0, lineHeight:1.1, letterSpacing:"-0.01em",
                }}>
                  {selectedProduct.name}
                </h2>

                {selectedProduct.price > 0 && (
                  <div className="display" style={{ fontSize:"2rem", fontWeight:800, color:modalColors.accent }}>
                    ₱{Number(selectedProduct.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </div>
                )}

                <div style={{ height:"1.5px", background:`${modalColors.accent}22`, borderRadius:"999px" }} />

                <p style={{ fontSize:"0.9rem", lineHeight:1.8, color:"#888", fontWeight:400, margin:0, flex:1 }}>
                  {selectedProduct.description}
                </p>

                <button
                  onClick={() => addToCart(selectedProduct)}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"0.6rem",
                    background:`linear-gradient(135deg, ${modalColors.accent}, ${modalColors.accent}CC)`,
                    color:"white", border:"none", padding:"1rem",
                    fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:"0.85rem",
                    letterSpacing:"0.04em", cursor:"pointer", borderRadius:"999px",
                    boxShadow:`0 8px 28px ${modalColors.accent}44`,
                    transition:"transform 0.2s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 36px ${modalColors.accent}55` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 8px 28px ${modalColors.accent}44` }}
                >
                  <ShoppingBag size={16} strokeWidth={2.5} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}