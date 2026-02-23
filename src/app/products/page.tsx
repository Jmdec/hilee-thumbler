"use client"

import { useState, useEffect } from "react"
import type { MenuItem } from "@/types"
import MenuItemCard from "@/components/ui/menu-item-card"
import OppaLoader from "@/components/oppa-loader"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
  const fullPath = imagePath.startsWith("images/products/")
    ? imagePath
    : `images/products/${imagePath}`
  return `${BASE}/${fullPath}`
}

function getCategoryFromName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("wide mouth")) return "Wide Mouth"
  if (n.includes("slim"))       return "Slim"
  if (n.includes("tumbler"))    return "Tumbler"
  if (n.includes("bottle"))     return "Bottle"
  if (n.includes("mug"))        return "Mug"
  return "Drinkware"
}

function extractCategories(products: MenuItem[]): string[] {
  const cats = new Set(products.map(p => getCategoryFromName(p.name)))
  return ["All", ...Array.from(cats)]
}

export default function MenuPage() {
  const [products, setProducts]   = useState<MenuItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [activeFilter, setFilter] = useState("All")
  const [searchQuery, setSearch]  = useState("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/products?paginate=false")
        const data = await response.json()
        if (!response.ok) throw new Error("Failed to fetch products")
        const transformed: MenuItem[] = data.map((product: any) => ({
          id:          product.id,
          name:        product.name,
          description: product.description,
          price:       typeof product.price === "string" ? parseFloat(product.price) : product.price,
          quantity:    product.quantity,
          image:       getImageUrl(product.image),
        }))
        setProducts(transformed)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const categories = extractCategories(products)
  const filtered = products.filter(p => {
    const matchCat    = activeFilter === "All" || getCategoryFromName(p.name) === activeFilter
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <OppaLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          textAlign: "center", background: "white", padding: "2rem 3rem",
          borderRadius: "24px", boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
        }}>
          <p style={{ color: "#FF6B35", fontFamily: "'Nunito',sans-serif", fontWeight: 700, marginBottom: "0.5rem" }}>
            Failed to load products
          </p>
          <p style={{ color: "#999", fontSize: "0.85rem" }}>{error}</p>
        </div>
      </div>
    )
  }

  const ticker = [
    "STAY HYDRATED", "FREE SHIPPING", "24H COLD RETENTION",
    "BPA FREE", "STAINLESS STEEL", "PREMIUM QUALITY",
    "STAY HYDRATED", "FREE SHIPPING", "24H COLD RETENTION",
    "BPA FREE", "STAINLESS STEEL", "PREMIUM QUALITY",
  ]
  const tickerColors = ["#FF6B35","#4ECDC4","#A8E6CF","#FFD93D","#C77DFF","#FF6B6B"]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Nunito:wght@300;400;600;700;800&display=swap');

        .mp { font-family: 'Nunito', sans-serif; background: #F3EEFF; color: #1A1A1A; }
        .mp * { box-sizing: border-box; }
        .mp-h { font-family: 'Bricolage Grotesque', sans-serif; }

        /* Ticker */
        @keyframes mp-tick { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .mp-ticker      { background:#FFF3E0; border-bottom:2px solid rgba(0,0,0,0.05); height:40px; overflow:hidden; display:flex; align-items:center; }
        .mp-tick-track  { display:flex; width:max-content; animation:mp-tick 28s linear infinite; }
        .mp-tick-item   { display:flex; align-items:center; gap:1.25rem; padding:0 1.75rem; white-space:nowrap; font-size:0.65rem; font-weight:800; letter-spacing:0.25em; text-transform:uppercase; color:#1A1A1A; }
        .mp-tick-dot    { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

        /* Blobs */
        @keyframes mp-morph {
          0%,100%{border-radius:62% 38% 70% 30%/45% 55% 45% 55%}
          25%    {border-radius:40% 60% 45% 55%/60% 40% 60% 40%}
          50%    {border-radius:55% 45% 35% 65%/40% 60% 50% 50%}
          75%    {border-radius:70% 30% 60% 40%/55% 45% 65% 35%}
        }
        .mp-blob { animation:mp-morph 10s ease-in-out infinite; position:absolute; pointer-events:none; }

        /* Float badges */
        @keyframes mp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        .mp-badge { display:inline-flex; align-items:center; gap:0.4rem; border-radius:999px; padding:0.35rem 0.9rem; font-size:0.62rem; font-weight:800; letter-spacing:0.15em; text-transform:uppercase; animation:mp-float 4s ease-in-out infinite; }

        /* Entry */
        @keyframes mp-up { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
        .mp-u { animation:mp-up 0.85s cubic-bezier(.22,1,.36,1) both; }
        .d1{animation-delay:.06s}.d2{animation-delay:.18s}.d3{animation-delay:.3s}.d4{animation-delay:.44s}.d5{animation-delay:.56s}

        /* Hero */
        .mp-hero {
          position:relative; overflow:hidden;
          background:linear-gradient(160deg,#F3EEFF 0%,#E8DCFF 55%,#EDE9FE 100%);
          padding:4rem 2rem 3rem; text-align:center;
        }

        /* Search */
        .mp-search-wrap { position:relative; display:inline-flex; align-items:center; }
        .mp-search {
          font-family:'Nunito',sans-serif; font-size:0.85rem; font-weight:600;
          background:white; border:2px solid rgba(0,0,0,0.08); color:#1A1A1A;
          padding:0.7rem 1.1rem 0.7rem 2.6rem; border-radius:999px; outline:none; width:300px;
          box-shadow:0 2px 16px rgba(0,0,0,0.06);
          transition:border-color .3s,box-shadow .3s;
        }
        .mp-search::placeholder { color:#bbb; }
        .mp-search:focus { border-color:#FF6B35; box-shadow:0 2px 20px rgba(255,107,53,0.14); }
        .mp-search-ico { position:absolute; left:0.9rem; color:#bbb; pointer-events:none; }

        /* Pills */
        .mp-pill {
          font-family:'Nunito',sans-serif; font-size:0.7rem; font-weight:800;
          letter-spacing:0.1em; text-transform:uppercase;
          padding:0.5rem 1.2rem; border-radius:999px;
          background:white; border:2px solid rgba(0,0,0,0.08); color:#999;
          cursor:pointer; box-shadow:0 2px 12px rgba(0,0,0,0.05);
          transition:all .25s cubic-bezier(.22,1,.36,1);
        }
        .mp-pill:hover { border-color:#FF6B35; color:#FF6B35; transform:translateY(-2px); box-shadow:0 6px 20px rgba(255,107,53,0.14); }
        .mp-pill.on { background:#FF6B35; border-color:#FF6B35; color:white; box-shadow:0 6px 24px rgba(255,107,53,0.32); transform:translateY(-2px); }

        /* Count */
        .mp-count { display:inline-flex; align-items:center; gap:0.4rem; background:white; border:1.5px solid rgba(0,0,0,0.07); border-radius:999px; padding:0.35rem 0.9rem; box-shadow:0 2px 12px rgba(0,0,0,0.05); font-size:0.65rem; font-weight:700; color:#999; }
        .mp-count-n { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:0.9rem; color:#FF6B35; }

        /* Grid area */
        .mp-grid-area {
          background:linear-gradient(to bottom, #EDE9FE 0%, #F3EEFF 100px);
          padding:0 2rem 5rem; min-height:60vh;
        }

        /* Strip */
        .mp-strip { display:flex; align-items:center; gap:1rem; padding:1.5rem 0 1.75rem; }
        .mp-strip-line { flex:1; height:1.5px; background:rgba(0,0,0,0.07); border-radius:999px; }
        .mp-strip-lbl { font-size:0.62rem; font-weight:800; letter-spacing:0.22em; text-transform:uppercase; color:#ccc; white-space:nowrap; }

        /* Product grid */
        .mp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1.5rem; }

        /* Empty */
        .mp-empty { text-align:center; padding:6rem 2rem; }

        /* Trust */
        .mp-trust { display:flex; align-items:center; justify-content:center; gap:2rem; flex-wrap:wrap; padding:1.75rem 2rem; border-top:1.5px dashed rgba(0,0,0,0.08); margin-top:1.5rem; }
        .mp-trust-item { display:flex; align-items:center; gap:0.4rem; font-size:0.72rem; font-weight:700; color:#bbb; }

        /* Dot grid svg */
        .mp-dotgrid { position:absolute; inset:0; width:100%; height:100%; opacity:0.35; pointer-events:none; }

        @media(max-width:600px){ .mp-search{width:85vw} }
      `}</style>

      <div className="mp">

        {/* ── Ticker ── */}
        <div className="mp-ticker">
          <div className="mp-tick-track">
            {ticker.map((t, i) => (
              <div key={i} className="mp-tick-item">
                <span className="mp-tick-dot" style={{ background: tickerColors[i % tickerColors.length] }} />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* ── Hero Header ── */}
        <div className="mp-hero">

          {/* Blobs */}
          <div className="mp-blob" style={{ top:"-12%", right:"-6%", width:"400px", height:"400px", background:"linear-gradient(135deg,rgba(167,139,250,0.35) 0%,rgba(196,181,253,0.2) 100%)" }} />
          <div className="mp-blob" style={{ bottom:"-15%", left:"-4%", width:"300px", height:"300px", background:"linear-gradient(135deg,rgba(139,92,246,0.25) 0%,rgba(167,139,250,0.15) 100%)", animationDelay:"-4s" }} />
          <div className="mp-blob" style={{ top:"5%", left:"10%", width:"160px", height:"160px", background:"rgba(124,58,237,0.1)", animationDelay:"-7s" }} />
          <div className="mp-blob" style={{ bottom:"0%", right:"12%", width:"120px", height:"120px", background:"rgba(196,181,253,0.25)", animationDelay:"-2s" }} />

          {/* Dot grid */}
          <svg className="mp-dotgrid">
            <defs>
              <pattern id="dp" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="rgba(0,0,0,0.09)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dp)" />
          </svg>

          {/* Floating badges */}
          <div className="mp-u d1" style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:"0.6rem", flexWrap:"wrap", marginBottom:"1.25rem" }}>
            <span className="mp-badge" style={{ background:"rgba(255,107,53,0.1)", border:"1.5px solid rgba(255,107,53,0.25)", color:"#FF6B35", animationDelay:"0s" }}>
              💧 Premium Drinkware
            </span>
            <span className="mp-badge" style={{ background:"#FFF3CD", border:"1.5px solid rgba(184,134,11,0.2)", color:"#B8860B", animationDelay:"0.7s" }}>
              ⭐ Top Rated
            </span>
            <span className="mp-badge" style={{ background:"rgba(78,205,196,0.12)", border:"1.5px solid rgba(78,205,196,0.3)", color:"#2AAA9E", animationDelay:"1.3s" }}>
              🧊 24H Cold
            </span>
          </div>

          {/* Title */}
          <div className="mp-u d2" style={{ position:"relative", zIndex:2, marginBottom:"0.75rem" }}>
            <h1 className="mp-h" style={{
              fontSize:"clamp(3.2rem,8vw,6.5rem)",
              fontWeight:800, lineHeight:0.92,
              letterSpacing:"-0.025em", margin:0, color:"#1A1A1A",
            }}>
              Shop All
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mp-u d3" style={{
            position:"relative", zIndex:2,
            fontSize:"1rem", lineHeight:1.75, color:"#888",
            maxWidth:"42ch", margin:"0 auto 2rem", fontWeight:400,
          }}>
            Find your perfect tumbler — every color, every size, every vibe.
          </p>

          {/* Search + count */}
          <div className="mp-u d4" style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:"1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", flexWrap:"wrap", justifyContent:"center" }}>
              <div className="mp-search-wrap">
                <svg className="mp-search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  className="mp-search"
                  placeholder="Search by name or color…"
                  value={searchQuery}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="mp-count">
                <span className="mp-count-n">{filtered.length}</span>
                <span>found</span>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="mp-u d5" style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", justifyContent:"center" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`mp-pill ${activeFilter === cat ? "on" : ""}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid area ── */}
        <div className="mp-grid-area">
          <div style={{ maxWidth:"1400px", margin:"0 auto" }}>

            {/* Section strip */}
            <div className="mp-strip">
              <div className="mp-strip-line" />
              <span className="mp-strip-lbl">
                {activeFilter === "All" ? "All Products" : activeFilter} · {filtered.length} items
              </span>
              <div className="mp-strip-line" />
            </div>

            {filtered.length === 0 ? (
              <div className="mp-empty">
                <div className="mp-h" style={{ fontSize:"3.5rem", fontWeight:800, color:"rgba(0,0,0,0.07)", marginBottom:"1rem" }}>
                  Nothing here yet
                </div>
                <p style={{ color:"#bbb", fontSize:"0.9rem" }}>Try a different filter or search term.</p>
              </div>
            ) : (
              <div className="mp-grid">
                {filtered.map((product, i) => (
                  <MenuItemCard key={product.id} item={product} index={i} />
                ))}
              </div>
            )}

            {/* Trust strip */}
            <div className="mp-trust">
              {[
                { e:"🚚", t:"Free Shipping" },
                { e:"↩️", t:"30-Day Returns" },
                { e:"🏆", t:"Lifetime Warranty" },
                { e:"✅", t:"100% BPA Free" },
                { e:"🧊", t:"24H Ice Cold" },
              ].map(x => (
                <span key={x.t} className="mp-trust-item">
                  <span>{x.e}</span> {x.t}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}