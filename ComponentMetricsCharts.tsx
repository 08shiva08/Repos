import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type ComponentMetadata = {
  name: string;
  type: "class" | "functional";
  state: string[];
  methods: any[];
  hooks?: string[];
};

type Props = {
  data?: ComponentMetadata[];
};

const sampleData: ComponentMetadata[] = [
  {
    name: "Header",
    type: "functional",
    state: ["title"],
    methods: [],
    hooks: ["useEffect", "useState"],
  },
  {
    name: "App",
    type: "class",
    state: ["count", "theme"],
    methods: [{ name: "handleClick" }],
  },
  {
    name: "Sidebar",
    type: "functional",
    state: ["collapsed"],
    methods: [],
    hooks: ["useMemo"],
  },
];

export default function ComponentMetricsCharts({ data = sampleData }: Props) {
  const pieRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Pie chart for component types
    const typeCounts = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.type
    );

    const pie = d3.pie().value((d: any) => d[1])(Array.from(typeCounts.entries()));
    const arc = d3.arc().innerRadius(0).outerRadius(80);

    const pieSvg = d3.select(pieRef.current);
    pieSvg.selectAll("*").remove();
    const g = pieSvg
      .attr("width", 200)
      .attr("height", 200)
      .append("g")
      .attr("transform", "translate(100,100)");

    g.selectAll("path")
      .data(pie)
      .enter()
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (_, i) => ["#60a5fa", "#34d399"][i])
      .attr("stroke", "#fff");

    g.selectAll("text")
      .data(pie)
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .text((d) => d.data[0]);

    // Bar chart for totals
    const totalStates = data.reduce((acc, d) => acc + d.state.length, 0);
    const totalMethods = data.reduce((acc, d) => acc + d.methods.length, 0);
    const totalHooks = data.reduce((acc, d) => acc + (d.hooks?.length || 0), 0);

    const barData = [
      { label: "State", value: totalStates },
      { label: "Methods", value: totalMethods },
      { label: "Hooks", value: totalHooks },
    ];

    const barSvg = d3.select(barRef.current);
    barSvg.selectAll("*").remove();

    const width = 300;
    const height = 200;
    const barMargin = { top: 10, right: 10, bottom: 30, left: 50 };
    const barInnerWidth = width - barMargin.left - barMargin.right;
    const barInnerHeight = height - barMargin.top - barMargin.bottom;

    const x = d3
      .scaleBand()
      .domain(barData.map((d) => d.label))
      .range([0, barInnerWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(barData, (d) => d.value)!])
      .nice()
      .range([barInnerHeight, 0]);

    const barGroup = barSvg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);

    barGroup
      .selectAll("rect")
      .data(barData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.label)!)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => barInnerHeight - y(d.value))
      .attr("fill", "#818cf8")
      .attr("rx", 4);

    barGroup
      .append("g")
      .attr("transform", `translate(0, ${barInnerHeight})`)
      .call(d3.axisBottom(x));

    barGroup.append("g").call(d3.axisLeft(y));
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-md">
      <div>
        <h2 className="text-lg font-semibold mb-2">Component Type Distribution</h2>
        <svg ref={pieRef} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Project Metrics Overview</h2>
        <svg ref={barRef} />
      </div>
    </div>
  );
}
