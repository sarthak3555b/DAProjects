/* ============================================================
   Wealth Mastery OS — Shared utilities & DOM helpers
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "dataset") { for (const d in attrs[k]) node.dataset[d] = attrs[k][d]; }
        else if (k.startsWith("on") && typeof attrs[k] === "function") node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else if (attrs[k] === true) node.setAttribute(k, "");
        else if (attrs[k] !== false && attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null || c === false) return;
        node.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
      });
    }
    return node;
  }

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Minimal, safe markdown -> html (bold, italics, headings, lists, code, links, line breaks)
  function md(text) {
    if (!text) return "";
    let t = esc(text);
    t = t.replace(/^### (.*)$/gm, "<h4>$1</h4>")
         .replace(/^## (.*)$/gm, "<h3>$1</h3>")
         .replace(/^# (.*)$/gm, "<h2>$1</h2>");
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
         .replace(/\*(.+?)\*/g, "<em>$1</em>")
         .replace(/`(.+?)`/g, "<code>$1</code>");
    t = t.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // unordered lists
    t = t.replace(/(?:^|\n)((?:- .*(?:\n|$))+)/g, (m, block) => {
      const items = block.trim().split(/\n/).map((l) => "<li>" + l.replace(/^- /, "") + "</li>").join("");
      return "\n<ul>" + items + "</ul>";
    });
    t = t.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>");
    return "<p>" + t + "</p>";
  }

  const fmt = {
    num: (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN")),
    hours: (h) => {
      h = Number(h) || 0;
      if (h < 1) return Math.round(h * 60) + "m";
      return (Math.round(h * 10) / 10).toLocaleString("en-IN") + "h";
    },
    pct: (n) => Math.round(Number(n) || 0) + "%",
    date: (d) => {
      const dt = typeof d === "string" ? new Date(d) : d;
      if (!dt || isNaN(dt.getTime())) return "—";
      return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    },
    relative: (d) => {
      if (!d) return "never";
      const dt = new Date(d);
      const diff = Date.now() - dt.getTime();
      const day = 86400000;
      if (diff < 60000) return "just now";
      if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
      if (diff < day) return Math.floor(diff / 3600000) + "h ago";
      if (diff < day * 2) return "yesterday";
      if (diff < day * 30) return Math.floor(diff / day) + "d ago";
      return fmt.date(dt);
    }
  };

  function todayKey(date) {
    const d = date ? new Date(date) : new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function debounce(fn, ms) { let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms); }; }
  function uid(prefix) { return (prefix || "id") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  const COLORS = {
    learning: "#3b82f6", completed: "#22c55e", current: "#f97316", project: "#a855f7", prereq: "#ef4444", gold: "#fbbf24"
  };
  function statusColor(status) {
    return ({ completed: COLORS.completed, current: COLORS.current, "in-progress": COLORS.learning, locked: "#6b768d", available: COLORS.learning })[status] || COLORS.learning;
  }

  // toast
  function toast(msg, type) {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const t = el("div", { class: "toast " + (type || "") }, [
      el("span", { class: "t-ico", text: type === "success" ? "✓" : "✨" }),
      el("span", { text: msg })
    ]);
    stack.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(10px)"; setTimeout(() => t.remove(), 300); }, 2600);
  }

  // modal
  function modal(opts) {
    const root = document.getElementById("modal-root");
    if (!root) return;
    root.innerHTML = "";
    const body = typeof opts.body === "string" ? el("div", { html: opts.body }) : opts.body;
    const foot = el("div", { class: "modal-foot" });
    (opts.actions || [{ label: "Close", primary: true }]).forEach((a) => {
      foot.appendChild(el("button", {
        class: "btn " + (a.primary ? "btn-primary" : ""),
        onclick: () => { if (a.onClick) a.onClick(); if (a.keepOpen) return; close(); }
      }, a.label));
    });
    const m = el("div", { class: "modal", role: "dialog", "aria-modal": "true" }, [
      el("div", { class: "modal-head" }, [
        el("h3", { text: opts.title || "" }),
        el("button", { class: "icon-btn", onclick: close, "aria-label": "Close" }, "✕")
      ]),
      el("div", { class: "modal-body" }, body),
      foot
    ]);
    root.appendChild(m);
    root.hidden = false;
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    function close() { root.hidden = true; root.innerHTML = ""; document.removeEventListener("keydown", onKey); if (opts.onClose) opts.onClose(); }
    root.onclick = (e) => { if (e.target === root) close(); };
    return { close: close };
  }

  WM.util = { el, esc, md, fmt, todayKey, clamp, debounce, uid, COLORS, statusColor, toast, modal };
})();
