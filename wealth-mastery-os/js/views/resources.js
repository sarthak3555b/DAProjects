/* ============================================================
   Wealth Mastery OS — Resources library view
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};

  let activeType = "All", query = "";

  WM.views.resources = function (root) {
    const u = WM.util, store = WM.store;
    root.classList.remove("no-pad");
    root.innerHTML = "";
    const all = WM.RESOURCES;
    const done = Object.values(store.state.resources.completed).filter(Boolean).length;

    root.appendChild(u.el("div", { class: "page-head" }, [
      u.el("div", {}, [
        u.el("div", { class: "eyebrow", text: "Curated & versioned" }),
        u.el("h1", { class: "page-title", text: "Resource Library" }),
        u.el("div", { class: "page-sub", text: "Hand-picked books, courses, videos, articles, newsletters, podcasts and research. Mark what you finish — it feeds your dashboard." })
      ]),
      u.el("div", { class: "chip green", text: done + " completed" })
    ]));

    // type filter
    const types = ["All", ...WM.RESOURCE_TYPES];
    const filterRow = u.el("div", { class: "row wrap", style: "gap:6px;margin-bottom:14px" });
    types.forEach((t) => {
      filterRow.appendChild(u.el("button", { class: "chip" + (activeType === t ? " blue" : ""), style: "cursor:pointer", onclick: () => { activeType = t; WM.router.reload(); } }, t + (t === "All" ? "" : " · " + all.filter((r) => r.type === t).length)));
    });
    root.appendChild(filterRow);

    // search
    const sb = u.el("input", { type: "text", placeholder: "Search resources…", value: query, oninput: u.debounce((e) => { query = e.target.value; rerender(); }, 150), style: "margin-bottom:16px;max-width:420px" });
    root.appendChild(sb);

    const grid = u.el("div", { class: "grid grid-3" });
    root.appendChild(grid);

    function rerender() {
      grid.innerHTML = "";
      const q = query.trim().toLowerCase();
      const items = all.filter((r) => (activeType === "All" || r.type === activeType) && (!q || (r.title + r.source + (r.note || "")).toLowerCase().includes(q)));
      if (!items.length) { grid.appendChild(u.el("div", { class: "empty span-2", html: "<div class='big'>📚</div>No resources match." })); return; }
      items.forEach((r) => {
        const bookmarked = store.state.resources.bookmarked[r.id];
        const completed = store.state.resources.completed[r.id];
        const phase = WM.PHASES.find((p) => p.code === r.phase);
        const card = u.el("div", { class: "card hover" }, [
          u.el("div", { class: "row between" }, [
            u.el("span", { class: "res-type", text: r.type }),
            completed ? u.el("span", { class: "chip green", text: "✓" }) : null
          ]),
          u.el("div", { style: "font-weight:700;margin-top:8px", text: r.title }),
          u.el("div", { class: "faint", style: "font-size:12.5px;margin-top:2px", text: r.source }),
          r.note ? u.el("div", { class: "muted", style: "font-size:13px;margin-top:8px;line-height:1.5", text: r.note }) : null,
          phase ? u.el("div", { class: "chip mt", text: "Phase " + phase.code, style: "cursor:pointer", onclick: () => location.hash = "#/roadmap/" + phase.id }) : null,
          u.el("div", { class: "row wrap mt", style: "gap:6px" }, [
            u.el("a", { class: "btn btn-sm btn-primary", href: r.url, target: "_blank", rel: "noopener" }, "Open ↗"),
            u.el("button", { class: "btn btn-sm", onclick: () => { store.toggleResourceDone(r.id); rerender(); } }, completed ? "Done ✓" : "Mark done"),
            u.el("button", { class: "btn btn-sm", onclick: () => { store.toggleResourceBookmark(r.id); rerender(); } }, bookmarked ? "★" : "☆")
          ])
        ]);
        grid.appendChild(card);
      });
    }
    rerender();
  };
})();
