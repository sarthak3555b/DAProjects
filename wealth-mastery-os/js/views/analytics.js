/* ============================================================
   Wealth Mastery OS — Progress Analytics view
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};

  WM.views.analytics = function (root) {
    const u = WM.util, store = WM.store, c = WM.charts;
    root.classList.remove("no-pad");
    root.innerHTML = "";
    const p = store.progress();

    root.appendChild(u.el("div", { class: "page-head" }, [
      u.el("div", {}, [
        u.el("div", { class: "eyebrow", text: "Measure what matters" }),
        u.el("h1", { class: "page-title", text: "Progress Analytics" })
      ])
    ]));

    // top KPIs
    root.appendChild(u.el("div", { class: "grid grid-4" }, [
      kpi("Overall completion", u.fmt.pct(p.overallPct), c.sparkline(velocitySeries().map((d) => d.value), u.COLORS.learning)),
      kpi("Hours studied", u.fmt.hours(p.hours), null),
      kpi("Current streak", p.streak + " days", null),
      kpi("Nodes completed", p.completedCount + "/" + p.totalNodes, null)
    ]));

    // learning velocity + hours
    root.appendChild(u.el("h2", { class: "section-title", text: "Learning velocity" }));
    const velCard = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", text: "Nodes completed per week (last 12 weeks)" })]);
    velCard.appendChild(u.el("div", { class: "mt" }, [c.bars(velocitySeries(), { height: 180, color: u.COLORS.completed, showValues: true })]));
    root.appendChild(velCard);

    // mastery progress by difficulty
    root.appendChild(u.el("h2", { class: "section-title", text: "Mastery by difficulty" }));
    const md = u.el("div", { class: "grid grid-3" });
    WM.DIFFICULTY.forEach((label, i) => {
      const lvl = i + 1;
      const nodes = WM.NODES.filter((n) => n.difficulty === lvl);
      const done = nodes.filter((n) => store.isCompleted(n.id)).length;
      const pct = nodes.length ? (done / nodes.length) * 100 : 0;
      const card = u.el("div", { class: "card" }, [
        u.el("div", { class: "row between" }, [u.el("strong", { text: label }), u.el("span", { class: "muted", text: done + "/" + nodes.length })])
      ]);
      const track = u.el("div", { class: "progress-track mt" }); const fill = u.el("div", { class: "progress-fill" + (pct === 100 ? " green" : "") }); fill.style.width = pct + "%"; track.appendChild(fill);
      card.appendChild(track);
      md.appendChild(card);
    });
    root.appendChild(md);

    // phase completion
    root.appendChild(u.el("h2", { class: "section-title", text: "Phase completion" }));
    const phaseCard = u.el("div", { class: "card" });
    WM.PHASES.forEach((ph) => {
      const pp = store.phaseProgress(ph);
      const row = u.el("div", { class: "mt" }, [
        u.el("div", { class: "row between" }, [u.el("span", { style: "font-size:13.5px", text: "P" + ph.code + " · " + ph.title }), u.el("span", { class: "muted", text: u.fmt.pct(pp.pct) })])
      ]);
      const track = u.el("div", { class: "progress-track", style: "margin-top:5px" }); const fill = u.el("div", { class: "progress-fill" + (pp.pct === 100 ? " green" : "") }); fill.style.width = pp.pct + "%"; track.appendChild(fill);
      row.appendChild(track);
      phaseCard.appendChild(row);
    });
    root.appendChild(phaseCard);

    // radar + heatmap
    root.appendChild(u.el("h2", { class: "section-title", text: "Skills & consistency" }));
    const radarCard = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", text: "Skill radar" })]);
    radarCard.appendChild(c.radar(WM.views._skillAxes()));
    const heatCard = u.el("div", { class: "card span-2" }, [u.el("div", { class: "card-title", text: "Study heatmap (52 weeks)" })]);
    heatCard.appendChild(u.el("div", { class: "mt", style: "overflow-x:auto" }, [c.heatmap(store.state.activity, 52)]));
    root.appendChild(u.el("div", { class: "grid grid-3" }, [radarCard, heatCard]));

    // achievements
    root.appendChild(u.el("h2", { class: "section-title", text: "🏆 Achievements" }));
    const ag = u.el("div", { class: "badge-grid" });
    store.ACHIEVEMENTS.forEach((a) => {
      const unlocked = store.state.achievements[a.id];
      ag.appendChild(u.el("div", { class: "badge" + (unlocked ? "" : " locked") }, [
        u.el("div", { class: "b-emoji", text: a.emoji }),
        u.el("div", { class: "b-name", text: a.name }),
        u.el("div", { class: "b-desc", text: a.desc }),
        unlocked ? u.el("div", { class: "faint", style: "font-size:10px;margin-top:4px", text: u.fmt.date(unlocked) }) : null
      ]));
    });
    root.appendChild(ag);
  };

  WM.views._skillAxes = function () {
    const AX = [
      { label: "Foundations", codes: ["0", "0.5"] }, { label: "Money & Econ", codes: ["1", "5", "6"] },
      { label: "Personal Fin", codes: ["2", "3"] }, { label: "Accounting", codes: ["4", "8", "9"] },
      { label: "Markets", codes: ["10", "11", "12", "13", "14"] }, { label: "Business", codes: ["7", "15"] },
      { label: "Tech & AI", codes: ["16"] }, { label: "Allocation", codes: ["17", "18", "19", "20"] }
    ];
    return AX.map((a) => {
      let total = 0, done = 0;
      WM.PHASES.filter((p) => a.codes.includes(p.code)).forEach((p) => { const pp = WM.store.phaseProgress(p); total += pp.total; done += pp.done; });
      return { label: a.label, value: total ? (done / total) * 100 : 0 };
    });
  };

  function velocitySeries() {
    const store = WM.store, weeks = 12, buckets = new Array(weeks).fill(0);
    const now = Date.now();
    for (const id in store.state.nodes) {
      const rec = store.state.nodes[id];
      if (rec.status === "completed" && rec.completedAt) {
        const diffWeeks = Math.floor((now - new Date(rec.completedAt).getTime()) / (7 * 86400000));
        if (diffWeeks >= 0 && diffWeeks < weeks) buckets[weeks - 1 - diffWeeks]++;
      }
    }
    return buckets.map((v, i) => ({ label: i === weeks - 1 ? "now" : (i % 3 === 0 ? "-" + (weeks - 1 - i) + "w" : ""), value: v }));
  }

  function kpi(label, value, spark) {
    const u = WM.util;
    return u.el("div", { class: "card" }, [
      u.el("div", { class: "stat-label", text: label }),
      u.el("div", { style: "font-family:var(--font-display);font-weight:800;font-size:24px;margin-top:4px", text: value }),
      spark ? u.el("div", { class: "mt" }, [spark]) : null
    ]);
  }
})();
