/* ============================================================
   Wealth Mastery OS — Interactive Roadmap Canvas
   Custom infinite canvas: pan, zoom, pinch, fit, minimap,
   dependency edges, status colors, filters, search highlight.
   Zero dependencies.
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});

  const NODE_W = 200, NODE_H = 78, MOD_W = 200;
  const GAP_X = 30, GAP_Y = 28, COLS = 4;
  const INNER_PAD = 30, PHASE_HEADER = 50, MODULE_GAP = 26, PHASE_GAP = 56, MARGIN = 60;

  // ---- Layout: compute world coordinates for every block ----
  function computeLayout() {
    const phaseLeft = MARGIN;
    const rowW = COLS * NODE_W + (COLS - 1) * GAP_X;
    const phaseWidth = rowW + INNER_PAD * 2;
    let cursorY = MARGIN;
    const phaseBoxes = [];
    const nodePos = {};   // nodeId -> {x,y,w,h}
    const modulePos = {}; // moduleId -> {x,y}

    WM.PHASES.forEach((phase) => {
      const phaseTop = cursorY;
      let y = phaseTop + PHASE_HEADER;
      phase.modules.forEach((mod) => {
        // module label card starts a new row
        let col = 0;
        const place = (id, isMod) => {
          const x = phaseLeft + INNER_PAD + col * (NODE_W + GAP_X);
          if (isMod) modulePos[id] = { x, y };
          else nodePos[id] = { x, y, w: NODE_W, h: NODE_H };
          col++;
          if (col >= COLS) { col = 0; y += NODE_H + GAP_Y; }
        };
        place(mod.id, true);
        mod.nodes.forEach((n) => place(n.id, false));
        if (col !== 0) y += NODE_H + GAP_Y;
        y += MODULE_GAP;
      });
      const phaseHeight = y - phaseTop - MODULE_GAP + INNER_PAD;
      phaseBoxes.push({ phase, x: phaseLeft, y: phaseTop, w: phaseWidth, h: phaseHeight });
      cursorY = phaseTop + phaseHeight + PHASE_GAP;
    });

    return {
      phaseBoxes, nodePos, modulePos,
      worldW: phaseLeft + phaseWidth + MARGIN,
      worldH: cursorY + MARGIN
    };
  }

  function mount(host, opts) {
    opts = opts || {};
    const layout = computeLayout();
    const store = WM.store, util = WM.util;

    // viewport state
    let scale = 0.62, tx = 0, ty = 0;
    const filters = { difficulty: 0, status: "all", query: "" };

    // DOM
    host.innerHTML = "";
    host.classList.add("canvas-host");
    const layer = util.el("div", { class: "canvas-layer" });
    layer.style.width = layout.worldW + "px";
    layer.style.height = layout.worldH + "px";
    host.appendChild(layer);

    // edges svg
    const NS = "http://www.w3.org/2000/svg";
    const edgeSvg = document.createElementNS(NS, "svg");
    edgeSvg.setAttribute("class", "rm-edge");
    edgeSvg.setAttribute("width", layout.worldW);
    edgeSvg.setAttribute("height", layout.worldH);
    edgeSvg.style.width = layout.worldW + "px";
    edgeSvg.style.height = layout.worldH + "px";
    layer.appendChild(edgeSvg);

    // phase boxes + labels
    layout.phaseBoxes.forEach((pb) => {
      const box = util.el("div", { class: "rm-phase" });
      box.style.cssText += `left:${pb.x}px;top:${pb.y}px;width:${pb.w}px;height:${pb.h}px;border-color:${hexA(pb.phase.color, 0.25)};`;
      layer.appendChild(box);
      const lab = util.el("div", { class: "rm-phase-label", text: "Phase " + pb.phase.code + " · " + pb.phase.title });
      lab.style.left = pb.x + 18 + "px";
      lab.style.top = pb.y - 13 + "px";
      lab.style.borderColor = hexA(pb.phase.color, 0.4);
      lab.style.color = pb.phase.color;
      layer.appendChild(lab);
    });

    // module label cards
    const nodeEls = {};
    WM.PHASES.forEach((phase) => phase.modules.forEach((mod) => {
      const mp = layout.modulePos[mod.id];
      if (!mp) return;
      const card = util.el("div", { class: "rm-node is-module", dataset: { module: mod.id } }, [
        util.el("div", { class: "rm-node-title", text: mod.name }),
        util.el("div", { class: "rm-node-meta" }, [util.el("span", { text: mod.nodes.length + " topics" })])
      ]);
      card.style.cssText += `left:${mp.x}px;top:${mp.y}px;`;
      card.addEventListener("click", (e) => { e.stopPropagation(); if (mod.nodes[0]) location.hash = "#/node/" + mod.nodes[0].slug; });
      layer.appendChild(card);
    }));

    // node cards
    WM.NODES.forEach((n) => {
      const pos = layout.nodePos[n.id];
      if (!pos) return;
      const card = util.el("div", { class: "rm-node", dataset: { node: n.id }, role: "button", tabindex: "0", "aria-label": n.title });
      card.style.cssText += `left:${pos.x}px;top:${pos.y}px;`;
      const dot = util.el("span", { class: "rm-node-status" });
      const meta = util.el("div", { class: "rm-node-meta" }, [
        util.el("span", { text: util.fmt.hours(n.hours) }),
        util.el("span", { text: "· " + n.difficultyLabel })
      ]);
      card.appendChild(util.el("div", { class: "rm-node-title", text: n.title }));
      card.appendChild(meta);
      card.appendChild(dot);
      card.addEventListener("click", (e) => { e.stopPropagation(); location.hash = "#/node/" + n.slug; });
      card.addEventListener("keydown", (e) => { if (e.key === "Enter") location.hash = "#/node/" + n.slug; });
      card.addEventListener("mouseenter", () => highlightDeps(n, true));
      card.addEventListener("mouseleave", () => highlightDeps(n, false));
      layer.appendChild(card);
      nodeEls[n.id] = card;
    });

    function drawEdges() {
      edgeSvg.innerHTML = "";
      WM.NODES.forEach((n) => {
        const to = layout.nodePos[n.id];
        if (!to) return;
        (n.prerequisites || []).forEach((pid) => {
          const from = layout.nodePos[pid];
          if (!from) return;
          const x1 = from.x + from.w / 2, y1 = from.y + from.h, x2 = to.x + to.w / 2, y2 = to.y;
          const path = document.createElementNS(NS, "path");
          const my = (y1 + y2) / 2;
          let d;
          if (Math.abs(y2 - y1) < 6) {
            // same row: side to side
            d = `M${from.x + from.w},${from.y + from.h / 2} C${from.x + from.w + 24},${from.y + from.h / 2} ${to.x - 24},${to.y + to.h / 2} ${to.x},${to.y + to.h / 2}`;
          } else {
            d = `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
          }
          path.setAttribute("d", d);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", store.isCompleted(pid) ? hexA(WM.util.COLORS.completed, 0.5) : "rgba(255,255,255,0.10)");
          path.setAttribute("stroke-width", "1.5");
          path.dataset.from = pid; path.dataset.to = n.id;
          edgeSvg.appendChild(path);
        });
      });
    }

    function applyStatuses() {
      const cur = store.currentNode();
      WM.NODES.forEach((n) => {
        const card = nodeEls[n.id];
        if (!card) return;
        let status = store.nodeStatus(n);
        if (cur && cur.id === n.id) status = "current";
        card.classList.remove("status-completed", "status-current", "status-locked", "status-available", "status-in-progress");
        card.classList.add("status-" + status);
        const dot = card.querySelector(".rm-node-status");
        if (dot) dot.style.background = util.statusColor(status === "current" ? "current" : status);
      });
    }

    function applyFilters() {
      const q = filters.query.trim().toLowerCase();
      WM.NODES.forEach((n) => {
        const card = nodeEls[n.id];
        if (!card) return;
        let show = true;
        if (filters.difficulty && n.difficulty !== filters.difficulty) show = false;
        if (filters.status !== "all") {
          const st = store.nodeStatus(n);
          const cur = store.currentNode();
          if (filters.status === "current" && !(cur && cur.id === n.id)) show = false;
          else if (filters.status !== "current" && st !== filters.status) show = false;
        }
        card.classList.toggle("dim", !show);
        card.classList.remove("highlight");
        if (q) {
          const match = (n.title + " " + n.tags.join(" ")).toLowerCase().includes(q);
          card.classList.toggle("highlight", match);
          card.classList.toggle("dim", !match);
        }
      });
    }

    function highlightDeps(node, on) {
      edgeSvg.querySelectorAll("path").forEach((p) => {
        const related = p.dataset.to === node.id || p.dataset.from === node.id;
        if (on && related) { p.setAttribute("stroke", WM.util.COLORS.learning); p.setAttribute("stroke-width", "2.5"); }
        else { p.setAttribute("stroke", store.isCompleted(p.dataset.from) ? hexA(WM.util.COLORS.completed, 0.5) : "rgba(255,255,255,0.10)"); p.setAttribute("stroke-width", "1.5"); }
      });
    }

    // ---- transform ----
    function apply() {
      layer.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
      drawMinimap();
    }
    function clampPan() {
      const vw = host.clientWidth, vh = host.clientHeight;
      const w = layout.worldW * scale, h = layout.worldH * scale;
      const margin = 200;
      tx = util.clamp(tx, Math.min(0, vw - w - margin), margin);
      ty = util.clamp(ty, Math.min(0, vh - h - margin), margin);
    }

    function zoomAt(cx, cy, factor) {
      const ns = util.clamp(scale * factor, 0.2, 2.2);
      const wx = (cx - tx) / scale, wy = (cy - ty) / scale;
      scale = ns;
      tx = cx - wx * scale; ty = cy - wy * scale;
      clampPan(); apply();
    }
    function fit() {
      const vw = host.clientWidth, vh = host.clientHeight;
      scale = util.clamp(Math.min(vw / layout.worldW, vh / layout.worldH) * 0.96, 0.2, 1.2);
      tx = (vw - layout.worldW * scale) / 2;
      ty = 20;
      apply();
    }
    function focusNode(node, zoom) {
      const pos = layout.nodePos[node.id] || layout.modulePos[node.id];
      if (!pos) return;
      const vw = host.clientWidth, vh = host.clientHeight;
      scale = zoom || 0.95;
      tx = vw / 2 - (pos.x + NODE_W / 2) * scale;
      ty = vh / 2 - (pos.y + NODE_H / 2) * scale;
      clampPan(); apply();
      const card = nodeEls[node.id];
      if (card) { card.classList.add("highlight"); setTimeout(() => card.classList.remove("highlight"), 1600); }
    }
    function focusPhase(phaseId) {
      const pb = layout.phaseBoxes.find((b) => b.phase.id === phaseId);
      if (!pb) return;
      const vw = host.clientWidth;
      scale = util.clamp(vw / pb.w * 0.82, 0.3, 1);
      tx = vw / 2 - (pb.x + pb.w / 2) * scale;
      ty = 80 - pb.y * scale;
      clampPan(); apply();
    }

    // ---- pointer pan / pinch ----
    const pointers = new Map();
    let panning = false, last = null, pinchDist = 0;
    host.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".rm-node")) return;
      host.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) { panning = true; last = { x: e.clientX, y: e.clientY }; host.classList.add("grabbing"); }
    });
    host.addEventListener("pointermove", (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const pts = [...pointers.values()];
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const cx = (pts[0].x + pts[1].x) / 2 - host.getBoundingClientRect().left;
        const cy = (pts[0].y + pts[1].y) / 2 - host.getBoundingClientRect().top;
        if (pinchDist) zoomAt(cx, cy, d / pinchDist);
        pinchDist = d;
        return;
      }
      if (panning && last) { tx += e.clientX - last.x; ty += e.clientY - last.y; last = { x: e.clientX, y: e.clientY }; clampPan(); apply(); }
    });
    function endPtr(e) { pointers.delete(e.pointerId); if (pointers.size < 2) pinchDist = 0; if (pointers.size === 0) { panning = false; host.classList.remove("grabbing"); } }
    host.addEventListener("pointerup", endPtr);
    host.addEventListener("pointercancel", endPtr);
    host.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = host.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 0.89);
    }, { passive: false });

    // keyboard pan/zoom
    host.tabIndex = 0;
    host.addEventListener("keydown", (e) => {
      const step = 60;
      if (e.key === "ArrowUp") { ty += step; clampPan(); apply(); }
      else if (e.key === "ArrowDown") { ty -= step; clampPan(); apply(); }
      else if (e.key === "ArrowLeft") { tx += step; clampPan(); apply(); }
      else if (e.key === "ArrowRight") { tx -= step; clampPan(); apply(); }
      else if (e.key === "+" || e.key === "=") zoomAt(host.clientWidth / 2, host.clientHeight / 2, 1.15);
      else if (e.key === "-") zoomAt(host.clientWidth / 2, host.clientHeight / 2, 0.87);
      else if (e.key === "0") fit();
    });

    // ---- minimap ----
    const mini = opts.minimap;
    let miniCanvas = null;
    if (mini) {
      miniCanvas = document.createElement("canvas");
      miniCanvas.width = 180; miniCanvas.height = 120;
      mini.innerHTML = ""; mini.appendChild(miniCanvas);
      mini.addEventListener("click", (e) => {
        const r = miniCanvas.getBoundingClientRect();
        const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
        const vw = host.clientWidth, vh = host.clientHeight;
        tx = vw / 2 - fx * layout.worldW * scale;
        ty = vh / 2 - fy * layout.worldH * scale;
        clampPan(); apply();
      });
    }
    function drawMinimap() {
      if (!miniCanvas) return;
      const ctx = miniCanvas.getContext("2d");
      const W = miniCanvas.width, H = miniCanvas.height;
      const k = Math.min(W / layout.worldW, H / layout.worldH);
      ctx.clearRect(0, 0, W, H);
      layout.phaseBoxes.forEach((pb) => {
        ctx.fillStyle = hexA(pb.phase.color, 0.5);
        ctx.fillRect(pb.x * k, pb.y * k, pb.w * k, pb.h * k);
      });
      // viewport
      const vw = host.clientWidth, vh = host.clientHeight;
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
      ctx.strokeRect((-tx / scale) * k, (-ty / scale) * k, (vw / scale) * k, (vh / scale) * k);
    }

    // initial render
    drawEdges(); applyStatuses(); fit();

    // react to store changes
    const unsub = store.subscribe(() => { applyStatuses(); drawEdges(); applyFilters(); });

    const controller = {
      zoomIn: () => zoomAt(host.clientWidth / 2, host.clientHeight / 2, 1.2),
      zoomOut: () => zoomAt(host.clientWidth / 2, host.clientHeight / 2, 0.83),
      fit, focusNode, focusPhase,
      setFilter: (k, v) => { filters[k] = v; applyFilters(); },
      search: (q) => { filters.query = q; applyFilters(); },
      destroy: () => { unsub(); }
    };
    return controller;
  }

  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  WM.roadmap = { mount, computeLayout, hexA };
})();
