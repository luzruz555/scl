// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Cloudflare Worker — SNS Card SVG Renderer
//  사용법: ?name=오하늘&text=게시물내용&tag=해시태그
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── GitHub raw 이미지 베이스 URL ──────────────────────────────
const GITHUB_IMG_BASE = "https://raw.githubusercontent.com/luzruz555/scl/main/img"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ✏️  캐릭터 설정 — 여기만 수정하면 됩니다
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CHARACTERS = {
  "박진수": { id: "S1",  handle: "@park_jinsoo"   },
  "박세진": { id: "S2",  handle: "@sejin_coach"    },
  "이지원": { id: "S3",  handle: "@jiwon_phys"     },
  "이소은": { id: "S4",  handle: "@lse_0000"       },
  "김세훈": { id: "S5",  handle: "@sehun_baseball" },
  "오하늘": { id: "S6",  handle: "@haneul_sky"     },
  "최도윤": { id: "S7",  handle: "@cdoyun"         },
  "이유림": { id: "S8",  handle: "@yurim_log"      },
  "윤서아": { id: "S9",  handle: "@seo_a_note"     },
  "한지후": { id: "S10", handle: "@jihu_study"     },
  "백가은": { id: "S11", handle: "@gaeun_b"        },
  "정유나": { id: "S12", handle: "@yuna_j"         },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  이하 수정 불필요
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 이미지 URL → base64 data URI 변환 (CORS 우회)
async function toBase64(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const mime = res.headers.get("content-type") ?? "image/png"
    const buf  = await res.arrayBuffer()
    const b64  = btoa(String.fromCharCode(...new Uint8Array(buf)))
    return `data:${mime};base64,${b64}`
  } catch {
    return null
  }
}

function wrapText(text, maxChars) {
  maxChars = maxChars || 28
  const lines = []
  let current = ""
  for (let i = 0; i < text.length; i++) {
    current += text[i]
    if (current.length >= maxChars) {
      lines.push(current)
      current = ""
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 5)
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function getInitial(name) {
  return String(name).trim()[0] || "?"
}

function buildSVG(name, text, tag, handle, avatarData, isUnknown) {
  const lines      = wrapText(text)
  const lineHeight = 26
  const textBlockH = lines.length * lineHeight
  const cardH      = Math.max(160, 100 + textBlockH + 52)
  const W          = 620

  let tspans = ""
  for (let i = 0; i < lines.length; i++) {
    tspans += '<tspan x="80" dy="' + (i === 0 ? 0 : lineHeight) + '">' + esc(lines[i]) + "</tspan>"
  }

  let profileSVG = ""
  if (isUnknown) {
    const initial = esc(getInitial(name))
    profileSVG =
      '<circle cx="44" cy="52" r="24" fill="#1e2028"/>' +
      '<circle cx="44" cy="52" r="24" fill="none" stroke="#2a2d35" stroke-width="1.2"/>' +
      '<text x="44" y="57" font-family="Apple SD Gothic Neo,Noto Sans KR,sans-serif" font-size="18" font-weight="700" fill="#536471" text-anchor="middle">' + initial + "</text>"
  } else {
    profileSVG =
      '<image href="' + esc(avatarData) + '" x="20" y="28" width="48" height="48" clip-path="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice"/>' +
      '<circle cx="44" cy="52" r="24" fill="none" stroke="#2a2d35" stroke-width="1.2"/>'
  }

  const hashtagY  = 112 + textBlockH + 22
  const metaY     = cardH - 14
  const dividerX2 = W - 20
  const metaX     = W - 20

  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"' +
    ' width="' + W + '" height="' + cardH + '" viewBox="0 0 ' + W + ' ' + cardH + '">' +
    "<defs>" +
    '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#16181c"/>' +
    '<stop offset="100%" stop-color="#0f1013"/>' +
    "</linearGradient>" +
    '<clipPath id="avatar-clip"><circle cx="44" cy="52" r="24"/></clipPath>' +
    "</defs>" +
    '<rect width="' + W + '" height="' + cardH + '" rx="16" ry="16" fill="url(#bg)"/>' +
    '<rect width="' + W + '" height="' + cardH + '" rx="16" ry="16" fill="none" stroke="#2a2d35" stroke-width="1.2"/>' +
    '<circle cx="30" cy="20" r="11" fill="#1d9bf0" opacity="0.12"/>' +
    '<path d="M23,16 Q27,13 31,15 Q29,18 26,18 Q30,20 34,17 Q33,22 28,23 Q22,23 21,19 Q22,17 23,16 Z" fill="#1d9bf0"/>' +
    profileSVG +
    '<text x="80" y="46" font-family="Apple SD Gothic Neo,Noto Sans KR,sans-serif" font-size="15" font-weight="700" fill="#e7e9ea">' + esc(name) + "</text>" +
    '<text x="80" y="64" font-family="SF Mono,Consolas,monospace" font-size="12" fill="#536471">' + esc(handle) + "</text>" +
    '<line x1="20" y1="85" x2="' + dividerX2 + '" y2="85" stroke="#2a2d35" stroke-width="0.8"/>' +
    '<text x="80" y="112" font-family="Apple SD Gothic Neo,Noto Sans KR,sans-serif" font-size="15" fill="#e7e9ea">' + tspans + "</text>" +
    '<text x="80" y="' + hashtagY + '" font-family="Apple SD Gothic Neo,Noto Sans KR,sans-serif" font-size="13" fill="#1d9bf0">' + esc(tag) + "</text>" +
    '<text x="' + metaX + '" y="' + metaY + '" font-family="SF Mono,Consolas,monospace" font-size="11" fill="#536471" text-anchor="end">✦ 2025</text>' +
    "</svg>"
}

export default {
  async fetch(request) {
    const url  = new URL(request.url)
    const name = url.searchParams.get("name") || "익명"
    const text = url.searchParams.get("text") || ""
    const tag  = url.searchParams.get("tag")  || ""

    const char      = CHARACTERS[name]
    const isUnknown = !char
    const handle    = char ? char.handle : "@unknown"

    let avatarData = ""
    if (!isUnknown) {
      const imgUrl = GITHUB_IMG_BASE + "/" + char.id + ".png"
      avatarData   = await toBase64(imgUrl) || ""
      if (!avatarData) {
        // base64 변환 실패 시 이니셜로 폴백
        return new Response(
          buildSVG(name, text, tag, handle, "", true),
          { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" } }
        )
      }
    }

    const svg = buildSVG(name, text, tag, handle, avatarData, isUnknown)

    return new Response(svg, {
      headers: {
        "Content-Type":                "image/svg+xml; charset=utf-8",
        "Cache-Control":               "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  },
}
