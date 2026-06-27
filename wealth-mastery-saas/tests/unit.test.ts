import { describe, it, expect } from "vitest";
import { fmtHours, fmtInr, todayKey, DIFFICULTY_LEVEL } from "@/lib/utils";
import { skillAxes, SKILL_AXES } from "@/lib/skills";
import { localReply } from "@/lib/mentor";
import { periodMinutes } from "@/lib/progress";

describe("utils", () => {
  it("formats hours", () => { expect(fmtHours(0.5)).toBe("30m"); expect(fmtHours(2)).toContain("2"); });
  it("formats inr", () => { expect(fmtInr(1000)).toContain("₹"); });
  it("today key is ISO-ish", () => { expect(todayKey(new Date("2026-06-27"))).toBe("2026-06-27"); });
  it("difficulty levels", () => { expect(DIFFICULTY_LEVEL.MASTER).toBe(5); });
});

describe("skills", () => {
  it("computes axes from phase progress", () => {
    const phases = SKILL_AXES.flatMap((a) => a.codes).map((code) => ({ code, total: 10, done: 5 }));
    const axes = skillAxes(phases);
    expect(axes).toHaveLength(SKILL_AXES.length);
    expect(axes[0].value).toBe(50);
  });
});

describe("mentor", () => {
  it("returns a confusion-focused reply", () => { expect(localReply("I am confused").length).toBeGreaterThan(20); });
  it("returns a plan when asked", () => { expect(localReply("give me a 60 minute plan", { currentNode: "Compound Interest" })).toContain("Compound Interest"); });
});

describe("progress periods", () => {
  it("sums minutes within the year", () => {
    const y = new Date().getFullYear();
    const act = { [`${y}-01-01`]: 60, [`${y}-01-02`]: 30 };
    expect(periodMinutes(act, "yearly")).toBe(90);
  });
});
