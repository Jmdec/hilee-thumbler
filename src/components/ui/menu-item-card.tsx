"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ShoppingBag, Plus, Minus, X, Sparkles } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "@/hooks/use-toast"
import type { MenuItem } from "@/types"
import { useRouter } from "next/navigation"

interface MenuItemCardProps {
  item: MenuItem
  index?: number
}

const formatPrice = (price: number | string): string => {
  const n = typeof price === "number" ? price : Number.parseFloat(String(price))
  return n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
  const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const fullPath = imagePath.startsWith("images/products/") ? imagePath : `images/products/${imagePath}`
  return `${BASE}/${fullPath}`
}

// ── Extract accent color from product name (same as HeroSection) ──────────────
function getAccentFromName(name: string): { accent: string; bg: string; glow: string } {
  const n = name.toLowerCase()
  if (n.includes("tiffany blue") || n.includes("tiffany"))
    return { accent: "#0ABAB5", bg: "linear-gradient(145deg,#E8FAF9,#C8F5F3)", glow: "rgba(10,186,181,0.18)" }
  if (n.includes("deep purple") || n.includes("purple"))
    return { accent: "#7C3AED", bg: "linear-gradient(145deg,#F3EEFF,#E8DCFF)", glow: "rgba(124,58,237,0.15)" }
  if (n.includes("light pink") || n.includes("pink"))
    return { accent: "#F06292", bg: "linear-gradient(145deg,#FFF0F5,#FFE0EE)", glow: "rgba(240,98,146,0.15)" }
  if (n.includes("black gray") || n.includes("black grey") || n.includes("charcoal"))
    return { accent: "#374151", bg: "linear-gradient(145deg,#F3F4F6,#E5E7EB)", glow: "rgba(55,65,81,0.15)" }
  if (n.includes("(black)") || n.includes("matte black") || (n.endsWith(" black") && !n.includes("black gray")))
    return { accent: "#1A1A2E", bg: "linear-gradient(145deg,#EFEFFA,#E2E2F0)", glow: "rgba(26,26,46,0.14)" }
  if (n.includes("(white)") || n.includes("pearl white") || n.includes("ivory"))
    return { accent: "#9CA3AF", bg: "linear-gradient(145deg,#F9F9F9,#F0F0F0)", glow: "rgba(156,163,175,0.2)" }
  if (n.includes("sage green") || n.includes("sage"))
    return { accent: "#6B8F71", bg: "linear-gradient(145deg,#EAF3EB,#D4E8D6)", glow: "rgba(107,143,113,0.15)" }
  if (n.includes("forest green") || n.includes("dark green") || n.includes("hunter green"))
    return { accent: "#166534", bg: "linear-gradient(145deg,#DCFCE7,#BBF7D0)", glow: "rgba(22,101,52,0.15)" }
  if (n.includes("mint green") || n.includes("mint"))
    return { accent: "#34D399", bg: "linear-gradient(145deg,#DCFDF2,#A7F3D0)", glow: "rgba(52,211,153,0.15)" }
  if (n.includes("green"))
    return { accent: "#16A34A", bg: "linear-gradient(145deg,#DCFCE7,#BBF7D0)", glow: "rgba(22,163,74,0.15)" }
  if (n.includes("sky blue") || n.includes("baby blue") || n.includes("powder blue"))
    return { accent: "#38BDF8", bg: "linear-gradient(145deg,#E0F2FE,#BAE6FD)", glow: "rgba(56,189,248,0.15)" }
  if (n.includes("navy blue") || n.includes("navy") || n.includes("ocean blue"))
    return { accent: "#1E40AF", bg: "linear-gradient(145deg,#DBEAFE,#BFDBFE)", glow: "rgba(30,64,175,0.15)" }
  if (n.includes("blue"))
    return { accent: "#3B82F6", bg: "linear-gradient(145deg,#DBEAFE,#BFDBFE)", glow: "rgba(59,130,246,0.15)" }
  if (n.includes("coral") || n.includes("salmon"))
    return { accent: "#F87171", bg: "linear-gradient(145deg,#FEE2E2,#FECACA)", glow: "rgba(248,113,113,0.15)" }
  if (n.includes("red") || n.includes("crimson"))
    return { accent: "#DC2626", bg: "linear-gradient(145deg,#FEE2E2,#FECACA)", glow: "rgba(220,38,38,0.15)" }
  if (n.includes("orange") || n.includes("tangerine"))
    return { accent: "#EA580C", bg: "linear-gradient(145deg,#FFEDD5,#FED7AA)", glow: "rgba(234,88,12,0.15)" }
  if (n.includes("yellow") || n.includes("mustard") || n.includes("gold"))
    return { accent: "#CA8A04", bg: "linear-gradient(145deg,#FEF9C3,#FEF08A)", glow: "rgba(202,138,4,0.15)" }
  if (n.includes("lavender") || n.includes("lilac"))
    return { accent: "#A78BFA", bg: "linear-gradient(145deg,#F5F3FF,#EDE9FE)", glow: "rgba(167,139,250,0.16)" }
  if (n.includes("violet") || n.includes("indigo"))
    return { accent: "#6366F1", bg: "linear-gradient(145deg,#EEF2FF,#E0E7FF)", glow: "rgba(99,102,241,0.15)" }
  if (n.includes("rose") || n.includes("blush"))
    return { accent: "#FB7185", bg: "linear-gradient(145deg,#FFE4E8,#FECDD3)", glow: "rgba(251,113,133,0.15)" }
  if (n.includes("teal") || n.includes("seafoam"))
    return { accent: "#0D9488", bg: "linear-gradient(145deg,#CCFBF1,#99F6E4)", glow: "rgba(13,148,136,0.15)" }
  if (n.includes("sakura") || n.includes("raspberry") || n.includes("berry"))
    return { accent: "#E879A0", bg: "linear-gradient(145deg,#FEE7F0,#FDD0E3)", glow: "rgba(232,121,160,0.15)" }
  if (n.includes("silver") || n.includes("chrome"))
    return { accent: "#6B7280", bg: "linear-gradient(145deg,#F3F4F6,#E5E7EB)", glow: "rgba(107,114,128,0.15)" }
  if (n.includes("grey") || n.includes("gray") || n.includes("slate"))
    return { accent: "#64748B", bg: "linear-gradient(145deg,#F1F5F9,#E2E8F0)", glow: "rgba(100,116,139,0.15)" }
  // Warm default
  return { accent: "#FF6B35", bg: "linear-gradient(145deg,#FFF3E8,#FFE8D6)", glow: "rgba(255,107,53,0.15)" }
}

