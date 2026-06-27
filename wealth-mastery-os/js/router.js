/* ============================================================
   Wealth Mastery OS — Hash router
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});

  const ROUTES = {
    dashboard: { view: "dashboard", nav: "dashboard", title: "Dashboard" },
    roadmap: { view: "roadmap", nav: "roadmap", title: "Roadmap" },
    node: { view: "node", nav: "roadmap", title: "Node" },
    projects: { view: "projects", nav: "projects", title: "Projects" },
    resources: { view: "resources", nav: "resources", title: "Resources" },
    affairs: { view: "affairs", nav: "affairs", title: "Current Affairs" },
    journal: { view: "journal", nav: "journal", title: "Journal" },
    analytics: { view: "analytics", nav: "analytics", title: "Analytics" },
    career: { view: "career", nav: "career", title: "Career Explorer" },
    settings: { view: "settings", nav: "settings", title: "Settings" }
  };

  let current = null;

  function parse() {
    let hash = location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/").filter(Boolean);
    const name = parts[0] || "dashboard";
    return { name, param: parts.slice(1).join("/"), parts };
  }

  function render() {
    const { name, param } = parse();
    const route = ROUTES[name] || ROUTES.dashboard;

    // cleanup previous view if needed
    if (current && current.name === "roadmap" && name !== "roadmap" && WM.views.roadmap.cleanup) {
      WM.views.roadmap.cleanup();
    }

    const root = document.getElementById("view");
    root.classList.remove("no-pad");
    const fn = WM.views[route.view];
    try {
      if (fn) fn(root, param);
      else root.innerHTML = "<div class='empty'>View not found.</div>";
    } catch (e) {
      console.error("View error", e);
      root.innerHTML = "<div class='empty'><div class='big'>⚠️</div>Something went wrong rendering this page.<br><span class='faint'>" + WM.util.esc(e.message) + "</span></div>";
    }

    // active nav
    document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.route === route.nav));
    document.title = "Wealth Mastery OS · " + route.title;
    // close mobile sidebar
    document.getElementById("sidebar").classList.remove("open");
    const scrim = document.getElementById("sidebar-scrim"); if (scrim) scrim.hidden = true;
    root.focus({ preventScroll: true });
    current = { name, param };
  }

  function reload() { render(); }
  function go(path) { location.hash = "#/" + path; }

  WM.router = { render, reload, go, parse, ROUTES };
  window.addEventListener("hashchange", render);
})();
