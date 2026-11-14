export interface Header {
    key: string;
    value: string;
}

/**
 * The Content-Security-Policy for the site. Everything it loads comes from its own origin (fonts are self-hosted by next/font at build
 * time, the charts are inline SVG), so `default-src 'self'` is enough. Next.js writes small inline scripts and styles without a nonce,
 * hence 'unsafe-inline'; development also needs 'unsafe-eval' for hot reloading.
 */
export function contentSecurityPolicy(isDev: boolean): string {
    const script = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";
    return [
        "default-src 'self'",
        `script-src ${script}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ].join("; ");
}

/** Headers sent with every response. HSTS is sent on every response; browsers ignore it on plain http, and development is on localhost. */
export function securityHeaders(isDev: boolean): Header[] {
    return [
        { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];
}