// ── Soft 3D tilt ──────────────────────────────────────────────────────────────
function useTilt(strength = 10) {
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
      const ease = 0.08
      cur.current.rx += (tgt.current.rx - cur.current.rx) * ease
      cur.current.ry += (tgt.current.ry - cur.current.ry) * ease
      if (el) el.style.transform = `perspective(900px) rotateX(${cur.current.rx}deg) rotateY(${cur.current.ry}deg)`
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

export default function MenuItemCard({ item, index = 0 }: MenuItemCardProps) {
  const addItem    = useCartStore((s) => s.addItem)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const router     = useRouter()
  const [qty, setQty]             = useState(1)
  const [isOpen, setIsOpen]       = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const tiltRef = useTilt(8)

  const { accent, bg, glow } = getAccentFromName(item.name)

  const handleAddToCart = (quantity = 1) => {
    if (!isLoggedIn) {
      toast({ title: "Login required", description: "Sign in to add items to your cart.", variant: "destructive" })
      router.push("/login")
      return
    }
    for (let i = 0; i < quantity; i++) addItem(item)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
    toast({ title: "Added!", description: `${item.name} ×${quantity}` })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Nunito:wght@400;600;700;800&display=swap');

        .mc-root  { font-family: 'Nunito', sans-serif; }
        .mc-disp  { font-family: 'Bricolage Grotesque', sans-serif; }

        /* Card entry */
        @keyframes mc-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mc-wrap { animation: mc-in 0.65s cubic-bezier(.22,1,.36,1) both; }

        /* Card shell */
        .mc-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
          overflow: hidden;
          cursor: pointer;
          transform-style: preserve-3d;
          will-change: transform;
          transition: box-shadow 0.4s ease;
          border: 1.5px solid rgba(0,0,0,0.05);
        }
        .mc-card:hover {
          box-shadow: 0 16px 48px rgba(0,0,0,0.13), 0 4px 12px rgba(0,0,0,0.06);
        }

        /* Image area */
        .mc-img-area {
          position: relative;
          overflow: hidden;
        }

        /* Product float */
        @keyframes mc-float {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%     { transform: translateY(-10px) rotate(0.5deg); }
        }
        .mc-float { animation: mc-float 5s ease-in-out infinite; }

        /* Quick add button */
        .mc-quick {
          position: absolute; bottom: 0.75rem; right: 0.75rem; z-index: 4;
          border: none; border-radius: 50%;
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0;
          transform: scale(0.6) translateY(6px);
          transition: opacity 0.25s ease, transform 0.3s cubic-bezier(.34,1.56,.64,1);
          color: white;
          font-weight: 800;
        }
        .mc-card:hover .mc-quick {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        .mc-quick:hover { filter: brightness(1.1); transform: scale(1.1) translateY(0) !important; }

        /* Category chip */
        .mc-chip {
          position: absolute; top: 0.75rem; left: 0.75rem; z-index: 4;
          border-radius: 999px;
          font-family: 'Nunito', sans-serif;
          font-size: 0.55rem; font-weight: 800;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 0.22rem 0.65rem;
        }

        /* NEW badge wobble */
        @keyframes mc-wobble { 0%,100%{transform:rotate(-5deg) scale(1)} 50%{transform:rotate(-3deg) scale(1.06)} }
        .mc-new {
          position: absolute; top: 0.7rem; right: 0.7rem; z-index: 4;
          border-radius: 999px;
          font-family: 'Nunito', sans-serif;
          font-size: 0.5rem; font-weight: 900; letter-spacing: 0.15em;
          padding: 0.22rem 0.6rem; color: white;
          animation: mc-wobble 3s ease-in-out infinite;
          display: flex; align-items: center; gap: 0.25rem;
        }

        /* Info area */
        .mc-info {
          padding: 0.875rem 1rem 1rem;
          border-top: 1.5px dashed rgba(0,0,0,0.07);
          display: flex; flex-direction: column; gap: 0.6rem;
        }

        /* Add to cart button */
        .mc-btn {
          width: 100%; padding: 0.6rem 1rem;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          background: transparent;
          border-radius: 999px;
          font-family: 'Nunito', sans-serif;
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.3s ease;
        }
        .mc-btn:hover { transform: translateY(-1px); }

        /* ── MODAL ── */
        @keyframes mc-modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .mc-modal {
          animation: mc-modal-in 0.4s cubic-bezier(.22,1,.36,1) both;
          background: white !important;
          border: none !important;
          border-radius: 32px !important;
          font-family: 'Nunito', sans-serif;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.18) !important;
        }

        .mc-qty-btn {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: #F5F5F5;
          border: none; border-radius: 50%;
          color: #666; cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }
        .mc-qty-btn:hover { background: #EFEFEF; color: #1A1A1A; transform: scale(1.1); }

        .mc-modal-btn {
          width: 100%; padding: 0.9rem 1rem;
          border: none; border-radius: 999px;
          font-family: 'Nunito', sans-serif; font-weight: 800;
          font-size: 0.8rem; letter-spacing: 0.06em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          color: white;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .mc-modal-btn:hover { transform: translateY(-2px); }

        .mc-modal-close {
          position: absolute; top: 1rem; right: 1rem; z-index: 10;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(0,0,0,0.07); border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #888;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .mc-modal-close:hover { background: rgba(0,0,0,0.13); color: #1A1A1A; }
      `}</style>

      <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setQty(1) }}>

        {/* ─── CARD ─── */}
        <div
          className="mc-wrap mc-root"
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          <div ref={tiltRef} className="mc-card">

            {/* Image area */}
            <DialogTrigger asChild>
              <div
                className="mc-img-area"
                style={{
                  paddingTop: "90%",
                  background: bg,
                  cursor: "pointer",
                }}
              >
                {/* Glow circle behind product */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-54%)",
                  width: "70%", height: "70%", borderRadius: "50%",
                  background: `radial-gradient(circle, ${glow.replace(/[\d.]+\)$/, "0.7)")} 0%, transparent 70%)`,
                  filter: "blur(20px)", pointerEvents: "none", zIndex: 0,
                }} />

                {/* Floating product image */}
                <div
                  className="mc-float"
                  style={{ position: "absolute", inset: "8%", zIndex: 2 }}
                >
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-contain"
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                    style={{
                      filter: `drop-shadow(0 16px 28px rgba(0,0,0,0.18)) drop-shadow(0 4px 10px ${glow.replace(/[\d.]+\)$/, "0.4)")})`,
                    }}
                  />
                </div>

                {/* Category chip */}
                <div
                  className="mc-chip"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(8px)",
                    border: `1.5px solid ${accent}33`,
                    color: accent,
                  }}
                >
                  Hilee
                </div>

                {/* NEW badge */}
                <div
                  className="mc-new"
                  style={{ background: accent, boxShadow: `0 4px 14px ${accent}55` }}
                >
                  <Sparkles size={8} strokeWidth={2.5} />
                  NEW
                </div>

                {/* Quick-add circle */}
                <button
                  className={`mc-quick`}
                  style={{
                    background: justAdded ? "#34D399" : accent,
                    boxShadow: justAdded ? "0 4px 16px rgba(52,211,153,0.45)" : `0 4px 16px ${accent}55`,
                  }}
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(1) }}
                >
                  {justAdded
                    ? <span style={{ fontSize: "0.65rem", fontWeight: 900 }}>✓</span>
                    : <Plus size={14} strokeWidth={2.5} />
                  }
                </button>
              </div>
            </DialogTrigger>

            {/* Info strip */}
            <div className="mc-info">
              <DialogTrigger asChild>
                <div style={{ cursor: "pointer" }}>
                  {/* Category label */}
                  <div style={{
                    fontSize: "0.55rem", fontWeight: 800,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: accent, marginBottom: "0.3rem",
                    transition: "color 0.3s ease",
                  }}>
                    Premium Drinkware
                  </div>
                  <h3
                    className="mc-disp"
                    style={{
                      fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
                      fontWeight: 700,
                      color: "#1A1A1A",
                      lineHeight: 1.25,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      margin: "0 0 0.3rem",
                    }}
                  >
                    {item.name}
                  </h3>
                  <div
                    className="mc-disp"
                    style={{
                      fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                      fontWeight: 800,
                      color: accent,
                      lineHeight: 1,
                      transition: "color 0.3s ease",
                    }}
                  >
                    ₱{formatPrice(item.price)}
                  </div>
                </div>
              </DialogTrigger>

              {/* Add to cart button */}
              <button
                className="mc-btn"
                style={{
                  background: justAdded ? "rgba(52,211,153,0.12)" : `${accent}18`,
                  border: `1.5px solid ${justAdded ? "#34D399" : accent}44`,
                  color: justAdded ? "#34D399" : accent,
                  boxShadow: justAdded ? "0 4px 16px rgba(52,211,153,0.15)" : `0 4px 16px ${accent}20`,
                }}
                onClick={() => handleAddToCart(1)}
              >
                <ShoppingBag size={12} strokeWidth={2.5} />
                {justAdded ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* ─── MODAL ─── */}
        <DialogContent
          className="mc-modal p-0 border-0 w-[90vw] max-w-[380px]"
        >
          {/* Image panel */}
          <div style={{
            height: "260px", position: "relative",
            background: bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {/* Glow */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: "260px", height: "260px", borderRadius: "50%",
              background: `radial-gradient(circle, ${glow.replace(/[\d.]+\)$/, "0.6)")} 0%, transparent 70%)`,
              filter: "blur(28px)",
            }} />

            {/* Close */}
            <button className="mc-modal-close" onClick={() => setIsOpen(false)}>
              <X size={14} strokeWidth={2.5} />
            </button>

            {/* Category chip */}
            <div style={{
              position: "absolute", top: "1rem", left: "1rem", zIndex: 10,
              background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
              border: `1.5px solid ${accent}33`, borderRadius: "999px",
              color: accent, fontSize: "0.55rem", fontWeight: 800,
              letterSpacing: "0.18em", textTransform: "uppercase",
              padding: "0.22rem 0.65rem",
              fontFamily: "'Nunito', sans-serif",
            }}>
              Hilee
            </div>

            {/* Floating image */}
            <div className="mc-float" style={{ position: "absolute", inset: "10%", zIndex: 2 }}>
              <Image
                src={getImageUrl(item.image)}
                alt={item.name}
                fill
                className="object-contain"
                sizes="380px"
                style={{
                  filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.2)) drop-shadow(0 4px 16px ${glow.replace(/[\d.]+\)$/, "0.5)")})`,
                }}
              />
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: "1.5rem 1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Name + price */}
            <div>
              <div style={{
                fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.2em",
                textTransform: "uppercase", color: accent, marginBottom: "0.4rem",
              }}>
                Premium Drinkware
              </div>
              <h2
                className="mc-disp"
                style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1A1A1A", margin: "0 0 0.3rem", lineHeight: 1.15 }}
              >
                {item.name}
              </h2>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.75, color: "#888", margin: 0,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {item.description}
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: "1.5px", background: "rgba(0,0,0,0.06)", borderRadius: "999px" }} />

            {/* Price + qty */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: "0.25rem" }}>
                  Unit Price
                </div>
                <div className="mc-disp" style={{ fontSize: "1.8rem", fontWeight: 800, color: accent, lineHeight: 1 }}>
                  ₱{formatPrice(item.price)}
                </div>
              </div>

              {/* Qty stepper */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button className="mc-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>
                  <Minus size={12} />
                </button>
                <div style={{
                  width: "36px", textAlign: "center",
                  fontSize: "1rem", fontWeight: 800, color: "#1A1A1A",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  userSelect: "none",
                }}>
                  {qty}
                </div>
                <button className="mc-qty-btn" onClick={() => setQty(q => q + 1)}>
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Total row */}
            {qty > 1 && (
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "0.6rem 0.875rem", borderRadius: "12px",
                background: `${accent}0E`,
                border: `1.5px solid ${accent}22`,
                fontSize: "0.72rem",
              }}>
                <span style={{ color: "#999", fontWeight: 600 }}>Total for {qty} items</span>
                <span className="mc-disp" style={{ fontWeight: 800, color: "#1A1A1A", fontSize: "0.9rem" }}>
                  ₱{formatPrice(Number(item.price) * qty)}
                </span>
              </div>
            )}

            {/* CTA */}
            <button
              className="mc-modal-btn"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                boxShadow: `0 8px 28px ${accent}44`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 36px ${accent}55` }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${accent}44` }}
              onClick={() => { handleAddToCart(qty); setIsOpen(false); setQty(1) }}
            >
              <ShoppingBag size={15} strokeWidth={2.5} />
              Add {qty > 1 ? `${qty}×` : ""} to Cart · ₱{formatPrice(Number(item.price) * qty)}
            </button>

            {/* Trust note */}
            <p style={{ textAlign: "center", fontSize: "0.62rem", color: "#ccc", margin: 0, fontWeight: 600, letterSpacing: "0.06em" }}>
              🚚 Free delivery on orders above ₱1,500
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}