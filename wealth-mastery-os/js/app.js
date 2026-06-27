/* ============================================================
   Wealth Mastery OS — App shell bootstrap
   Nav, global search, AI mentor drawer, notifications, boot.
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  const u = WM.util;

  const NAV = [
    { route: "dashboard", label: "Dashboard", icon: icoGrid() },
    { route: "roadmap", label: "Roadmap", icon: icoMap() },
    { route: "projects", label: "Projects", icon: icoTool() },
    { route: "resources", label: "Resources", icon: icoBook() },
    { route: "affairs", label: "Current Affairs", icon: icoNews() },
    { route: "journal", label: "Journal", icon: icoPen() },
    { route: "analytics", label: "Progress Analytics", icon: icoChart() },
    { route: "career", label: "Career Explorer", icon: icoBriefcase() },
    { route: "settings", label: "Settings", icon: icoGear() }
  ];

  function buildNav() {
    const nav = document.getElementById("main-nav");
    nav.innerHTML = "";
    NAV.forEach((item) => {
      const badge = navBadge(item.route);
      const btn = u.el("button", { class: "nav-item", dataset: { route: item.route }, onclick: () => location.hash = "#/" + item.route }, [
        u.el("span", { class: "nav-ico", html: item.icon }),
        u.el("span", { text: item.label }),
        badge ? u.el("span", { class: "nav-badge", text: badge }) : null
      ]);
      nav.appendChild(btn);
    });
  }
  function navBadge(route) {
    const store = WM.store;
    if (route === "roadmap") return WM.curriculum.nodeCount;
    if (route === "projects") { let n = 0; WM.PHASES.forEach((p) => n += p.projects.length); return n; }
    if (route === "resources") return WM.RESOURCES.length;
    if (route === "affairs") return WM.NEWS.length;
    if (route === "journal") return store.state.journal.length || "";
    if (route === "career") return WM.CAREERS.length;
    return "";
  }

  function refreshSidebar() {
    const p = WM.store.progress();
    const sc = document.getElementById("streak-count");
    if (sc) sc.textContent = p.streak;
  }

  // ---------- Global search ----------
  function initSearch() {
    const input = document.getElementById("global-search");
    const overlay = document.getElementById("search-overlay");
    const results = document.getElementById("search-results");
    let sel = -1, items = [];

    const run = u.debounce(() => {
      const q = input.value.trim();
      if (!q) { overlay.hidden = true; return; }
      items = WM.search.search(q, 40);
      renderResults();
      overlay.hidden = false;
    }, 110);

    function renderResults() {
      results.innerHTML = "";
      if (!items.length) { results.appendChild(u.el("div", { class: "empty", style: "padding:30px", text: "No results for “" + input.value + "”" })); return; }
      const groups = {};
      items.forEach((it) => { (groups[it.type] = groups[it.type] || []).push(it); });
      const order = ["phase", "module", "node", "career", "resource", "news"];
      const labels = { phase: "Phases", module: "Modules", node: "Nodes", career: "Careers", resource: "Resources", news: "Current Affairs" };
      let flat = [];
      order.forEach((type) => {
        if (!groups[type]) return;
        results.appendChild(u.el("div", { class: "search-cat", text: labels[type] }));
        groups[type].forEach((it) => {
          const row = u.el("div", { class: "search-row", dataset: { idx: String(flat.length) }, onclick: () => activate(it) }, [
            u.el("div", { class: "sr-ico", html: iconFor(it.type) }),
            u.el("div", { style: "flex:1;min-width:0" }, [u.el("div", { class: "sr-title", text: it.title }), u.el("div", { class: "sr-sub", text: it.sub })])
          ]);
          results.appendChild(row);
          flat.push({ it, row });
        });
      });
      items._flat = flat; sel = -1;
    }
    function activate(it) {
      overlay.hidden = true; input.value = ""; input.blur();
      if (it.type === "resource" && it.url) { window.open(it.url, "_blank", "noopener"); return; }
      if (it.route === "node") location.hash = "#/node/" + it.ref;
      else if (it.route === "roadmap") location.hash = "#/roadmap/" + it.ref;
      else if (it.route === "career") location.hash = "#/career/" + it.ref;
      else location.hash = "#/" + it.route;
    }

    input.addEventListener("input", run);
    input.addEventListener("focus", () => { if (input.value.trim()) { run(); } });
    input.addEventListener("keydown", (e) => {
      const flat = items._flat || [];
      if (e.key === "Escape") { overlay.hidden = true; input.blur(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(flat.length - 1, sel + 1); paint(flat); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); paint(flat); }
      else if (e.key === "Enter") { if (flat[sel]) activate(flat[sel].it); else if (flat[0]) activate(flat[0].it); }
    });
    function paint(flat) { flat.forEach((f, i) => { f.row.classList.toggle("sel", i === sel); if (i === sel) f.row.scrollIntoView({ block: "nearest" }); }); }

    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.hidden = true; });
    // global "/" shortcut
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
  }

  // ---------- AI Mentor drawer ----------
  function initMentor() {
    const drawer = document.getElementById("mentor-drawer");
    const scrim = document.getElementById("drawer-scrim");
    const bodyEl = document.getElementById("mentor-body");
    const form = document.getElementById("mentor-form");
    const inputEl = document.getElementById("mentor-input");

    function open(prefill) {
      drawer.hidden = false; scrim.hidden = false;
      renderChat();
      if (WM.store.state.mentor.length === 0) {
        addMsg("ai", WM.mentor.greeting());
        renderChat();
      }
      if (prefill) { inputEl.value = prefill; }
      setTimeout(() => inputEl.focus(), 50);
    }
    function close() { drawer.hidden = true; scrim.hidden = true; }
    function addMsg(role, text) { WM.store.addMentorMsg(role, text); }

    function renderChat() {
      bodyEl.innerHTML = "";
      const hist = WM.store.state.mentor;
      if (!hist.length) bodyEl.appendChild(u.el("div", { class: "mentor-msg ai", html: u.md(WM.mentor.greeting()) }));
      hist.forEach((m) => bodyEl.appendChild(u.el("div", { class: "mentor-msg " + (m.role === "me" ? "me" : "ai"), html: u.md(m.text) })));
      // quick prompts
      const chips = u.el("div", { class: "mentor-chips" });
      WM.mentor.DAILY_PROMPTS.forEach((q) => chips.appendChild(u.el("span", { class: "chip", onclick: () => { inputEl.value = q; submit(q); } }, q)));
      bodyEl.appendChild(chips);
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }

    async function submit(text) {
      text = (text || inputEl.value).trim();
      if (!text) return;
      addMsg("me", text);
      inputEl.value = "";
      renderChat();
      const thinking = u.el("div", { class: "mentor-msg ai", text: "…" });
      bodyEl.insertBefore(thinking, bodyEl.querySelector(".mentor-chips"));
      bodyEl.scrollTop = bodyEl.scrollHeight;
      try {
        const reply = await WM.mentor.send(text);
        addMsg("ai", reply);
      } catch (e) { addMsg("ai", "Sorry, I hit a snag. Let's try again."); }
      renderChat();
    }

    form.addEventListener("submit", (e) => { e.preventDefault(); submit(); });
    document.getElementById("mentor-btn").addEventListener("click", () => open());
    document.getElementById("mentor-close").addEventListener("click", close);
    scrim.addEventListener("click", close);
    WM.app = WM.app || {};
    WM.app.openMentor = open;
  }

  // ---------- Notifications ----------
  function initNotifications() {
    const btn = document.getElementById("notif-btn");
    const pop = document.getElementById("notif-popover");
    const dot = document.getElementById("notif-dot");

    function build() {
      const notifs = [];
      const p = WM.store.progress();
      const due = WM.mentor.reviewDue();
      if (due.length) notifs.push({ ico: "🔁", text: due.length + " node(s) due for spaced-repetition review.", action: () => location.hash = "#/node/" + due[0].slug });
      if (p.streak === 0) notifs.push({ ico: "🔥", text: "No streak yet today — log a session to keep momentum.", action: () => location.hash = "#/journal" });
      if (p.currentNode) notifs.push({ ico: "📘", text: "Continue: " + p.currentNode.title, action: () => location.hash = "#/node/" + p.currentNode.slug });
      const newUnread = WM.NEWS.filter((n) => !WM.store.state.news.read[n.id]).length;
      if (newUnread) notifs.push({ ico: "📰", text: newUnread + " current-affairs item(s) unread.", action: () => location.hash = "#/affairs" });
      dot.hidden = notifs.length === 0;
      return notifs;
    }

    btn.addEventListener("click", () => {
      if (!pop.hidden) { pop.hidden = true; return; }
      const notifs = build();
      pop.innerHTML = "";
      pop.appendChild(u.el("div", { class: "popover-head", text: "Notifications" }));
      if (!notifs.length) pop.appendChild(u.el("div", { class: "notif-item faint", text: "You're all caught up ✨" }));
      notifs.forEach((n) => pop.appendChild(u.el("div", { class: "notif-item", style: "cursor:pointer", onclick: () => { pop.hidden = true; n.action(); } }, [u.el("span", { class: "ni-ico", text: n.ico }), u.el("span", { text: n.text })])));
      pop.hidden = false;
    });
    document.addEventListener("click", (e) => { if (!pop.hidden && !pop.contains(e.target) && e.target !== btn && !btn.contains(e.target)) pop.hidden = true; });
    WM.app.refreshNotifications = build;
  }

  // ---------- Mobile sidebar ----------
  function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const scrim = document.getElementById("sidebar-scrim");
    document.getElementById("menu-toggle").addEventListener("click", () => { const open = !sidebar.classList.contains("open"); sidebar.classList.toggle("open", open); scrim.hidden = !open; });
    scrim.addEventListener("click", () => { sidebar.classList.remove("open"); scrim.hidden = true; });
    document.querySelector(".brand").addEventListener("click", () => location.hash = "#/dashboard");
    document.querySelector(".brand").addEventListener("keydown", (e) => { if (e.key === "Enter") location.hash = "#/dashboard"; });
  }

  // ---------- Boot ----------
  function boot() {
    buildNav();
    initSidebar();
    initSearch();
    initMentor();
    initNotifications();
    WM.search.build();

    if (WM.store.state.settings.reducedMotion) document.body.classList.add("reduce-motion");

    // re-render reactive bits on store change
    WM.store.subscribe(() => { refreshSidebar(); buildNav(); if (WM.app.refreshNotifications) WM.app.refreshNotifications(); });
    refreshSidebar();

    if (!location.hash) location.hash = "#/dashboard";
    WM.router.render();

    // reveal app
    const loading = document.getElementById("app-loading");
    const app = document.getElementById("app");
    app.hidden = false;
    setTimeout(() => { loading.style.opacity = "0"; setTimeout(() => loading.remove(), 400); }, 350);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // ---------- Inline icons ----------
  function icoGrid() { return '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7" fill="none"/></svg>'; }
  function icoMap() { return '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M9 3v15M15 6v15" stroke="currentColor" stroke-width="1.6"/></svg>'; }
  function icoTool() { return '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M14 7a4 4 0 015 5l-9 9-3-3 9-9z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>'; }
  function icoBook() { return '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>'; }
  function icoNews() { return '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M7 9h6M7 13h10M7 16h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'; }
  function icoPen() { return '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>'; }
  function icoChart() { return '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'; }
  function icoBriefcase() { return '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>'; }
  function icoGear() { return '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'; }

  WM.app = WM.app || {};
})();
