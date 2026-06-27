/* ============================================================
   Wealth Mastery OS — Node detail view (the full node model)
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};

  WM.views.node = function (root, slug) {
    const u = WM.util, store = WM.store;
    const node = WM.NODE_BY_SLUG[slug];
    root.innerHTML = "";
    if (!node) {
      root.appendChild(u.el("div", { class: "empty" }, [u.el("div", { class: "big", text: "🔍" }), u.el("div", { text: "Node not found." }), u.el("a", { class: "btn mt", onclick: () => location.hash = "#/roadmap" }, "Back to roadmap")]));
      return;
    }
    const rec = store.nodeRec(node.id);
    const status = store.nodeStatus(node);
    const locked = status === "locked";
    const phase = WM.curriculum.getPhase(node.phaseId);

    const wrap = u.el("div", { class: "node-detail" });

    // breadcrumbs
    wrap.appendChild(u.el("div", { class: "crumbs" }, [
      u.el("a", { onclick: () => location.hash = "#/roadmap", text: "Roadmap" }),
      u.el("span", { text: "›" }),
      u.el("a", { onclick: () => location.hash = "#/roadmap/" + node.phaseId, text: "Phase " + node.phaseCode + " · " + node.phaseTitle }),
      u.el("span", { text: "›" }),
      u.el("span", { class: "muted", text: node.moduleName })
    ]));

    // hero
    const hero = u.el("div", { class: "node-hero" });
    hero.style.borderColor = WM.roadmap.hexA(node.color, 0.3);
    hero.appendChild(u.el("div", { class: "row wrap", style: "gap:8px;margin-bottom:12px;" }, [
      statusChip(status),
      u.el("span", { class: "chip blue", text: node.difficultyLabel }),
      u.el("span", { class: "chip", text: "⏱️ " + u.fmt.hours(node.hours) }),
      rec.bookmarked ? u.el("span", { class: "chip gold", text: "★ Bookmarked" }) : null,
      rec.favorite ? u.el("span", { class: "chip purple", text: "♥ Favorite" }) : null
    ]));
    hero.appendChild(u.el("h1", { class: "page-title", text: node.title }));
    hero.appendChild(u.el("div", { class: "page-sub", text: node.description }));

    // difficulty meter + tags
    const diff = u.el("span", { class: "difficulty", dataset: { lvl: String(node.difficulty) } });
    for (let i = 0; i < 5; i++) diff.appendChild(u.el("i"));
    hero.appendChild(u.el("div", { class: "row wrap mt", style: "gap:10px;" }, [
      u.el("span", { class: "muted", text: "Difficulty:" }), diff,
      u.el("span", { class: "muted", style: "margin-left:auto", text: "Tags:" }),
      ...node.tags.map((t) => u.el("span", { class: "chip", text: t }))
    ]));

    // action buttons
    const completeBtn = u.el("button", { class: "btn " + (rec.status === "completed" ? "btn-success" : "btn-primary"), disabled: locked && rec.status !== "completed", onclick: () => {
      store.toggleComplete(node.id);
      u.toast(store.isCompleted(node.id) ? "Marked complete (+" + u.fmt.hours(node.hours) + ")" : "Marked as in progress", "success");
      WM.router.reload();
    } }, rec.status === "completed" ? "✓ Completed — undo" : (locked ? "🔒 Locked" : "Mark complete"));
    const actions = u.el("div", { class: "row wrap mt-lg", style: "gap:8px;" }, [
      completeBtn,
      u.el("button", { class: "btn", onclick: () => { const b = store.toggleBookmark(node.id); u.toast(b ? "Bookmarked" : "Removed bookmark"); WM.router.reload(); } }, rec.bookmarked ? "★ Bookmarked" : "☆ Bookmark"),
      u.el("button", { class: "btn", onclick: () => { const f = store.toggleFavorite(node.id); WM.router.reload(); } }, rec.favorite ? "♥ Favorite" : "♡ Favorite"),
      u.el("button", { class: "btn", onclick: () => WM.app.openMentor("Give me a 60-minute plan for " + node.title) }, "🧠 Mentor plan"),
      u.el("button", { class: "btn btn-ghost", onclick: () => location.hash = "#/roadmap/" + node.slug }, "View on map")
    ]);
    hero.appendChild(actions);

    if (locked) {
      const pre = (node.prerequisites || []).map((id) => WM.NODE_BY_ID[id]).filter(Boolean);
      hero.appendChild(u.el("div", { class: "card mt", style: "border-color:" + WM.roadmap.hexA(u.COLORS.prereq, 0.4) }, [
        u.el("div", { class: "card-title", html: "🔒 Locked — complete prerequisites first" }),
        u.el("div", { class: "row wrap mt", style: "gap:8px;" }, pre.map((pn) => u.el("button", { class: "btn btn-sm", onclick: () => location.hash = "#/node/" + pn.slug }, [u.el("span", { text: store.isCompleted(pn.id) ? "✓ " : "○ " }), u.el("span", { text: pn.title })])))
      ]));
    }
    wrap.appendChild(hero);

    // main grid
    const grid = u.el("div", { class: "node-grid" });
    const main = u.el("div");
    const side = u.el("div");

    // Purpose / Why it matters
    main.appendChild(section("Purpose", u.el("p", { class: "muted", style: "line-height:1.6", text: node.purpose })));
    main.appendChild(section("Why it matters", u.el("p", { class: "muted", style: "line-height:1.6", text: node.whyItMatters })));

    // Learning outcomes
    main.appendChild(section("Learning outcomes", listOutcomes(node.outcomes)));

    // Exercises (checklist)
    main.appendChild(section("Exercises & practice", checkList(node, "exercise", node.exercises)));

    // Assignments
    const asgEl = u.el("div", { class: "check-list" });
    node.assignments.forEach((a, i) => {
      const key = "assign-" + i;
      const done = !!rec.checklist[key];
      const li = u.el("div", { class: "res-item", style: "cursor:pointer", onclick: () => { store.toggleChecklist(node.id, key); WM.router.reload(); } }, [
        u.el("div", { class: "check-box" + (done ? " done" : ""), html: done ? "✓" : "" }),
        u.el("div", {}, [u.el("strong", { text: a.title }), u.el("div", { class: "faint", style: "font-size:12.5px;margin-top:3px", text: a.detail })])
      ]);
      if (done) li.style.borderColor = u.COLORS.completed;
      asgEl.appendChild(li);
    });
    main.appendChild(section("Assignments", asgEl));

    // Assessment / quiz
    main.appendChild(section("Knowledge test", quizBlock(node, rec)));

    // Reflection
    main.appendChild(section("Reflection questions", listPlain(node.reflection)));

    // Real life + careers
    main.appendChild(section("Real-life applications", listPlain(node.realLife)));
    main.appendChild(section("Career relevance", u.el("div", { class: "row wrap", style: "gap:8px" }, node.careers.map((cn) => u.el("span", { class: "chip purple", text: cn })))));

    // Notes
    const notesArea = u.el("textarea", { placeholder: "Your notes, observations and Zettelkasten links for " + node.title + "…", oninput: u.debounce((e) => store.setNote(node.id, e.target.value), 400) });
    notesArea.value = rec.notes || "";
    main.appendChild(section("My notes", notesArea));

    // ---- side ----
    // mastery
    const masteryCard = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", text: "Mastery levels" })]);
    const ml = u.el("ol", { style: "margin:12px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:13px;line-height:1.5" });
    node.mastery.forEach((m) => ml.appendChild(u.el("li", { class: "muted", text: m })));
    masteryCard.appendChild(ml);
    side.appendChild(masteryCard);

    // resources
    const resCard = u.el("div", { class: "card mt" }, [u.el("div", { class: "card-title", text: "Resources" })]);
    const groups = [["Books", node.resources.books], ["Courses", node.resources.courses], ["Videos", node.resources.videos], ["Articles", node.resources.articles], ["Podcasts", node.resources.podcasts], ["Research", node.resources.papers]];
    const resBody = u.el("div", { class: "mt" });
    groups.forEach(([label, items]) => {
      (items || []).forEach((r) => {
        resBody.appendChild(u.el("a", { class: "res-item", href: r.url, target: "_blank", rel: "noopener" }, [
          u.el("span", { class: "res-type", text: r.type || label }),
          u.el("div", {}, [u.el("div", { style: "font-size:13px;font-weight:600", text: r.title }), u.el("div", { class: "faint", style: "font-size:11.5px", text: r.source })])
        ]));
      });
    });
    resCard.appendChild(resBody);
    side.appendChild(resCard);

    // dependents (unlocks)
    const deps = (node.dependents || []).map((id) => WM.NODE_BY_ID[id]).filter(Boolean);
    if (deps.length) {
      const depCard = u.el("div", { class: "card mt" }, [u.el("div", { class: "card-title", text: "Unlocks next" })]);
      const dl = u.el("div", { class: "mt", style: "display:flex;flex-direction:column;gap:6px" });
      deps.forEach((d) => dl.appendChild(u.el("button", { class: "btn btn-sm", style: "justify-content:flex-start", onclick: () => location.hash = "#/node/" + d.slug }, [u.el("span", { text: "→ " }), u.el("span", { text: d.title })])));
      depCard.appendChild(dl);
      side.appendChild(depCard);
    }

    // linked projects
    if (node.projects && node.projects.length) {
      const projCard = u.el("div", { class: "card mt" }, [u.el("div", { class: "card-title", text: "Related projects" })]);
      node.projects.forEach((pn) => projCard.appendChild(u.el("button", { class: "btn btn-sm mt", style: "width:100%;justify-content:flex-start", onclick: () => location.hash = "#/projects" }, "🛠️ " + pn)));
      side.appendChild(projCard);
    }

    // version history + review
    const vCard = u.el("div", { class: "card mt" }, [u.el("div", { class: "card-title", text: "Version & review" })]);
    if (rec.status === "completed" && rec.reviewDue) vCard.appendChild(u.el("div", { class: "chip green mt", text: "Next review: " + u.fmt.date(rec.reviewDue) }));
    node.version.forEach((v) => vCard.appendChild(u.el("div", { class: "faint mt", style: "font-size:12px", text: "v" + v.v + " · " + u.fmt.date(v.date) + " — " + v.note })));
    side.appendChild(vCard);

    grid.appendChild(main); grid.appendChild(side);
    wrap.appendChild(grid);

    // prev / next navigation
    const idx = WM.NODES.indexOf(node);
    const prev = WM.NODES[idx - 1], next = WM.NODES[idx + 1];
    wrap.appendChild(u.el("div", { class: "row between mt-lg" }, [
      prev ? u.el("button", { class: "btn", onclick: () => location.hash = "#/node/" + prev.slug }, "← " + prev.title) : u.el("span"),
      next ? u.el("button", { class: "btn", onclick: () => location.hash = "#/node/" + next.slug }, next.title + " →") : u.el("span")
    ]));

    root.appendChild(wrap);
    root.scrollTop = 0;

    // helpers
    function section(title, content) {
      const s = u.el("div", { class: "card mt" }, [u.el("div", { class: "card-title", text: title })]);
      s.appendChild(u.el("div", { class: "mt" }, [content]));
      return s;
    }
  };

  function statusChip(status) {
    const map = { completed: ["green", "✓ Completed"], current: ["orange", "● Current"], "in-progress": ["blue", "◐ In progress"], available: ["blue", "○ Available"], locked: ["red", "🔒 Locked"] };
    const [cls, label] = map[status] || ["blue", status];
    return WM.util.el("span", { class: "chip " + cls, text: label });
  }
  function listOutcomes(items) {
    const ul = WM.util.el("ul", { class: "outcome-list" });
    items.forEach((o) => ul.appendChild(WM.util.el("li", { text: o })));
    return ul;
  }
  function listPlain(items) {
    const ul = WM.util.el("ul", { style: "margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;line-height:1.5" });
    items.forEach((o) => ul.appendChild(WM.util.el("li", { class: "muted", text: o })));
    return ul;
  }
  function checkList(node, prefix, items) {
    const u = WM.util, store = WM.store, rec = store.nodeRec(node.id);
    const ul = u.el("ul", { class: "check-list" });
    items.forEach((it, i) => {
      const key = prefix + "-" + i;
      const done = !!rec.checklist[key];
      const li = u.el("li", { class: done ? "done" : "", onclick: () => { store.toggleChecklist(node.id, key); WM.router.reload(); } }, [
        u.el("span", { class: "check-box", html: done ? "✓" : "" }),
        u.el("span", { text: it })
      ]);
      ul.appendChild(li);
    });
    return ul;
  }

  function quizBlock(node, rec) {
    const u = WM.util, store = WM.store;
    const wrap = u.el("div");
    const state = { answers: {}, submitted: false };
    function render() {
      wrap.innerHTML = "";
      if (rec.quizPassed && !state.submitted) {
        wrap.appendChild(u.el("div", { class: "chip green", text: "✓ Passed — you can retake anytime" }));
        wrap.appendChild(u.el("button", { class: "btn btn-sm mt", onclick: () => { rec.quizPassed = false; state.submitted = false; state.answers = {}; render(); } }, "Retake quiz"));
        return;
      }
      node.assessment.forEach((q, qi) => {
        const qEl = u.el("div", { class: "mt", style: "margin-bottom:14px" }, [u.el("strong", { text: (qi + 1) + ". " + q.q })]);
        q.options.forEach((opt, oi) => {
          const id = "q" + qi + "o" + oi;
          let cls = "btn btn-sm mt"; let style = "width:100%;justify-content:flex-start;text-align:left;";
          if (state.submitted) {
            if (oi === q.answer) style += "border-color:" + u.COLORS.completed + ";background:" + WM.roadmap.hexA(u.COLORS.completed, 0.12) + ";";
            else if (state.answers[qi] === oi) style += "border-color:" + u.COLORS.prereq + ";";
          } else if (state.answers[qi] === oi) style += "border-color:" + u.COLORS.learning + ";";
          qEl.appendChild(u.el("button", { class: cls, style: style, onclick: () => { if (state.submitted) return; state.answers[qi] = oi; render(); } }, [u.el("span", { text: String.fromCharCode(65 + oi) + ". " }), u.el("span", { text: opt })]));
        });
        wrap.appendChild(qEl);
      });
      if (!state.submitted) {
        wrap.appendChild(u.el("button", { class: "btn btn-primary mt", disabled: Object.keys(state.answers).length < node.assessment.length, onclick: () => {
          state.submitted = true;
          const correct = node.assessment.filter((q, qi) => state.answers[qi] === q.answer).length;
          const passed = correct === node.assessment.length;
          store.setQuizPassed(node.id, passed);
          render();
          u.toast(passed ? "Perfect! Quiz passed 🎉" : correct + "/" + node.assessment.length + " correct — review and retry", passed ? "success" : "");
        } }, "Submit answers"));
      } else {
        const correct = node.assessment.filter((q, qi) => state.answers[qi] === q.answer).length;
        wrap.appendChild(u.el("div", { class: "row mt", style: "gap:10px" }, [
          u.el("span", { class: "chip " + (correct === node.assessment.length ? "green" : "orange"), text: "Score: " + correct + "/" + node.assessment.length }),
          u.el("button", { class: "btn btn-sm", onclick: () => { state.submitted = false; state.answers = {}; render(); } }, "Try again")
        ]));
      }
    }
    render();
    return wrap;
  }
})();
