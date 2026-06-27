/* ============================================================
   Wealth Mastery OS — State Store
   Single source of truth. Persisted to localStorage.
   Pub/sub drives re-rendering. All progress is derived here.
   ============================================================ */
(function () {
  "use strict";
  const WM = (window.WM = window.WM || {});
  const KEY = "wm-os-v1";

  const ACHIEVEMENTS = [
    { id: "first-step", emoji: "🌱", name: "First Step", desc: "Complete your first node", test: (s) => s.completedCount >= 1 },
    { id: "ten-nodes", emoji: "📚", name: "Scholar", desc: "Complete 10 nodes", test: (s) => s.completedCount >= 10 },
    { id: "fifty-nodes", emoji: "🎓", name: "Polymath", desc: "Complete 50 nodes", test: (s) => s.completedCount >= 50 },
    { id: "phase-done", emoji: "🏆", name: "Phase Conqueror", desc: "Finish an entire phase", test: (s) => s.phasesCompleted >= 1 },
    { id: "streak-7", emoji: "🔥", name: "Week Warrior", desc: "7-day learning streak", test: (s) => s.streak >= 7 },
    { id: "streak-30", emoji: "⚡", name: "Unstoppable", desc: "30-day learning streak", test: (s) => s.streak >= 30 },
    { id: "ten-hours", emoji: "⏱️", name: "Deep Worker", desc: "Log 10 hours of study", test: (s) => s.hours >= 10 },
    { id: "hundred-hours", emoji: "💪", name: "Centurion", desc: "Log 100 hours of study", test: (s) => s.hours >= 100 },
    { id: "first-project", emoji: "🛠️", name: "Builder", desc: "Complete your first project", test: (s) => s.projectsCompleted >= 1 },
    { id: "journal-7", emoji: "📓", name: "Reflective Mind", desc: "Write 7 journal entries", test: (s) => s.journalCount >= 7 },
    { id: "first-book", emoji: "📖", name: "Bookworm", desc: "Log your first finished book", test: (s) => s.books >= 1 },
    { id: "allocator", emoji: "👑", name: "Capital Allocator", desc: "Reach 50% overall completion", test: (s) => s.overallPct >= 50 }
  ];

  function defaultState() {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      profile: { name: "Learner", startedAt: new Date().toISOString() },
      nodes: {},          // nodeId -> { status, completedAt, checklist:{key:bool}, notes, bookmarked, favorite, quizPassed, reviewDue }
      projects: {},       // projectName -> { done, startedAt, completedAt, notes }
      activity: {},       // 'YYYY-MM-DD' -> minutes
      journal: [],        // { id, date, prompt fields..., body, tags[], createdAt }
      news: { read: {}, bookmarked: {}, notes: {} },
      resources: { bookmarked: {}, completed: {} },
      mentor: [],         // chat history
      goals: { weekly: 240, monthly: 960, yearly: 11520 }, // minutes (60m x4 x... defaults)
      booksCompleted: 0,
      achievements: {},   // id -> unlockedAt
      settings: {
        reducedMotion: false,
        aiEnabled: false,
        aiProvider: "local",
        notifications: true,
        autoCurrent: true
      },
      lastActiveDate: null
    };
  }

  let state = load();
  const listeners = new Set();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      console.warn("State load failed, resetting.", e);
      return defaultState();
    }
  }

  let saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { console.warn("Persist failed", e); }
    }, 120);
  }

  function emit() { persist(); listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  // ---------- Node helpers ----------
  function nodeRec(id) {
    if (!state.nodes[id]) state.nodes[id] = { status: null, checklist: {}, notes: "", bookmarked: false, favorite: false, quizPassed: false };
    return state.nodes[id];
  }
  function isCompleted(id) { return !!(state.nodes[id] && state.nodes[id].status === "completed"); }
  function prereqsMet(node) { return (node.prerequisites || []).every((p) => isCompleted(p)); }
  function isUnlocked(node) { return prereqsMet(node); }

  function nodeStatus(node) {
    const rec = state.nodes[node.id];
    if (rec && rec.status === "completed") return "completed";
    if (!prereqsMet(node)) return "locked";
    if (rec && rec.status === "in-progress") return "in-progress";
    return "available";
  }

  // Current node = first non-completed node (curriculum order) whose prereqs are met
  function currentNode() {
    for (const n of WM.NODES) {
      if (!isCompleted(n.id) && prereqsMet(n)) return n;
    }
    return null; // all complete
  }

  function toggleComplete(id) {
    const node = WM.NODE_BY_ID[id];
    if (!node) return;
    const rec = nodeRec(id);
    if (rec.status === "completed") {
      rec.status = "in-progress";
      rec.completedAt = null;
    } else {
      rec.status = "completed";
      rec.completedAt = new Date().toISOString();
      rec.reviewDue = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      logActivity(node.hours * 60, false); // count est. hours toward study time when completing
    }
    refreshAchievements();
    emit();
  }
  function setInProgress(id) { const r = nodeRec(id); if (r.status !== "completed") r.status = "in-progress"; emit(); }
  function toggleBookmark(id) { const r = nodeRec(id); r.bookmarked = !r.bookmarked; emit(); return r.bookmarked; }
  function toggleFavorite(id) { const r = nodeRec(id); r.favorite = !r.favorite; emit(); return r.favorite; }
  function setNote(id, text) { nodeRec(id).notes = text; emit(); }
  function toggleChecklist(id, key) { const r = nodeRec(id); r.checklist[key] = !r.checklist[key]; emit(); }
  function setQuizPassed(id, passed) { nodeRec(id).quizPassed = passed; if (passed) refreshAchievements(); emit(); }

  // ---------- Activity & streak ----------
  function logActivity(minutes, doEmit) {
    const k = WM.util ? WM.util.todayKey() : new Date().toISOString().slice(0, 10);
    state.activity[k] = (state.activity[k] || 0) + Math.max(0, Math.round(minutes));
    state.lastActiveDate = new Date().toISOString();
    if (doEmit !== false) { refreshAchievements(); emit(); }
  }

  function computeStreak() {
    const days = state.activity;
    let streak = 0;
    const d = new Date();
    // allow today OR yesterday to keep streak alive
    const key = (dt) => dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
    if (!days[key(d)]) d.setDate(d.getDate() - 1); // if nothing today, start from yesterday
    while (days[key(d)] && days[key(d)] > 0) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }

  // ---------- Progress derivation ----------
  function phaseProgress(phase) {
    let total = 0, done = 0, hours = 0, doneHours = 0;
    phase.modules.forEach((m) => m.nodes.forEach((n) => {
      total++; hours += n.hours;
      if (isCompleted(n.id)) { done++; doneHours += n.hours; }
    }));
    return { total, done, pct: total ? (done / total) * 100 : 0, hours, doneHours };
  }

  function progress() {
    let total = 0, done = 0;
    WM.NODES.forEach((n) => { total++; if (isCompleted(n.id)) done++; });
    const hours = Object.values(state.activity).reduce((s, m) => s + m, 0) / 60;
    let phasesCompleted = 0;
    WM.PHASES.forEach((p) => { const pp = phaseProgress(p); if (pp.total && pp.done === pp.total) phasesCompleted++; });
    const projectsCompleted = Object.values(state.projects).filter((p) => p && p.done).length;
    const cur = currentNode();
    const curPhase = cur ? WM.curriculum.getPhase(cur.phaseId) : WM.PHASES[WM.PHASES.length - 1];
    return {
      totalNodes: total,
      completedCount: done,
      overallPct: total ? (done / total) * 100 : 0,
      hours: Math.round(hours * 10) / 10,
      streak: computeStreak(),
      phasesCompleted,
      projectsCompleted,
      books: state.booksCompleted || 0,
      journalCount: state.journal.length,
      currentNode: cur,
      currentPhase: curPhase
    };
  }

  // ---------- Goals ----------
  function periodMinutes(period) {
    const now = new Date();
    let total = 0;
    for (const k in state.activity) {
      const d = new Date(k);
      if (period === "weekly") {
        const diff = (now - d) / 86400000;
        if (diff < 7 && diff >= -1) total += state.activity[k];
      } else if (period === "monthly") {
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) total += state.activity[k];
      } else if (period === "yearly") {
        if (d.getFullYear() === now.getFullYear()) total += state.activity[k];
      }
    }
    return total;
  }

  // ---------- Projects ----------
  function toggleProject(name) {
    const p = state.projects[name] || (state.projects[name] = { done: false, startedAt: new Date().toISOString() });
    p.done = !p.done;
    p.completedAt = p.done ? new Date().toISOString() : null;
    refreshAchievements();
    emit();
  }
  function setProjectNote(name, note) {
    const p = state.projects[name] || (state.projects[name] = { done: false, startedAt: new Date().toISOString() });
    p.notes = note; emit();
  }

  // ---------- Journal ----------
  function addJournal(entry) {
    entry.id = entry.id || (WM.util ? WM.util.uid("j") : "j" + Date.now());
    entry.createdAt = new Date().toISOString();
    state.journal.unshift(entry);
    if (entry.minutes) logActivity(entry.minutes, false);
    refreshAchievements();
    emit();
    return entry.id;
  }
  function updateJournal(id, patch) {
    const e = state.journal.find((x) => x.id === id);
    if (e) { Object.assign(e, patch); e.updatedAt = new Date().toISOString(); emit(); }
  }
  function deleteJournal(id) { state.journal = state.journal.filter((x) => x.id !== id); emit(); }

  // ---------- News ----------
  function toggleNewsRead(id) { state.news.read[id] = !state.news.read[id]; emit(); }
  function toggleNewsBookmark(id) { state.news.bookmarked[id] = !state.news.bookmarked[id]; emit(); return state.news.bookmarked[id]; }
  function setNewsNote(id, note) { state.news.notes[id] = note; emit(); }

  // ---------- Resources ----------
  function toggleResourceBookmark(id) { state.resources.bookmarked[id] = !state.resources.bookmarked[id]; emit(); return state.resources.bookmarked[id]; }
  function toggleResourceDone(id) { state.resources.completed[id] = !state.resources.completed[id]; emit(); return state.resources.completed[id]; }

  // ---------- Settings / profile ----------
  function setSetting(k, v) { state.settings[k] = v; emit(); }
  function setProfile(patch) { Object.assign(state.profile, patch); emit(); }
  function setGoal(period, minutes) { state.goals[period] = Math.max(0, minutes); emit(); }
  function setBooks(n) { state.booksCompleted = Math.max(0, n); refreshAchievements(); emit(); }

  // ---------- Mentor ----------
  function addMentorMsg(role, text) { state.mentor.push({ role, text, at: new Date().toISOString() }); emit(); }

  // ---------- Achievements ----------
  function refreshAchievements() {
    const p = progress();
    const snap = {
      completedCount: p.completedCount, phasesCompleted: p.phasesCompleted, streak: p.streak,
      hours: p.hours, projectsCompleted: p.projectsCompleted, journalCount: p.journalCount,
      books: p.books, overallPct: p.overallPct
    };
    ACHIEVEMENTS.forEach((a) => {
      if (!state.achievements[a.id] && a.test(snap)) {
        state.achievements[a.id] = new Date().toISOString();
        if (WM.util) setTimeout(() => WM.util.toast("Achievement unlocked: " + a.name + " " + a.emoji, "success"), 200);
      }
    });
  }

  // ---------- Import / export / reset ----------
  function exportData() { return JSON.stringify(state, null, 2); }
  function importData(json) {
    const parsed = JSON.parse(json);
    state = Object.assign(defaultState(), parsed);
    emit();
  }
  function resetAll() { state = defaultState(); emit(); }
  function resetProgress() {
    state.nodes = {}; state.projects = {}; state.activity = {}; state.achievements = {};
    state.booksCompleted = 0; emit();
  }

  WM.store = {
    get state() { return state; },
    subscribe, emit,
    ACHIEVEMENTS,
    // nodes
    nodeRec, isCompleted, prereqsMet, isUnlocked, nodeStatus, currentNode,
    toggleComplete, setInProgress, toggleBookmark, toggleFavorite, setNote, toggleChecklist, setQuizPassed,
    // activity
    logActivity, computeStreak,
    // progress
    phaseProgress, progress, periodMinutes,
    // projects
    toggleProject, setProjectNote,
    // journal
    addJournal, updateJournal, deleteJournal,
    // news / resources
    toggleNewsRead, toggleNewsBookmark, setNewsNote, toggleResourceBookmark, toggleResourceDone,
    // settings
    setSetting, setProfile, setGoal, setBooks, addMentorMsg,
    refreshAchievements,
    exportData, importData, resetAll, resetProgress
  };
})();
