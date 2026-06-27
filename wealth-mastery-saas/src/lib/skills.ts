export const SKILL_AXES = [
  { label: "Foundations", codes: ["0", "0.5"] },
  { label: "Money & Econ", codes: ["1", "5", "6"] },
  { label: "Personal Fin", codes: ["2", "3"] },
  { label: "Accounting", codes: ["4", "8", "9"] },
  { label: "Markets", codes: ["10", "11", "12", "13", "14"] },
  { label: "Business", codes: ["7", "15"] },
  { label: "Tech & AI", codes: ["16"] },
  { label: "Allocation", codes: ["17", "18", "19", "20"] },
];

export function skillAxes(phases: { code: string; total: number; done: number }[]) {
  const byCode = new Map(phases.map((p) => [p.code, p]));
  return SKILL_AXES.map((a) => {
    let total = 0, done = 0;
    for (const code of a.codes) { const p = byCode.get(code); if (p) { total += p.total; done += p.done; } }
    return { label: a.label, value: total ? Math.round((done / total) * 100) : 0 };
  });
}
