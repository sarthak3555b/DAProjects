/* ============================================================
   Wealth Mastery OS — Journal view (daily reflective prompts)
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};
  let filterTag = "", search = "";

  const PROMPTS = [
    { key: "learned", label: "What did you learn?" },
    { key: "confused", label: "What confused you?" },
    { key: "built", label: "What did you build?" },
    { key: "observed", label: "What did you observe?" },
    { key: "apply", label: "How will you apply it?" },
    { key: "questions", label: "What questions remain?" }
  ];

  WM.views.journal = function (root) {
    const u = WM.util, store = WM.store;
    root.classList.remove("no-pad");
    root.innerHTML = "";

    root.appendChild(u.el("div", { class: "page-head" }, [
      u.el("div", {}, [
        u.el("div", { class: "eyebrow", text: "Reflect · Implement · Review" }),
        u.el("h1", { class: "page-title", text: "Learning Journal" }),
        u.el("div", { class: "page-sub", text: "Daily reflection turns information into judgement. Markdown supported. Entries with minutes feed your streak." })
      ]),
      u.el("button", { class: "btn btn-primary", onclick: () => entryModal() }, "＋ New entry")
    ]));

    // search + tags
    const tags = Array.from(new Set(store.state.journal.flatMap((e) => e.tags || [])));
    const controls = u.el("div", { class: "row wrap", style: "gap:8px;margin-bottom:16px" }, [
      u.el("input", { type: "text", placeholder: "Search journal…", value: search, oninput: u.debounce((e) => { search = e.target.value; rerender(); }, 150), style: "max-width:320px" }),
      ...tags.map((t) => u.el("button", { class: "chip" + (filterTag === t ? " blue" : ""), style: "cursor:pointer", onclick: () => { filterTag = filterTag === t ? "" : t; rerender(); } }, "#" + t))
    ]);
    root.appendChild(controls);

    const listWrap = u.el("div");
    root.appendChild(listWrap);

    function rerender() {
      listWrap.innerHTML = "";
      const q = search.trim().toLowerCase();
      let entries = store.state.journal.filter((e) => {
        if (filterTag && !(e.tags || []).includes(filterTag)) return false;
        if (q) { const hay = [e.body, e.learned, e.confused, e.built, e.observed, e.apply, e.questions, (e.tags || []).join(" ")].join(" ").toLowerCase(); if (!hay.includes(q)) return false; }
        return true;
      });
      if (!entries.length) {
        listWrap.appendChild(u.el("div", { class: "empty", html: "<div class='big'>📓</div>No journal entries yet. Capture today's learning to start your streak." }));
        return;
      }
      entries.forEach((e) => {
        const card = u.el("div", { class: "card mt" }, [
          u.el("div", { class: "row between" }, [
            u.el("strong", { text: u.fmt.date(e.date || e.createdAt) }),
            u.el("div", { class: "row", style: "gap:6px" }, [
              e.minutes ? u.el("span", { class: "chip orange", text: e.minutes + "m" }) : null,
              u.el("button", { class: "btn btn-sm", onclick: () => entryModal(e) }, "Edit"),
              u.el("button", { class: "btn btn-sm", onclick: () => { if (confirm("Delete this entry?")) { store.deleteJournal(e.id); rerender(); } } }, "🗑")
            ])
          ])
        ]);
        PROMPTS.forEach((p) => {
          if (e[p.key]) card.appendChild(u.el("div", { class: "mt" }, [
            u.el("div", { style: "font-size:11px;color:" + u.COLORS.learning + ";font-weight:700", text: p.label }),
            u.el("div", { class: "muted", style: "font-size:13.5px;line-height:1.55;margin-top:2px", html: u.md(e[p.key]) })
          ]));
        });
        if (e.body && !PROMPTS.some((p) => e[p.key])) card.appendChild(u.el("div", { class: "muted mt", html: u.md(e.body) }));
        if ((e.tags || []).length) card.appendChild(u.el("div", { class: "row wrap mt", style: "gap:6px" }, e.tags.map((t) => u.el("span", { class: "chip", text: "#" + t }))));
        listWrap.appendChild(card);
      });
    }
    rerender();
  };

  function entryModal(existing) {
    const u = WM.util, store = WM.store;
    const e = existing || {};
    const body = u.el("div");
    const inputs = {};
    body.appendChild(u.el("div", { class: "row", style: "gap:8px" }, [
      u.el("label", { class: "field", style: "flex:1" }, [u.el("span", { text: "Date" }), inputs.date = u.el("input", { type: "text", value: e.date || u.todayKey() })]),
      u.el("label", { class: "field", style: "flex:1" }, [u.el("span", { text: "Minutes studied" }), inputs.minutes = u.el("input", { type: "number", value: String(e.minutes || 0) })])
    ]));
    PROMPTS.forEach((p) => {
      const ta = u.el("textarea", { placeholder: "…" }); ta.value = e[p.key] || "";
      inputs[p.key] = ta;
      body.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: p.label }), ta]));
    });
    inputs.tags = u.el("input", { type: "text", placeholder: "comma,separated,tags", value: (e.tags || []).join(", ") });
    body.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Tags" }), inputs.tags]));

    u.modal({
      title: existing ? "Edit entry" : "New journal entry", body: body, actions: [{ label: "Cancel" }, { label: "Save", primary: true, onClick: () => {
        const data = { date: inputs.date.value || u.todayKey(), minutes: parseInt(inputs.minutes.value, 10) || 0, tags: inputs.tags.value.split(",").map((t) => t.trim()).filter(Boolean) };
        PROMPTS.forEach((p) => data[p.key] = inputs[p.key].value.trim());
        data.body = data.learned || "";
        if (existing) { store.updateJournal(existing.id, data); }
        else store.addJournal(data);
        u.toast("Saved", "success"); WM.router.reload();
      } }]
    });
  }
})();
