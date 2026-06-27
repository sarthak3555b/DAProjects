/* ============================================================
   Wealth Mastery OS — Charts (hand-built SVG, zero dependency)
   ring, bars, line, radar, heatmap, sparkline
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  const NS = "http://www.w3.org/2000/svg";
  const C = WM.util ? WM.util.COLORS : { learning: "#3b82f6", completed: "#22c55e", current: "#f97316", project: "#a855f7", prereq: "#ef4444", gold: "#fbbf24" };

  function svg(w, h, vb) {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", vb || ("0 0 " + w + " " + h));
    s.setAttribute("width", "100%");
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
    s.style.display = "block";
    s.style.overflow = "visible";
    return s;
  }
  function e(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // ---- Progress ring ----
  function ring(pct, opts) {
    opts = opts || {};
    const size = 132, sw = 12, r = (size - sw) / 2, cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const wrap = document.createElement("div");
    wrap.className = "ring";
    const s = svg(size, size);
    s.appendChild(e("circle", { cx, cy, r, fill: "none", stroke: "rgba(255,255,255,0.08)", "stroke-width": sw }));
    const grad = e("linearGradient", { id: "ringGrad" + Math.random().toString(36).slice(2, 6), x1: "0", y1: "0", x2: "1", y2: "1" });
    const gid = grad.getAttribute("id");
    grad.appendChild(e("stop", { offset: "0%", "stop-color": C.learning }));
    grad.appendChild(e("stop", { offset: "100%", "stop-color": C.project }));
    s.appendChild(grad);
    const fg = e("circle", { cx, cy, r, fill: "none", stroke: "url(#" + gid + ")", "stroke-width": sw, "stroke-linecap": "round", "stroke-dasharray": circ, "stroke-dashoffset": circ });
    s.appendChild(fg);
    wrap.appendChild(s);
    const label = document.createElement("div");
    label.className = "ring-label";
    label.innerHTML = '<div class="ring-pct">' + Math.round(pct) + '%</div><div class="ring-cap">' + (opts.cap || "complete") + "</div>";
    wrap.appendChild(label);
    requestAnimationFrame(() => { fg.style.transition = "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)"; fg.setAttribute("stroke-dashoffset", circ * (1 - Math.min(1, pct / 100))); });
    return wrap;
  }

  // ---- Bar chart ----
  function bars(data, opts) {
    opts = opts || {};
    const W = 600, H = opts.height || 200, pad = 28, bottom = 22;
    const s = svg(W, H);
    const max = Math.max(1, ...data.map((d) => d.value));
    const n = data.length;
    const bw = (W - pad * 2) / n;
    data.forEach((d, i) => {
      const bh = (H - bottom - 10) * (d.value / max);
      const x = pad + i * bw;
      const y = H - bottom - bh;
      const rect = e("rect", { x: x + bw * 0.18, y, width: bw * 0.64, height: Math.max(1, bh), rx: 4, fill: d.color || C.learning, opacity: d.dim ? 0.5 : 1 });
      rect.style.transition = "height .6s ease, y .6s ease";
      s.appendChild(rect);
      const t = e("text", { x: x + bw / 2, y: H - 6, "text-anchor": "middle", "font-size": "10", fill: "#9aa6bd" });
      t.textContent = d.label;
      s.appendChild(t);
      if (opts.showValues && d.value) {
        const vt = e("text", { x: x + bw / 2, y: y - 4, "text-anchor": "middle", "font-size": "10", fill: "#e6eaf2" });
        vt.textContent = d.value;
        s.appendChild(vt);
      }
    });
    return s;
  }

  // ---- Line chart ----
  function line(points, opts) {
    opts = opts || {};
    const W = 600, H = opts.height || 200, pad = 30, bottom = 24;
    const s = svg(W, H);
    const max = Math.max(1, ...points.map((p) => p.value));
    const n = points.length;
    const stepX = (W - pad * 2) / Math.max(1, n - 1);
    const xy = points.map((p, i) => [pad + i * stepX, H - bottom - (H - bottom - 10) * (p.value / max)]);
    // grid baseline
    s.appendChild(e("line", { x1: pad, y1: H - bottom, x2: W - pad, y2: H - bottom, stroke: "rgba(255,255,255,0.1)" }));
    let d = "M" + xy.map((p) => p[0] + "," + p[1]).join(" L");
    const area = "M" + xy[0][0] + "," + (H - bottom) + " L" + xy.map((p) => p[0] + "," + p[1]).join(" L") + " L" + xy[xy.length - 1][0] + "," + (H - bottom) + " Z";
    const grad = e("linearGradient", { id: "lg" + Math.random().toString(36).slice(2, 6), x1: "0", y1: "0", x2: "0", y2: "1" });
    const gid = grad.getAttribute("id");
    grad.appendChild(e("stop", { offset: "0%", "stop-color": C.learning, "stop-opacity": "0.35" }));
    grad.appendChild(e("stop", { offset: "100%", "stop-color": C.learning, "stop-opacity": "0" }));
    s.appendChild(grad);
    s.appendChild(e("path", { d: area, fill: "url(#" + gid + ")" }));
    const path = e("path", { d, fill: "none", stroke: C.learning, "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-linecap": "round" });
    s.appendChild(path);
    xy.forEach((p) => s.appendChild(e("circle", { cx: p[0], cy: p[1], r: 3, fill: C.learning })));
    points.forEach((p, i) => {
      const t = e("text", { x: xy[i][0], y: H - 8, "text-anchor": "middle", "font-size": "10", fill: "#9aa6bd" });
      t.textContent = p.label; s.appendChild(t);
    });
    const len = path.getTotalLength ? path.getTotalLength() : 0;
    if (len) { path.style.strokeDasharray = len; path.style.strokeDashoffset = len; requestAnimationFrame(() => { path.style.transition = "stroke-dashoffset 1.1s ease"; path.style.strokeDashoffset = 0; }); }
    return s;
  }

  // ---- Radar chart ----
  function radar(axes, opts) {
    opts = opts || {};
    const size = 320, cx = size / 2, cy = size / 2 + 6, R = size / 2 - 46;
    const s = svg(size, size + 14);
    const n = axes.length;
    const ang = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2;
    [0.25, 0.5, 0.75, 1].forEach((g) => {
      const pts = axes.map((_, i) => [cx + Math.cos(ang(i)) * R * g, cy + Math.sin(ang(i)) * R * g]);
      s.appendChild(e("polygon", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: "rgba(255,255,255,0.08)" }));
    });
    axes.forEach((a, i) => {
      const x = cx + Math.cos(ang(i)) * R, y = cy + Math.sin(ang(i)) * R;
      s.appendChild(e("line", { x1: cx, y1: cy, x2: x, y2: y, stroke: "rgba(255,255,255,0.07)" }));
      const lx = cx + Math.cos(ang(i)) * (R + 22), ly = cy + Math.sin(ang(i)) * (R + 18);
      const t = e("text", { x: lx, y: ly, "text-anchor": "middle", "font-size": "10", fill: "#9aa6bd" });
      t.textContent = a.label; s.appendChild(t);
    });
    const pts = axes.map((a, i) => [cx + Math.cos(ang(i)) * R * (a.value / 100), cy + Math.sin(ang(i)) * R * (a.value / 100)]);
    const grad = e("radialGradient", { id: "rg" + Math.random().toString(36).slice(2, 6) });
    const gid = grad.getAttribute("id");
    grad.appendChild(e("stop", { offset: "0%", "stop-color": C.learning, "stop-opacity": "0.5" }));
    grad.appendChild(e("stop", { offset: "100%", "stop-color": C.project, "stop-opacity": "0.25" }));
    s.appendChild(grad);
    const poly = e("polygon", { points: pts.map((p) => p.join(",")).join(" "), fill: "url(#" + gid + ")", stroke: C.learning, "stroke-width": 2 });
    s.appendChild(poly);
    pts.forEach((p) => s.appendChild(e("circle", { cx: p[0], cy: p[1], r: 3, fill: C.learning })));
    return s;
  }

  // ---- Heatmap (GitHub-style contributions) ----
  function heatmap(activity, weeks) {
    weeks = weeks || 26;
    const wrap = document.createElement("div");
    wrap.className = "heatmap";
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (weeks * 7 - 1));
    // align to start of week (Sunday)
    start.setDate(start.getDate() - start.getDay());
    const key = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const total = weeks * 7;
    for (let i = 0; i < total; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const mins = activity[key(d)] || 0;
      let lvl = 0;
      if (mins > 0) lvl = 1;
      if (mins >= 30) lvl = 2;
      if (mins >= 60) lvl = 3;
      if (mins >= 120) lvl = 4;
      const cell = document.createElement("div");
      cell.className = "heat-cell" + (lvl ? " heat-" + lvl : "");
      cell.title = key(d) + ": " + mins + " min";
      if (d > today) cell.style.visibility = "hidden";
      wrap.appendChild(cell);
    }
    return wrap;
  }

  // ---- Sparkline ----
  function sparkline(values, color) {
    const W = 120, H = 34;
    const s = svg(W, H);
    const max = Math.max(1, ...values);
    const step = W / Math.max(1, values.length - 1);
    const d = "M" + values.map((v, i) => i * step + "," + (H - (H - 4) * (v / max))).join(" L");
    s.appendChild(e("path", { d, fill: "none", stroke: color || C.learning, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    return s;
  }

  WM.charts = { ring, bars, line, radar, heatmap, sparkline };
})();
