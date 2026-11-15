/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production"
// La barra de comentarios de Vercel solo se carga en los despliegues de preview
const vercelLive = process.env.VERCEL_ENV === "preview" ? " https://vercel.live" : ""

// CSP: solo recursos propios. Next necesita estilos y scripts en línea para la hidratación.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  `style-src 'self' 'unsafe-inline'${vercelLive}`,
  `img-src 'self' data: blob:${vercelLive}`,
  `font-src 'self' data:${vercelLive}`,
  `connect-src 'self'${vercelLive}${vercelLive ? " wss://ws-us3.pusher.com" : ""}`,
  `frame-src${vercelLive || " 'none'"}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

module.exports = nextConfig
