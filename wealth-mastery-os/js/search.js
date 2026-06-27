/* ============================================================
   Wealth Mastery OS — Search engine (in-memory, instant)
   Indexes nodes, modules, phases, resources, careers, news.
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});

  let INDEX = null;
  function build() {
    const idx = [];
    WM.PHASES.forEach((p) => {
      idx.push({ type: "phase", id: p.id, title: "Phase " + p.code + " · " + p.title, sub: p.subtitle, route: "roadmap", ref: p.id, hay: (p.title + " " + p.subtitle + " " + p.blurb).toLowerCase() });
      p.modules.forEach((m) => {
        idx.push({ type: "module", id: m.id, title: m.name, sub: "Phase " + p.code + " · " + p.title, route: "node", ref: m.nodes[0] && m.nodes[0].slug, hay: (m.name + " " + p.title).toLowerCase() });
      });
    });
    WM.NODES.forEach((n) => {
      idx.push({ type: "node", id: n.id, title: n.title, sub: n.moduleName + " · Phase " + n.phaseCode, route: "node", ref: n.slug, color: n.color, hay: (n.title + " " + n.moduleName + " " + n.tags.join(" ") + " " + n.description).toLowerCase() });
    });
    (WM.RESOURCES || []).forEach((r) => {
      idx.push({ type: "resource", id: r.id, title: r.title, sub: r.type + " · " + r.source, route: "resources", ref: r.id, url: r.url, hay: (r.title + " " + r.source + " " + r.type + " " + (r.note || "")).toLowerCase() });
    });
    (WM.CAREERS || []).forEach((c) => {
      idx.push({ type: "career", id: c.id, title: c.name, sub: "Career path", route: "career", ref: c.id, hay: (c.name + " " + c.description + " " + c.skills.join(" ")).toLowerCase() });
    });
    (WM.NEWS || []).forEach((nw) => {
      idx.push({ type: "news", id: nw.id, title: nw.title, sub: nw.category + " · current affairs", route: "affairs", ref: nw.id, hay: (nw.title + " " + nw.category + " " + nw.what).toLowerCase() });
    });
    INDEX = idx;
    return idx;
  }

  function search(query, limit) {
    if (!INDEX) build();
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/);
    const scored = [];
    for (const item of INDEX) {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      for (const t of terms) {
        if (!item.hay.includes(t)) { score = -1; break; }
        if (titleLower.startsWith(t)) score += 8;
        else if (titleLower.includes(t)) score += 5;
        else score += 1;
      }
      if (score > 0) {
        // type weighting: nodes & phases first
        const weight = { phase: 3, module: 2.5, node: 2, career: 1.5, resource: 1, news: 1 }[item.type] || 1;
        scored.push({ item, score: score * weight });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit || 40).map((s) => s.item);
  }

  WM.search = { build, search, get index() { return INDEX || build(); } };
})();
