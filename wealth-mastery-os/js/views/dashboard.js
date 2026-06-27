/* ============================================================
   Wealth Mastery OS — Dashboard view
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};

  const SKILL_AXES = [
    { label: "Foundations", codes: ["0", "0.5"] },
    { label: "Money & Econ", codes: ["1", "5", "6"] },
    { label: "Personal Fin", codes: ["2", "3"] },
    { label: "Accounting", codes: ["4", "8", "9"] },
    { label: "Markets", codes: ["10", "11", "12", "13", "14"] },
    { label: "Business", codes: ["7", "15"] },
    { label: "Tech & AI", codes: ["16"] },
    { label: "Allocation", codes: ["17", "18", "19", "20"] }
  ];

  function pctForCodes(codes) {
    let total = 0, done = 0;
    WM.PHASES.filter((p) => codes.includes(p.code)).forEach((p) => {
      const pp = WM.store.phaseProgress(p); total += pp.total; done += pp.done;
    });
    return total ? (done / total) * 100 : 0;
  }

  function stat(icon, color, value, label) {
    const u = WM.util;
    const ico = u.el("div", { class: "stat-ico" });
    ico.style.background = WM.roadmap.hexA(color, 0.16);
    ico.style.color = color;
    ico.innerHTML = icon;
    return u.el("div", { class: "card stat hover" }, [
      ico,
      u.el("div", { class: "stat-val", text: value }),
      u.el("div", { class: "stat-label", text: label })
    ]);
  }

  function goalBar(label, period) {
    const u = WM.util, store = WM.store;
    const done = store.periodMinutes(period);
    const goal = store.state.goals[period] || 1;
    const pct = Math.min(100, (done / goal) * 100);
    return u.el("div", { class: "card" }, [
      u.el("div", { class: "row between" }, [
        u.el("div", { class: "card-title", text: label }),
        u.el("div", { class: "muted", text: u.fmt.hours(done / 60) + " / " + u.fmt.hours(goal / 60) })
      ]),
      (function () { const t = u.el("div", { class: "progress-track mt" }); const f = u.el("div", { class: "progress-fill" + (pct >= 100 ? " green" : "") }); f.style.width = pct + "%"; t.appendChild(f); return t; })()
    ]);
  }

  function dailyActivityBars() {
    const store = WM.store, days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = WM.util.todayKey(d);
      days.push({ label: d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 1), value: Math.round((store.state.activity[k] || 0)) });
    }
    return WM.charts.bars(days, { height: 180, color: WM.util.COLORS.learning });
  }

  WM.views.dashboard = function (root) {
    const u = WM.util, store = WM.store, c = WM.charts;
    const p = store.progress();
    const cur = p.currentNode;
    root.innerHTML = "";

    // Hero
    const hero = u.el("div", { class: "hero" });
    const heroGrid = u.el("div", { class: "row between wrap", style: "gap:24px;" });
    const heroLeft = u.el("div", { style: "flex:1;min-width:260px;" }, [
      u.el("div", { class: "eyebrow", text: "Wealth Mastery OS" }),
      u.el("h1", { text: "Welcome back, " + u.esc(store.state.profile.name) }),
      u.el("div", { class: "hero-sub", text: cur ? `Your frontier: ${cur.title} — Phase ${cur.phaseCode} · ${cur.moduleName}` : "You've reached the current frontier of the roadmap. Time to review and apply." }),
      u.el("div", { class: "row wrap mt", style: "gap:8px;" }, [
        u.el("button", { class: "btn btn-primary", onclick: () => { if (cur) location.hash = "#/node/" + cur.slug; else location.hash = "#/roadmap"; } }, cur ? "Continue learning →" : "Open roadmap →"),
        u.el("button", { class: "btn", onclick: openLogSession }, "＋ Log a session"),
        u.el("button", { class: "btn btn-ghost", onclick: () => WM.app.openMentor() }, "Ask your mentor")
      ])
    ]);
    const ring = c.ring(p.overallPct, { cap: p.completedCount + "/" + p.totalNodes + " nodes" });
    heroGrid.appendChild(heroLeft);
    heroGrid.appendChild(u.el("div", { class: "ring-wrap" }, [ring]));
    hero.appendChild(heroGrid);
    root.appendChild(hero);

    // Stats grid
    const stats = u.el("div", { class: "grid grid-4 mt-lg" }, [
      stat('🎯', u.COLORS.current, "Phase " + (p.currentPhase ? p.currentPhase.code : "—"), p.currentPhase ? p.currentPhase.title : "All phases"),
      stat('✅', u.COLORS.completed, u.fmt.pct(p.overallPct), "Completion"),
      stat('⏱️', u.COLORS.learning, u.fmt.hours(p.hours), "Hours studied"),
      stat('🔥', u.COLORS.current, p.streak + "d", "Current streak"),
      stat('📖', u.COLORS.project, String(p.books), "Books completed"),
      stat('🛠️', u.COLORS.project, String(p.projectsCompleted), "Projects completed"),
      stat('🏆', u.COLORS.gold, String(p.phasesCompleted), "Phases completed"),
      stat('📓', u.COLORS.learning, String(p.journalCount), "Journal entries")
    ]);
    root.appendChild(stats);

    // last activity + current module line
    root.appendChild(u.el("div", { class: "row wrap mt", style: "gap:10px;" }, [
      u.el("span", { class: "chip", text: "Last activity: " + u.fmt.relative(store.state.lastActiveDate) }),
      cur ? u.el("span", { class: "chip orange", text: "Current module: " + cur.moduleName }) : null,
      u.el("span", { class: "chip blue", text: "Time plan: 60 min/day · 4 days/week · ~200 h/yr" })
    ]));

    // Goals
    root.appendChild(u.el("h2", { class: "section-title", text: "Goals" }));
    root.appendChild(u.el("div", { class: "grid grid-3" }, [
      goalBar("Weekly goal", "weekly"),
      goalBar("Monthly goal", "monthly"),
      goalBar("Yearly goal", "yearly")
    ]));

    // Charts row 1: hours + radar
    root.appendChild(u.el("h2", { class: "section-title", text: "Insights" }));
    const hoursCard = u.el("div", { class: "card span-2" }, [u.el("div", { class: "card-title", text: "Learning activity — last 14 days (minutes)" })]);
    hoursCard.appendChild(u.el("div", { class: "mt" }, [dailyActivityBars()]));
    const radarCard = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", text: "Skill progress" })]);
    radarCard.appendChild(c.radar(SKILL_AXES.map((a) => ({ label: a.label, value: pctForCodes(a.codes) }))));
    root.appendChild(u.el("div", { class: "grid grid-3" }, [hoursCard, radarCard]));

    // Heatmap
    const heatCard = u.el("div", { class: "card mt" }, [u.el("div", { class: "card-title", text: "Knowledge heatmap — daily study (last 26 weeks)" })]);
    heatCard.appendChild(u.el("div", { class: "mt", style: "overflow-x:auto" }, [c.heatmap(store.state.activity, 26)]));
    heatCard.appendChild(u.el("div", { class: "row mt faint", style: "gap:6px;font-size:11px;justify-content:flex-end" }, [
      u.el("span", { text: "Less" }),
      u.el("span", { class: "heat-cell" }), u.el("span", { class: "heat-cell heat-1" }), u.el("span", { class: "heat-cell heat-2" }), u.el("span", { class: "heat-cell heat-3" }), u.el("span", { class: "heat-cell heat-4" }),
      u.el("span", { text: "More" })
    ]));
    root.appendChild(heatCard);

    // Mentor recommendations + timeline
    const recs = WM.mentor.recommendations();
    const recCard = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", html: "🧠 Mentor recommendations" })]);
    const recList = u.el("div", { class: "mt", style: "display:flex;flex-direction:column;gap:8px;" });
    if (!recs.length) recList.appendChild(u.el("div", { class: "faint", text: "All caught up. Log a session to get fresh recommendations." }));
    recs.forEach((r) => {
      recList.appendChild(u.el("button", { class: "btn", style: "justify-content:flex-start;width:100%;", onclick: () => {
        if (r.route === "journal") location.hash = "#/journal";
        else if (r.route === "roadmap") location.hash = "#/roadmap/" + r.ref;
        else if (r.ref) location.hash = "#/node/" + r.ref;
      } }, [u.el("span", { text: ({ learn: "📘", review: "🔁", focus: "🎯", habit: "🔥" })[r.kind] || "•" }), u.el("span", { text: r.title })]));
    });
    recCard.appendChild(recList);

    // completion timeline (phases)
    const tlCard = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", text: "Completion timeline" })]);
    const tl = u.el("div", { class: "timeline mt" });
    WM.PHASES.forEach((ph) => {
      const pp = store.phaseProgress(ph);
      const done = pp.total && pp.done === pp.total;
      const item = u.el("div", { class: "tl-item" + (done ? " done" : "") }, [
        u.el("div", { class: "row between" }, [
          u.el("strong", { text: "Phase " + ph.code + " · " + ph.title }),
          u.el("span", { class: "muted", text: u.fmt.pct(pp.pct) })
        ]),
        u.el("div", { class: "tl-date", text: pp.done + "/" + pp.total + " nodes · " + u.fmt.hours(pp.hours) + " est." })
      ]);
      tl.appendChild(item);
    });
    tlCard.appendChild(tl);
    root.appendChild(u.el("div", { class: "grid grid-2 mt" }, [recCard, tlCard]));
  };

  function openLogSession() {
    const u = WM.util, store = WM.store;
    const body = u.el("div");
    body.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Minutes studied today" }), u.el("input", { type: "number", id: "ls-min", value: "60", min: "1" })]));
    body.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "What did you focus on? (optional)" }), u.el("input", { type: "text", id: "ls-note", placeholder: "e.g. Compound interest" })]));
    u.modal({
      title: "Log a learning session",
      body: body,
      actions: [
        { label: "Cancel" },
        { label: "Save session", primary: true, onClick: () => {
          const mins = parseInt(document.getElementById("ls-min").value, 10) || 0;
          const note = document.getElementById("ls-note").value;
          if (mins > 0) {
            store.logActivity(mins);
            if (note) store.addJournal({ date: u.todayKey(), learned: note, body: note, tags: [], minutes: 0 });
            u.toast("Logged " + mins + " minutes. Keep the streak alive!", "success");
            WM.router.reload();
          }
        } }
      ]
    });
  }
})();
