"use client";

import ReactECharts from "echarts-for-react";

const data = [
  {
    name: "Money",
    itemStyle: { color: "#3b82f6" },
    children: [
      { name: "Inflation", value: 6 },
      { name: "Interest", value: 5 },
      { name: "Currency", value: 4 },
    ],
  },
  {
    name: "Markets",
    itemStyle: { color: "#8b5cf6" },
    children: [
      { name: "Equities", value: 7 },
      { name: "Bonds", value: 5 },
      { name: "Derivatives", value: 3 },
    ],
  },
  {
    name: "Business",
    itemStyle: { color: "#10b981" },
    children: [
      { name: "Moats", value: 5 },
      { name: "Unit Econ", value: 4 },
    ],
  },
  {
    name: "Capital",
    itemStyle: { color: "#f59e0b" },
    children: [
      { name: "ROIC", value: 4 },
      { name: "Allocation", value: 5 },
    ],
  },
];

export function SunburstChart() {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      backgroundColor: "rgba(17,24,39,0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#e5e7eb", fontSize: 12 },
    },
    series: [
      {
        type: "sunburst",
        data,
        radius: ["18%", "92%"],
        sort: undefined,
        emphasis: { focus: "ancestor" },
        itemStyle: { borderColor: "#030712", borderWidth: 2 },
        label: { color: "#fff", fontSize: 11, minAngle: 12 },
        levels: [
          {},
          { r0: "18%", r: "52%", label: { rotate: "tangential", fontWeight: 600 } },
          { r0: "52%", r: "92%", label: { align: "right" }, itemStyle: { colorSaturation: [0.3, 0.55] } },
        ],
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} />;
}
