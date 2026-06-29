"use client";

import ReactECharts from "echarts-for-react";

const data = [
  {
    name: "Equities",
    value: 42,
    itemStyle: { color: "#3b82f6" },
    children: [
      { name: "US Large Cap", value: 20 },
      { name: "Intl Developed", value: 12 },
      { name: "Emerging", value: 10 },
    ],
  },
  {
    name: "Fixed Income",
    value: 26,
    itemStyle: { color: "#8b5cf6" },
    children: [
      { name: "Treasuries", value: 14 },
      { name: "Corporate", value: 12 },
    ],
  },
  {
    name: "Real Assets",
    value: 18,
    itemStyle: { color: "#10b981" },
    children: [
      { name: "REITs", value: 10 },
      { name: "Commodities", value: 8 },
    ],
  },
  { name: "Alternatives", value: 8, itemStyle: { color: "#f59e0b" } },
  { name: "Cash", value: 6, itemStyle: { color: "#22d3ee" } },
];

export function AllocationTreemap() {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (info: any) => `${info.name}: <b>${info.value}%</b>`,      backgroundColor: "rgba(17,24,39,0.95)",
      borderColor: "rgba(255,255,255,0.1)",
      textStyle: { color: "#e5e7eb", fontSize: 12 },
    },
    series: [
      {
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        data,
        levels: [
          { itemStyle: { borderColor: "#030712", borderWidth: 3, gapWidth: 3 } },
          { itemStyle: { borderColor: "rgba(3,7,18,0.6)", borderWidth: 1, gapWidth: 1 }, colorSaturation: [0.3, 0.6] },
        ],
        label: { color: "#fff", fontSize: 12, fontWeight: 500 },
        upperLabel: { show: false },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} />;
}
