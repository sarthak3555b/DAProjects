/* ============================================================
   Wealth Mastery OS — Settings + Admin CMS + Data management
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};

  WM.views.settings = function (root) {
    const u = WM.util, store = WM.store;
    root.classList.remove("no-pad");
    root.innerHTML = "";
    const st = store.state.settings;

    root.appendChild(u.el("div", { class: "page-head" }, [u.el("div", {}, [u.el("div", { class: "eyebrow", text: "Configure your OS" }), u.el("h1", { class: "page-title", text: "Settings" })])]));

    const grid = u.el("div", { class: "grid grid-2" });

    // Profile
    const profile = sectionCard("👤 Profile");
    const nameIn = u.el("input", { type: "text", value: store.state.profile.name, oninput: u.debounce((e) => store.setProfile({ name: e.target.value }), 400) });
    profile.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Display name" }), nameIn]));
    profile.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Started learning on" }), u.el("input", { type: "text", value: u.fmt.date(store.state.profile.startedAt), disabled: true })]));
    grid.appendChild(profile);

    // Goals
    const goals = sectionCard("🎯 Goals (hours)");
    [["weekly", "Weekly", 1], ["monthly", "Monthly", 4], ["yearly", "Yearly", 50]].forEach(([k, label]) => {
      const inp = u.el("input", { type: "number", value: String((store.state.goals[k] || 0) / 60), step: "any", oninput: u.debounce((e) => store.setGoal(k, (parseFloat(e.target.value) || 0) * 60), 400) });
      goals.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: label + " study goal (hours)" }), inp]));
    });
    const booksIn = u.el("input", { type: "number", value: String(store.state.booksCompleted || 0), oninput: u.debounce((e) => store.setBooks(parseInt(e.target.value, 10) || 0), 400) });
    goals.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Books completed (lifetime)" }), booksIn]));
    grid.appendChild(goals);

    // Appearance / behavior
    const appearance = sectionCard("✨ Appearance & behaviour");
    appearance.appendChild(toggleRow("Reduce motion", st.reducedMotion, (v) => { store.setSetting("reducedMotion", v); document.body.classList.toggle("reduce-motion", v); }));
    appearance.appendChild(toggleRow("Notifications", st.notifications, (v) => store.setSetting("notifications", v)));
    appearance.appendChild(toggleRow("Auto-track current node hours on completion", st.autoCurrent, (v) => store.setSetting("autoCurrent", v)));
    grid.appendChild(appearance);

    // AI Mentor
    const ai = sectionCard("🧠 AI Mentor");
    ai.appendChild(u.el("div", { class: "muted", style: "font-size:13px;line-height:1.5;margin-bottom:10px", text: "The built-in mentor always works offline. Optionally connect an external provider. Your API key is stored only in this browser and never sent anywhere except the provider you choose." }));
    ai.appendChild(toggleRow("Enable external AI provider", st.aiEnabled, (v) => { store.setSetting("aiEnabled", v); WM.router.reload(); }));
    if (st.aiEnabled) {
      const prov = u.el("select", { onchange: (e) => store.setSetting("aiProvider", e.target.value) });
      [["local", "Built-in (offline)"], ["openai", "OpenAI"], ["anthropic", "Anthropic"]].forEach(([v, t]) => { const o = u.el("option", { value: v, text: t }); if (st.aiProvider === v) o.selected = true; prov.appendChild(o); });
      ai.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Provider" }), prov]));
      ai.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Model (optional)" }), u.el("input", { type: "text", value: st.aiModel || "", placeholder: "gpt-4o-mini / claude-3-5-sonnet-latest", oninput: u.debounce((e) => store.setSetting("aiModel", e.target.value), 400) })]));
      ai.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "API key (stored locally only)" }), u.el("input", { type: "text", value: st.aiKey || "", placeholder: "sk-…", oninput: u.debounce((e) => store.setSetting("aiKey", e.target.value), 400) })]));
    }
    grid.appendChild(ai);

    root.appendChild(grid);

    // Admin CMS
    root.appendChild(u.el("h2", { class: "section-title", text: "🛠️ Admin CMS" }));
    const cms = u.el("div", { class: "grid grid-3" });
    cms.appendChild(cmsCard("📰", "Current Affairs", "Add news items with the 4-question framework.", () => location.hash = "#/affairs"));
    cms.appendChild(cmsCard("📚", "Add resource", "Add a book, course, video or article to the library.", addResource));
    cms.appendChild(cmsCard("🧩", "Curriculum", WM.curriculum.phaseCount + " phases · " + WM.curriculum.moduleCount + " modules · " + WM.curriculum.nodeCount + " nodes (data-driven).", () => location.hash = "#/roadmap"));
    root.appendChild(cms);

    // Data management
    root.appendChild(u.el("h2", { class: "section-title", text: "💾 Data management" }));
    const data = u.el("div", { class: "card" }, [
      u.el("div", { class: "muted", style: "font-size:13px;margin-bottom:12px", text: "All your data lives in this browser (localStorage). Export regularly to back up or move to another device." }),
      u.el("div", { class: "row wrap", style: "gap:8px" }, [
        u.el("button", { class: "btn btn-primary", onclick: exportData }, "⬇ Export my data"),
        u.el("button", { class: "btn", onclick: importData }, "⬆ Import data"),
        u.el("button", { class: "btn", onclick: () => { if (confirm("Reset all progress, projects and activity? Journal and settings are kept.")) { store.resetProgress(); u.toast("Progress reset"); WM.router.reload(); } } }, "Reset progress"),
        u.el("button", { class: "btn", style: "border-color:" + WM.roadmap.hexA(u.COLORS.prereq, 0.5) + ";color:#fca5a5", onclick: () => { if (confirm("Erase EVERYTHING and start fresh? This cannot be undone.")) { store.resetAll(); u.toast("All data cleared"); WM.router.reload(); } } }, "🗑 Reset everything")
      ])
    ]);
    root.appendChild(data);

    // About
    root.appendChild(u.el("div", { class: "card mt", style: "text-align:center" }, [
      u.el("div", { style: "font-family:var(--font-display);font-weight:800", text: "Wealth Mastery OS" }),
      u.el("div", { class: "faint", style: "font-size:12px;margin-top:4px", text: "Learn · Build · Observe · Reflect · Implement · Review · Repeat" }),
      u.el("div", { class: "faint", style: "font-size:12px;margin-top:8px", text: "v1.0 · Offline-first · Your data stays in your browser." })
    ]));

    function sectionCard(title) { const c = u.el("div", { class: "card" }, [u.el("div", { class: "card-title", text: title }), u.el("div", { style: "height:8px" })]); return c; }
    function toggleRow(label, on, onChange) {
      const t = u.el("div", { class: "toggle" + (on ? " on" : ""), role: "switch", "aria-checked": String(on), tabindex: "0" });
      const handler = () => { const nv = !t.classList.contains("on"); t.classList.toggle("on", nv); t.setAttribute("aria-checked", String(nv)); onChange(nv); };
      t.addEventListener("click", handler);
      t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler(); } });
      return u.el("div", { class: "row between", style: "padding:8px 0" }, [u.el("span", { style: "font-size:14px", text: label }), t]);
    }
    function cmsCard(emoji, title, desc, onClick) {
      return u.el("div", { class: "card hover", style: "cursor:pointer", onclick: onClick }, [
        u.el("div", { class: "row", style: "gap:10px" }, [u.el("span", { style: "font-size:24px", text: emoji }), u.el("strong", { text: title })]),
        u.el("div", { class: "muted mt", style: "font-size:13px;line-height:1.5", text: desc })
      ]);
    }
  };

  function addResource() {
    const u = WM.util;
    const body = u.el("div");
    const ins = {};
    body.appendChild(field("Title", ins, "title"));
    body.appendChild(field("Source / author", ins, "source"));
    const typeSel = u.el("select", {});
    WM.RESOURCE_TYPES.forEach((t) => typeSel.appendChild(u.el("option", { value: t, text: t })));
    body.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Type" }), typeSel]));
    const phaseSel = u.el("select", {});
    WM.PHASES.forEach((p) => phaseSel.appendChild(u.el("option", { value: p.code, text: "Phase " + p.code + " · " + p.title })));
    body.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Linked phase" }), phaseSel]));
    body.appendChild(field("URL", ins, "url"));
    body.appendChild(field("Note", ins, "note"));
    u.modal({
      title: "Add a resource", body: body, actions: [{ label: "Cancel" }, { label: "Add", primary: true, onClick: () => {
        const title = ins.title.value.trim();
        if (!title) { u.toast("Title required"); return; }
        WM.RESOURCES.unshift({ id: u.uid("res"), title, source: ins.source.value.trim(), type: typeSel.value, phase: phaseSel.value, url: ins.url.value.trim() || ("https://www.google.com/search?q=" + encodeURIComponent(title)), note: ins.note.value.trim() });
        WM.search.build();
        u.toast("Resource added", "success"); location.hash = "#/resources";
      } }]
    });
    function field(label, store, key) { const i = u.el("input", { type: "text" }); store[key] = i; return u.el("label", { class: "field" }, [u.el("span", { text: label }), i]); }
  }

  function exportData() {
    const blob = new Blob([WM.store.exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wealth-mastery-os-backup-" + WM.util.todayKey() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    WM.util.toast("Backup downloaded", "success");
  }
  function importData() {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "application/json";
    inp.onchange = () => {
      const file = inp.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { try { WM.store.importData(reader.result); WM.util.toast("Data imported", "success"); WM.router.reload(); } catch (e) { WM.util.toast("Invalid backup file"); } };
      reader.readAsText(file);
    };
    inp.click();
  }
})();
