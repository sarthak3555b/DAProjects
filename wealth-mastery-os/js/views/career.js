/* ============================================================
   Wealth Mastery OS — Career Explorer view
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};

  WM.views.career = function (root, id) {
    const u = WM.util;
    root.classList.remove("no-pad");
    root.innerHTML = "";

    if (id) { renderDetail(root, id); return; }

    root.appendChild(u.el("div", { class: "page-head" }, [
      u.el("div", {}, [
        u.el("div", { class: "eyebrow", text: "Where this knowledge leads" }),
        u.el("h1", { class: "page-title", text: "Career Explorer" }),
        u.el("div", { class: "page-sub", text: "Eleven paths from beginner to capital allocator. Each maps to phases in your roadmap, with skills, projects, salary ranges and the impact of AI." })
      ])
    ]));

    const grid = u.el("div", { class: "grid grid-3" });
    WM.CAREERS.forEach((cr) => {
      let total = 0, done = 0;
      WM.PHASES.filter((p) => cr.phases.includes(p.code)).forEach((p) => { const pp = WM.store.phaseProgress(p); total += pp.total; done += pp.done; });
      const pct = total ? (done / total) * 100 : 0;
      const card = u.el("div", { class: "card hover", style: "cursor:pointer", onclick: () => location.hash = "#/career/" + cr.id }, [
        u.el("div", { class: "row", style: "gap:12px" }, [
          u.el("div", { style: "font-size:32px", text: cr.emoji }),
          u.el("div", {}, [u.el("strong", { style: "font-size:16px", text: cr.name }), u.el("div", { class: "faint", style: "font-size:12px", text: cr.phases.length + " linked phases" })])
        ]),
        u.el("div", { class: "muted mt", style: "font-size:13px;line-height:1.5", text: cr.description }),
        (function () { const t = u.el("div", { class: "progress-track mt" }); const f = u.el("div", { class: "progress-fill" }); f.style.width = pct + "%"; f.style.background = "linear-gradient(90deg," + cr.color + ",var(--project))"; t.appendChild(f); return t; })(),
        u.el("div", { class: "faint mt", style: "font-size:12px", text: "Roadmap readiness: " + u.fmt.pct(pct) })
      ]);
      grid.appendChild(card);
    });
    root.appendChild(grid);
  };

  function renderDetail(root, id) {
    const u = WM.util;
    const cr = WM.CAREERS.find((c) => c.id === id);
    if (!cr) { location.hash = "#/career"; return; }

    root.appendChild(u.el("div", { class: "crumbs" }, [u.el("a", { onclick: () => location.hash = "#/career", text: "Career Explorer" }), u.el("span", { text: "›" }), u.el("span", { class: "muted", text: cr.name })]));

    const hero = u.el("div", { class: "node-hero" });
    hero.style.borderColor = WM.roadmap.hexA(cr.color, 0.3);
    hero.appendChild(u.el("div", { class: "row", style: "gap:16px;align-items:center" }, [
      u.el("div", { style: "font-size:48px", text: cr.emoji }),
      u.el("div", {}, [u.el("h1", { class: "page-title", text: cr.name }), u.el("div", { class: "page-sub", text: cr.description })])
    ]));
    root.appendChild(hero);

    const grid = u.el("div", { class: "node-grid" });
    const main = u.el("div");
    const side = u.el("div");

    main.appendChild(card("Core skills", u.el("div", { class: "row wrap", style: "gap:8px" }, cr.skills.map((s) => u.el("span", { class: "chip blue", text: s })))));

    // linked phases with progress
    const phaseWrap = u.el("div");
    cr.phases.forEach((code) => {
      const ph = WM.PHASES.find((p) => p.code === code);
      if (!ph) return;
      const pp = WM.store.phaseProgress(ph);
      const row = u.el("div", { class: "res-item", style: "cursor:pointer", onclick: () => location.hash = "#/roadmap/" + ph.id }, [
        u.el("div", { style: "flex:1" }, [u.el("strong", { text: "Phase " + ph.code + " · " + ph.title }),
          (function () { const t = u.el("div", { class: "progress-track", style: "margin-top:6px" }); const f = u.el("div", { class: "progress-fill" }); f.style.width = pp.pct + "%"; t.appendChild(f); return t; })()]),
        u.el("span", { class: "muted", text: u.fmt.pct(pp.pct) })
      ]);
      phaseWrap.appendChild(row);
    });
    main.appendChild(card("Roadmap to this career", phaseWrap));
    main.appendChild(card("Signature projects", u.el("div", {}, cr.projects.map((pr) => u.el("button", { class: "btn btn-sm mt", style: "width:100%;justify-content:flex-start", onclick: () => location.hash = "#/projects" }, "🛠️ " + pr)))));

    side.appendChild(card("Salary range", u.el("div", { class: "muted", style: "line-height:1.6", text: cr.salary })));
    side.appendChild(card("AI impact", u.el("div", { class: "muted", style: "line-height:1.6", text: cr.aiImpact })));
    side.appendChild(card("Future trends", u.el("div", { class: "muted", style: "line-height:1.6", text: cr.future })));

    grid.appendChild(main); grid.appendChild(side);
    root.appendChild(grid);

    function card(title, content) { const s = WM.util.el("div", { class: "card mt" }, [WM.util.el("div", { class: "card-title", text: title })]); s.appendChild(WM.util.el("div", { class: "mt" }, [content])); return s; }
  }
})();
