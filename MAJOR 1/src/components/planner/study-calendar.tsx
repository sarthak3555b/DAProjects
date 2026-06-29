"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "sonner";

function iso(daysFromNow: number, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const events = [
  { title: "📈 Equity Valuation", start: iso(0, 9), end: iso(0, 11), backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  { title: "📝 Reflection", start: iso(0, 18), end: iso(0, 18.5), backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" },
  { title: "📚 The Intelligent Investor", start: iso(1, 8), end: iso(1, 9), backgroundColor: "#10b981", borderColor: "#10b981" },
  { title: "🧠 Assessment: Markets", start: iso(2, 14), end: iso(2, 15), backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  { title: "📈 Portfolio Construction", start: iso(3, 10), end: iso(3, 12), backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  { title: "🔬 DCF Project", start: iso(5, 13), end: iso(5, 16), backgroundColor: "#22d3ee", borderColor: "#22d3ee" },
];

export function StudyCalendar() {
  return (
    <div className="wm-calendar rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-xl">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
        height="auto"
        events={events}
        nowIndicator
        editable
        selectable
        dayMaxEvents={3}
        eventClick={(info) => toast(info.event.title)}
        select={(info) => toast.success(`Planned a session on ${info.start.toLocaleDateString()}`)}
      />
    </div>
  );
}
