/* ============================================================
   Wealth Mastery OS — Current Affairs Engine view
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  WM.views = WM.views || {};
  let activeCat = "All";

  WM.views.affairs = function (root) {
    const u = WM.util, store = WM.store;
    root.classList.remove("no-pad");
    root.innerHTML = "";

    root.appendChild(u.el("div", { class: "page-head" }, [
      u.el("div", {}, [
        u.el("div", { class: "eyebrow", text: "Connect theory to the real world" }),
        u.el("h1", { class: "page-title", text: "Current Affairs Engine" }),
        u.el("div", { class: "page-sub", text: "Every item answers four questions: What happened? Why did it happen? Why does it matter? How does it affect wealth creation?" })
      ]),
      u.el("button", { class: "btn btn-primary", onclick: addNews }, "＋ Add item")
    ]));

    const cats = ["All", ...WM.NEWS_CATEGORIES];
    const filterRow = u.el("div", { class: "row wrap", style: "gap:6px;margin-bottom:16px" });
    cats.forEach((c) => filterRow.appendChild(u.el("button", { class: "chip" + (activeCat === c ? " blue" : ""), style: "cursor:pointer", onclick: () => { activeCat = c; WM.router.reload(); } }, c)));
    root.appendChild(filterRow);

    const items = WM.NEWS.filter((n) => activeCat === "All" || n.category === activeCat).sort((a, b) => (a.date < b.date ? 1 : -1));
    if (!items.length) { root.appendChild(u.el("div", { class: "empty", html: "<div class='big'>📰</div>No items in this category yet." })); return; }

    const grid = u.el("div", { class: "grid grid-2" });
    items.forEach((n) => {
      const read = store.state.news.read[n.id];
      const bk = store.state.news.bookmarked[n.id];
      const card = u.el("div", { class: "card hover" }, [
        u.el("div", { class: "row between" }, [
          u.el("span", { class: "chip " + catColor(n.category), text: n.category }),
          u.el("span", { class: "faint", style: "font-size:12px", text: u.fmt.date(n.date) })
        ]),
        u.el("h3", { style: "font-size:17px;margin-top:10px", text: n.title }),
        qa("What happened?", n.what),
        qa("Why did it happen?", n.why),
        qa("Why does it matter?", n.matters),
        qa("How it affects wealth", n.wealth, true),
        u.el("div", { class: "row wrap mt", style: "gap:6px" }, [
          u.el("button", { class: "btn btn-sm " + (read ? "btn-success" : ""), onclick: () => { store.toggleNewsRead(n.id); WM.router.reload(); } }, read ? "✓ Read" : "Mark read"),
          u.el("button", { class: "btn btn-sm", onclick: () => { store.toggleNewsBookmark(n.id); WM.router.reload(); } }, bk ? "★ Saved" : "☆ Save"),
          u.el("button", { class: "btn btn-sm", onclick: () => noteModal(n) }, "📝 Note"),
          ...(n.tags || []).map((t) => u.el("span", { class: "chip", text: "#" + t }))
        ]),
        store.state.news.notes[n.id] ? u.el("div", { class: "muted mt", style: "font-size:13px;border-left:2px solid var(--learning);padding-left:10px", text: store.state.news.notes[n.id] }) : null
      ]);
      grid.appendChild(card);
    });
    root.appendChild(grid);

    function qa(label, text, highlight) {
      return u.el("div", { class: "mt" }, [
        u.el("div", { style: "font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:" + (highlight ? u.COLORS.completed : u.COLORS.learning) + ";font-weight:700", text: label }),
        u.el("div", { class: "muted", style: "font-size:13.5px;line-height:1.55;margin-top:3px", text: text })
      ]);
    }
  };

  function catColor(c) { return ({ Economy: "blue", Business: "orange", Markets: "green", Technology: "purple", Geopolitics: "red" })[c] || "blue"; }

  function noteModal(n) {
    const u = WM.util, store = WM.store;
    const ta = u.el("textarea", { placeholder: "Your take, connections to the roadmap, investment implications…" });
    ta.value = store.state.news.notes[n.id] || "";
    u.modal({ title: n.title, body: u.el("label", { class: "field" }, [u.el("span", { text: "Your notes" }), ta]), actions: [{ label: "Cancel" }, { label: "Save", primary: true, onClick: () => { store.setNewsNote(n.id, ta.value); WM.router.reload(); } }] });
  }

  function addNews() {
    const u = WM.util;
    const f = {};
    const body = u.el("div");
    body.appendChild(field("Title", "n-title"));
    const catSel = u.el("select", { id: "n-cat" });
    WM.NEWS_CATEGORIES.forEach((c) => catSel.appendChild(u.el("option", { value: c, text: c })));
    body.appendChild(u.el("label", { class: "field" }, [u.el("span", { text: "Category" }), catSel]));
    body.appendChild(field("What happened?", "n-what", true));
    body.appendChild(field("Why did it happen?", "n-why", true));
    body.appendChild(field("Why does it matter?", "n-matters", true));
    body.appendChild(field("How it affects wealth creation?", "n-wealth", true));
    u.modal({
      title: "Add a current-affairs item", body: body, actions: [{ label: "Cancel" }, { label: "Add item", primary: true, onClick: () => {
        const get = (id) => (document.getElementById(id).value || "").trim();
        const title = get("n-title");
        if (!title) { u.toast("Title required"); return; }
        WM.NEWS.unshift({ id: u.uid("news"), category: catSel.value, date: u.todayKey(), tags: [], title, what: get("n-what"), why: get("n-why"), matters: get("n-matters"), wealth: get("n-wealth") });
        u.toast("Added", "success"); WM.router.reload();
      } }]
    });
    function field(label, id, area) {
      return u.el("label", { class: "field" }, [u.el("span", { text: label }), area ? u.el("textarea", { id }) : u.el("input", { type: "text", id })]);
    }
  }
})();
