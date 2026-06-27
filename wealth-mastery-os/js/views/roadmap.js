/* ============================================================
   Wealth Mastery OS — Roadmap view (mounts interactive canvas)
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};
  let controller = null;

  WM.views.roadmap = function (root, param) {
    const u = WM.util;
    root.classList.add("no-pad");
    root.innerHTML = "";

    const wrap = u.el("div", { class: "roadmap-wrap" });

    // toolbar
    const toolbar = u.el("div", { class: "roadmap-toolbar" });
    // phase jump select
    const phaseSel = u.el("select", { style: "max-width:280px;", onchange: (e) => { if (e.target.value) { controller.focusPhase(e.target.value); } } });
    phaseSel.appendChild(u.el("option", { value: "", text: "Jump to phase…" }));
    WM.PHASES.forEach((p) => phaseSel.appendChild(u.el("option", { value: p.id, text: "Phase " + p.code + " · " + p.title })));

    // difficulty filter
    const diffSel = u.el("select", { style: "max-width:160px;", onchange: (e) => controller.setFilter("difficulty", parseInt(e.target.value, 10) || 0) });
    diffSel.appendChild(u.el("option", { value: "0", text: "All difficulties" }));
    WM.DIFFICULTY.forEach((d, i) => diffSel.appendChild(u.el("option", { value: String(i + 1), text: d })));

    // status filter
    const statusSel = u.el("select", { style: "max-width:160px;", onchange: (e) => controller.setFilter("status", e.target.value) });
    [["all", "All statuses"], ["completed", "Completed"], ["current", "Current"], ["available", "Available"], ["locked", "Locked"]].forEach(([v, t]) => statusSel.appendChild(u.el("option", { value: v, text: t })));

    // search within roadmap
    const rmSearch = u.el("input", { type: "text", placeholder: "Filter nodes…", style: "max-width:200px;", oninput: u.debounce((e) => controller.search(e.target.value), 120) });

    toolbar.appendChild(phaseSel);
    toolbar.appendChild(diffSel);
    toolbar.appendChild(statusSel);
    toolbar.appendChild(rmSearch);

    // minimap + canvas host
    const minimap = u.el("div", { class: "minimap", title: "Mini-map — click to navigate" });
    const host = u.el("div", { class: "canvas-host", tabindex: "0", "aria-label": "Roadmap canvas. Drag to pan, scroll to zoom, arrow keys to move." });

    // controls
    const controls = u.el("div", { class: "rm-controls" }, [
      u.el("button", { class: "icon-btn", title: "Zoom in", onclick: () => controller.zoomIn() }, "+"),
      u.el("button", { class: "icon-btn", title: "Zoom out", onclick: () => controller.zoomOut() }, "−"),
      u.el("button", { class: "icon-btn", title: "Fit to screen", onclick: () => controller.fit() }, "⊡")
    ]);

    // legend
    const legend = u.el("div", { class: "rm-legend" }, [
      legendItem(u.COLORS.learning, "Available"),
      legendItem(u.COLORS.completed, "Completed"),
      legendItem(u.COLORS.current, "Current"),
      legendItem(u.COLORS.project, "Module"),
      legendItem("#6b768d", "Locked")
    ]);

    wrap.appendChild(host);
    wrap.appendChild(toolbar);
    wrap.appendChild(minimap);
    wrap.appendChild(controls);
    wrap.appendChild(legend);
    root.appendChild(wrap);

    controller = WM.roadmap.mount(host, { minimap: minimap });

    // focus a phase or node if param present
    setTimeout(() => {
      if (param) {
        if (WM.curriculum.getPhase(param)) { phaseSel.value = param; controller.focusPhase(param); }
        else if (WM.NODE_BY_SLUG[param]) controller.focusNode(WM.NODE_BY_SLUG[param]);
      } else {
        const cur = WM.store.currentNode();
        if (cur) controller.focusNode(cur, 0.85);
      }
    }, 60);
  };

  WM.views.roadmap.cleanup = function () {
    if (controller) { controller.destroy(); controller = null; }
  };

  function legendItem(color, label) {
    const u = WM.util;
    const i = u.el("i"); i.style.background = color;
    return u.el("span", {}, [i, u.el("span", { text: label })]);
  }
})();
