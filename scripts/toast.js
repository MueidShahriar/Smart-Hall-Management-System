/**
 * Smart Hall — Reusable Toast Notification System
 * Usage:  showToast("Your message", "success" | "error" | "warning" | "info")
 * Auto-dismisses after 3.5s. Click to dismiss early.
 */
(function () {
    "use strict";

    /* ── Container (created once) ── */
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    /* ── Icon SVGs ── */
    const icons = {
        success: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    /* ── Colours ── */
    const colours = {
        success: { bg: "#e8f5e9", border: "#2e7d32", text: "#1b5e20", icon: "#2e7d32", progress: "#2e7d32" },
        error: { bg: "#fce4ec", border: "#c62828", text: "#b71c1c", icon: "#c62828", progress: "#c62828" },
        warning: { bg: "#fff8e1", border: "#f57f17", text: "#e65100", icon: "#f57f17", progress: "#f57f17" },
        info: { bg: "#e3f2fd", border: "#1565c0", text: "#0d47a1", icon: "#1565c0", progress: "#1565c0" }
    };

    /**
     * Show a toast notification.
     * @param {string} message  - Text to display
     * @param {"success"|"error"|"warning"|"info"} type - Toast variant
     * @param {number} [duration=3500] - Auto-dismiss in ms (0 = manual)
     */
    function showToast(message, type = "info", duration = 3500) {
        const c = colours[type] || colours.info;
        const toast = document.createElement("div");
        toast.className = "toast-msg toast-" + type;
        toast.style.cssText = `
            display:flex;align-items:flex-start;gap:0.7rem;
            background:${c.bg};border-left:4px solid ${c.border};
            color:${c.text};padding:0.9rem 1.2rem;border-radius:0.6rem;
            box-shadow:0 8px 32px rgba(0,0,0,0.12);
            min-width:280px;max-width:420px;
            font-family:'Poppins',sans-serif;font-size:0.88rem;font-weight:500;
            cursor:pointer;position:relative;overflow:hidden;
            animation:toastIn 0.4s cubic-bezier(.21,1.02,.73,1) forwards;
            margin-bottom:0.6rem;
        `;

        toast.innerHTML = `
            <span style="flex-shrink:0;color:${c.icon};margin-top:1px">${icons[type] || icons.info}</span>
            <span style="flex:1;line-height:1.5">${message}</span>
            <span class="toast-close" style="flex-shrink:0;opacity:0.5;font-size:1.1rem;line-height:1;margin-left:0.5rem;transition:opacity 0.2s">&times;</span>
        `;

        /* ── Progress bar ── */
        if (duration > 0) {
            const bar = document.createElement("div");
            bar.style.cssText = `
                position:absolute;bottom:0;left:0;height:3px;
                background:${c.progress};border-radius:0 0 0 0.6rem;
                width:100%;animation:toastProgress ${duration}ms linear forwards;
            `;
            toast.appendChild(bar);
        }

        /* ── Dismiss ── */
        const dismiss = () => {
            toast.style.animation = "toastOut 0.35s ease forwards";
            toast.addEventListener("animationend", () => toast.remove());
        };
        toast.addEventListener("click", dismiss);
        toast.querySelector(".toast-close").addEventListener("mouseenter", (e) => e.target.style.opacity = "1");
        toast.querySelector(".toast-close").addEventListener("mouseleave", (e) => e.target.style.opacity = "0.5");

        if (duration > 0) setTimeout(dismiss, duration);

        container.appendChild(toast);
    }

    /* ── Inject keyframes + container styles (once) ── */
    if (!document.getElementById("toast-styles")) {
        const style = document.createElement("style");
        style.id = "toast-styles";
        style.textContent = `
            #toast-container{position:fixed;top:1.2rem;right:1.2rem;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;pointer-events:none}
            #toast-container .toast-msg{pointer-events:auto}
            @keyframes toastIn{0%{opacity:0;transform:translateX(80px) scale(0.95)}100%{opacity:1;transform:translateX(0) scale(1)}}
            @keyframes toastOut{0%{opacity:1;transform:translateX(0) scale(1)}100%{opacity:0;transform:translateX(80px) scale(0.92)}}
            @keyframes toastProgress{0%{width:100%}100%{width:0%}}
            @media(max-width:480px){#toast-container{left:0.6rem;right:0.6rem;align-items:stretch}#toast-container .toast-msg{max-width:100%;min-width:0}}
        `;
        document.head.appendChild(style);
    }

    /* ── Expose globally ── */
    window.showToast = showToast;
})();
