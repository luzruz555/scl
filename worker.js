// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Cloudflare Worker — SNS Card SVG Renderer
//  사용법: ?name=오하늘&text=게시물내용&tag=해시태그
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── GitHub raw 이미지 베이스 URL ──────────────────────────────
//  ※ 본인 저장소 경로로 수정하세요
//  파일 구조 예시: /img/S1.png ~ S12.png
const GITHUB_IMG_BASE = "https://raw.githubusercontent.com/luzruz555/scl/main/img"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ✏️  캐릭터 설정 — 여기만 수정하면 됩니다
//
//  형식:
//  "표시이름": { id: "파일명(확장자 제외)", handle: "@아이디" }
//
//  프로필 이미지는 자동으로 GITHUB_IMG_BASE/id.png 로 연결됩니다
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CHARACTERS = {
  "박진수": { id: "S1",  handle: "park_jinsoo"    },
  "박세진": { id: "S2",  handle: "sejin_coach"     },
  "이지원": { id: "S3",  handle: "jiwon_t"      },
  "이소은": { id: "S4",  handle: "lse_0000"        },
  "김세훈": { id: "S5",  handle: "sh_baseball"  },
  "오하늘": { id: "S6",  handle: "sky_5"      },
  "최도윤": { id: "S7",  handle: "cdoyun"          },
  "이유림": { id: "S8",  handle: "yurim00"       },
  "윤서아": { id: "S9",  handle: "seo_a"      },
  "한지후": { id: "S10", handle: "jh0000"      },
  "백가은": { id: "S11", handle: "gaeun_b"         },
  "정유나": { id: "S12", handle: "YUNA_23"          },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  이하 수정 불필요
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function wrapText(text, maxChars = 28) {
  const lines = []
  let current = ""
  for (const char of text) {
    current += char
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
  // 한글이면 첫 글자, 영문이면 첫 알파벳 대문자
  return String(name).trim()[0]?.toUpperCase() ?? "?"
}

function buildSVG({ name, text, tag, avatar, handle, isUnknown }) {
  const lines = wrapText(text)
  const lineHeight = 26
  const textBlockH = lines.length * lineHeight
  const cardH = Math.max(160, 100 + textBlockH + 52)
  const W = 620

  const tspans = lines.map((line, i) =>
    `<tspan x="80" dy="${i === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`
  ).join("")

  // 프로필 영역 — 이미지 or 이니셜 원
  function profileBlock() {
    if (isUnknown) {
      const initial = esc(getInitial(name))
      return [
        '<circle cx="44" cy="52" r="24" fill="#1e2028"/>',
        '<circle cx="44" cy="52" r="24" fill="none" stroke="#2a2d35" stroke-width="1.2"/>',
        `<text x="44" y="57" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="18" font-weight="700" fill="#536471" text-anchor="middle">${initial}</text>`,
      ].join("\n  ")
    }
    const src = esc(avatar)
    return [
      `<image href="${src}" x="20" y="28" width="48" height="48" clip-path="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`,
      '<circle cx="44" cy="52" r="24" fill="none" stroke="#2a2d35" stroke-width="1.2"/>',
    ].join("\n  ")
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${cardH}"
     viewBox="0 0 ${W} ${cardH}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#16181c"/>
      <stop offset="100%" stop-color="#0f1013"/>
    </linearGradient>
    <clipPath id="avatar-clip">
      <circle cx="44" cy="52" r="24"/>
    </clipPath>
  </defs>

  <!-- 카드 배경 -->
  <rect width="${W}" height="${cardH}" rx="16" ry="16" fill="url(#bg)"/>
  <rect width="${W}" height="${cardH}" rx="16" ry="16"
        fill="none" stroke="#2a2d35" stroke-width="1.2"/>

  <!-- 로고 (좌상단) -->
  <circle cx="30" cy="20" r="11" fill="#1d9bf0" opacity="0.12"/>
  <path d="M23,16 Q27,13 31,15 Q29,18 26,18 Q30,20 34,17 Q33,22 28,23 Q22,23 21,19 Q22,17 23,16 Z"
        fill="#1d9bf0"/>

  ${profileBlock()}
  <!-- 닉네임 + 핸들 -->
  <text x="80" y="46"
        font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif"
        font-size="15" font-weight="700" fill="#e7e9ea">${esc(name)}</text>
  <text x="80" y="64"
        font-family="'SF Mono','Consolas',monospace"
        font-size="12" fill="#536471">${esc(handle)}</text>

  <!-- 구분선 -->
  <line x1="20" y1="85" x2="${W - 20}" y2="85"
        stroke="#2a2d35" stroke-width="0.8"/>

  <!-- 본문 -->
  <text x="80" y="112"
        font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif"
        font-size="15" fill="#e7e9ea" xml:space="preserve">${tspans}</text>

  <!-- 해시태그 -->
  <text x="80" y="${112 + textBlockH + 22}"
        font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif"
        font-size="13" fill="#1d9bf0">#${esc(tag)}</text>

  <!-- 하단 연도 -->
  <text x="${W - 20}" y="${cardH - 14}"
        font-family="'SF Mono','Consolas',monospace"
        font-size="11" fill="#536471" text-anchor="end">✦ 2026</text>
</svg>`
}

export default {
  async fetch(request) {
    const url    = new URL(request.url)
    const name   = url.searchParams.get("name") ?? "익명"
    const text   = url.searchParams.get("text") ?? ""
    const tag    = url.searchParams.get("tag")  ?? ""

    const char      = CHARACTERS[name]
    const isUnknown = !char
    const avatar    = char ? `${GITHUB_IMG_BASE}/${char.id}.png` : ""
    const handle    = char?.handle ?? "@unknown"

    const svg = buildSVG({ name, text, tag, avatar, handle, isUnknown })

    return new Response(svg, {
      headers: {
        "Content-Type":                "image/svg+xml; charset=utf-8",
        "Cache-Control":               "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  },
}
