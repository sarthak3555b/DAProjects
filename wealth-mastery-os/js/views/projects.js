/* ============================================================
   Wealth Mastery OS — Projects view + working interactive tools
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};

  function allProjects() {
    const list = [];
    WM.PHASES.forEach((p) => p.projects.forEach((name) => list.push({ name, phase: p })));
    return list;
  }

  WM.views.projects = function (root, sub) {
    const u = WM.util, store = WM.store;
    root.classList.remove("no-pad");
    root.innerHTML = "";
    const projects = allProjects();
    const doneCount = projects.filter((p) => store.state.projects[p.name] && store.state.projects[p.name].done).length;

    root.appendChild(u.el("div", { class: "page-head" }, [
      u.el("div", {}, [
        u.el("div", { class: "eyebrow", text: "Build to learn" }),
        u.el("h1", { class: "page-title", text: "Projects & Tools" }),
        u.el("div", { class: "page-sub", text: "Knowledge without implementation is incomplete. Build these projects and use the live calculators to apply every concept." })
      ]),
      u.el("div", { class: "chip green", text: doneCount + " / " + projects.length + " projects done" })
    ]));

    const tabs = u.el("div", { class: "tabs" });
    const tabAll = u.el("div", { class: "tab" + (sub !== "tools" ? " active" : ""), text: "All projects", onclick: () => location.hash = "#/projects" });
    const tabTools = u.el("div", { class: "tab" + (sub === "tools" ? " active" : ""), text: "🧮 Interactive tools", onclick: () => location.hash = "#/projects/tools" });
    tabs.appendChild(tabAll); tabs.appendChild(tabTools);
    root.appendChild(tabs);

    if (sub === "tools") { renderTools(root); return; }

    // group by phase
    WM.PHASES.forEach((p) => {
      if (!p.projects.length) return;
      root.appendChild(u.el("h2", { class: "section-title", text: "Phase " + p.code + " · " + p.title }));
      const grid = u.el("div", { class: "grid grid-3" });
      p.projects.forEach((name) => {
        const pr = store.state.projects[name] || {};
        const done = !!pr.done;
        const card = u.el("div", { class: "card hover" }, [
          u.el("div", { class: "row between" }, [
            u.el("div", { class: "row", style: "gap:8px" }, [u.el("span", { text: "🛠️" }), u.el("strong", { text: name })]),
            done ? u.el("span", { class: "chip green", text: "✓ Done" }) : null
          ]),
          pr.notes ? u.el("div", { class: "faint mt", style: "font-size:12.5px", text: pr.notes }) : null,
          u.el("div", { class: "row wrap mt", style: "gap:8px" }, [
            u.el("button", { class: "btn btn-sm " + (done ? "btn-success" : "btn-primary"), onclick: () => { store.toggleProject(name); WM.router.reload(); } }, done ? "Completed" : "Mark complete"),
            u.el("button", { class: "btn btn-sm", onclick: () => noteModal(name, pr.notes || "") }, "📝 Notes")
          ])
        ]);
        grid.appendChild(card);
      });
      root.appendChild(grid);
    });
  };

  function noteModal(name, current) {
    const u = WM.util, store = WM.store;
    const ta = u.el("textarea", { placeholder: "What did you build? What did you learn? Link to your repo or file…" });
    ta.value = current;
    u.modal({
      title: name,
      body: u.el("div", {}, [u.el("label", { class: "field" }, [u.el("span", { text: "Project notes & build log" }), ta])]),
      actions: [{ label: "Cancel" }, { label: "Save", primary: true, onClick: () => { store.setProjectNote(name, ta.value); u.toast("Saved", "success"); WM.router.reload(); } }]
    });
  }

  // ---------------- Interactive tools ----------------
  function renderTools(root) {
    const u = WM.util;
    const grid = u.el("div", { class: "grid grid-2" });
    grid.appendChild(toolCompound());
    grid.appendChild(toolSIP());
    grid.appendChild(toolEMI());
    grid.appendChild(toolRetirement());
    root.appendChild(grid);
    root.appendChild(toolMonteCarlo());
  }

  function fld(label, id, value, suffix) {
    const u = WM.util;
    return u.el("label", { class: "field" }, [
      u.el("span", { text: label }),
      u.el("div", { class: "row", style: "gap:8px" }, [
        u.el("input", { type: "number", id: id, value: String(value), step: "any" }),
        suffix ? u.el("span", { class: "muted", text: suffix }) : null
      ])
    ]);
  }
  function val(id) { return parseFloat(document.getElementById(id).value) || 0; }
  function inr(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }

  function toolCompound() {
    const u = WM.util;
    const card = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", html: "💰 Compound Interest Calculator" })]);
    const out = u.el("div", { class: "mt" });
    const form = u.el("div", { class: "mt" }, [
      fld("Principal", "ci-p", 100000, "₹"),
      fld("Annual rate", "ci-r", 12, "%"),
      fld("Years", "ci-y", 10, "yrs"),
      fld("Compounds / year", "ci-n", 12, "")
    ]);
    function calc() {
      const P = val("ci-p"), r = val("ci-r") / 100, t = val("ci-y"), n = val("ci-n") || 1;
      const A = P * Math.pow(1 + r / n, n * t);
      const series = [];
      for (let y = 0; y <= t; y++) series.push({ label: y % Math.ceil(t / 6 || 1) === 0 ? String(y) : "", value: Math.round(P * Math.pow(1 + r / n, n * y)) });
      out.innerHTML = "";
      out.appendChild(u.el("div", { class: "row between" }, [u.el("span", { class: "muted", text: "Future value" }), u.el("strong", { style: "font-size:22px;color:" + u.COLORS.completed, text: inr(A) })]));
      out.appendChild(u.el("div", { class: "row between mt" }, [u.el("span", { class: "muted", text: "Total interest" }), u.el("strong", { text: inr(A - P) })]));
      out.appendChild(u.el("div", { class: "mt" }, [WM.charts.line(series, { height: 150 })]));
    }
    form.querySelectorAll("input").forEach((i) => i.addEventListener("input", calc));
    card.appendChild(form); card.appendChild(out); setTimeout(calc, 0);
    return card;
  }

  function toolSIP() {
    const u = WM.util;
    const card = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", html: "📈 SIP Calculator" })]);
    const out = u.el("div", { class: "mt" });
    const form = u.el("div", { class: "mt" }, [fld("Monthly investment", "sip-m", 10000, "₹"), fld("Expected return", "sip-r", 12, "%"), fld("Years", "sip-y", 15, "yrs")]);
    function calc() {
      const M = val("sip-m"), r = val("sip-r") / 100 / 12, n = val("sip-y") * 12;
      const fv = r ? M * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : M * n;
      const invested = M * n;
      out.innerHTML = "";
      out.appendChild(u.el("div", { class: "row between" }, [u.el("span", { class: "muted", text: "Maturity value" }), u.el("strong", { style: "font-size:22px;color:" + u.COLORS.completed, text: inr(fv) })]));
      out.appendChild(u.el("div", { class: "row between mt" }, [u.el("span", { class: "muted", text: "Invested" }), u.el("strong", { text: inr(invested) })]));
      out.appendChild(u.el("div", { class: "row between mt" }, [u.el("span", { class: "muted", text: "Gains" }), u.el("strong", { style: "color:" + u.COLORS.learning, text: inr(fv - invested) })]));
    }
    form.querySelectorAll("input").forEach((i) => i.addEventListener("input", calc));
    card.appendChild(form); card.appendChild(out); setTimeout(calc, 0);
    return card;
  }

  function toolEMI() {
    const u = WM.util;
    const card = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", html: "🏦 EMI Calculator" })]);
    const out = u.el("div", { class: "mt" });
    const form = u.el("div", { class: "mt" }, [fld("Loan amount", "emi-p", 2000000, "₹"), fld("Interest rate", "emi-r", 9, "%"), fld("Tenure", "emi-y", 20, "yrs")]);
    function calc() {
      const P = val("emi-p"), r = val("emi-r") / 100 / 12, n = val("emi-y") * 12;
      const emi = r ? P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : P / n;
      const total = emi * n;
      out.innerHTML = "";
      out.appendChild(u.el("div", { class: "row between" }, [u.el("span", { class: "muted", text: "Monthly EMI" }), u.el("strong", { style: "font-size:22px;color:" + u.COLORS.current, text: inr(emi) })]));
      out.appendChild(u.el("div", { class: "row between mt" }, [u.el("span", { class: "muted", text: "Total payable" }), u.el("strong", { text: inr(total) })]));
      out.appendChild(u.el("div", { class: "row between mt" }, [u.el("span", { class: "muted", text: "Total interest" }), u.el("strong", { style: "color:" + u.COLORS.prereq, text: inr(total - P) })]));
    }
    form.querySelectorAll("input").forEach((i) => i.addEventListener("input", calc));
    card.appendChild(form); card.appendChild(out); setTimeout(calc, 0);
    return card;
  }

  function toolRetirement() {
    const u = WM.util;
    const card = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", html: "🏖️ Retirement Calculator" })]);
    const out = u.el("div", { class: "mt" });
    const form = u.el("div", { class: "mt" }, [fld("Current age", "ret-a", 30, "yrs"), fld("Retirement age", "ret-ra", 60, "yrs"), fld("Monthly expense (today)", "ret-e", 50000, "₹"), fld("Inflation", "ret-i", 6, "%"), fld("Post-retirement return", "ret-r", 8, "%"), fld("Years in retirement", "ret-n", 25, "yrs")]);
    function calc() {
      const yrs = val("ret-ra") - val("ret-a");
      const futExp = val("ret-e") * 12 * Math.pow(1 + val("ret-i") / 100, yrs);
      const realR = (1 + val("ret-r") / 100) / (1 + val("ret-i") / 100) - 1;
      const n = val("ret-n");
      const corpus = realR ? futExp * (1 - Math.pow(1 + realR, -n)) / realR : futExp * n;
      out.innerHTML = "";
      out.appendChild(u.el("div", { class: "row between" }, [u.el("span", { class: "muted", text: "Corpus needed at retirement" }), u.el("strong", { style: "font-size:20px;color:" + u.COLORS.project, text: inr(corpus) })]));
      out.appendChild(u.el("div", { class: "row between mt" }, [u.el("span", { class: "muted", text: "1st-year annual expense then" }), u.el("strong", { text: inr(futExp) })]));
    }
    form.querySelectorAll("input").forEach((i) => i.addEventListener("input", calc));
    card.appendChild(form); card.appendChild(out); setTimeout(calc, 0);
    return card;
  }

  function toolMonteCarlo() {
    const u = WM.util;
    const card = u.el("div", { class: "card mt" }, [u.el("div", { class: "card-title", html: "🎲 Monte Carlo Portfolio Simulator" })]);
    const out = u.el("div", { class: "mt" });
    const form = u.el("div", { class: "grid grid-4 mt" }, [fld("Initial", "mc-p", 1000000, "₹"), fld("Mean return", "mc-r", 10, "%"), fld("Volatility", "mc-v", 15, "%"), fld("Years", "mc-y", 20, "yrs")]);
    function gauss() { let u1 = Math.random(), u2 = Math.random(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }
    function calc() {
      const P = val("mc-p"), mu = val("mc-r") / 100, sig = val("mc-v") / 100, Y = val("mc-y");
      const runs = 500, results = [];
      for (let i = 0; i < runs; i++) {
        let v = P;
        for (let y = 0; y < Y; y++) v *= (1 + mu + sig * gauss());
        results.push(v);
      }
      results.sort((a, b) => a - b);
      const pctl = (q) => results[Math.floor(q * runs)];
      out.innerHTML = "";
      out.appendChild(u.el("div", { class: "grid grid-3" }, [
        miniStat("Pessimistic (10th)", inr(pctl(0.1)), u.COLORS.prereq),
        miniStat("Median (50th)", inr(pctl(0.5)), u.COLORS.learning),
        miniStat("Optimistic (90th)", inr(pctl(0.9)), u.COLORS.completed)
      ]));
      out.appendChild(u.el("div", { class: "faint mt", style: "font-size:12px", text: runs + " simulated paths · geometric random walk. This illustrates the range of outcomes, not a prediction." }));
    }
    function miniStat(label, value, color) { return u.el("div", { class: "card" }, [u.el("div", { class: "stat-label", text: label }), u.el("div", { style: "font-weight:800;font-size:18px;margin-top:4px;color:" + color, text: value })]); }
    form.querySelectorAll("input").forEach((i) => i.addEventListener("input", calc));
    const btn = u.el("button", { class: "btn btn-primary mt", onclick: calc }, "🎲 Re-run simulation");
    card.appendChild(form); card.appendChild(btn); card.appendChild(out); setTimeout(calc, 0);
    return card;
  }
})();
