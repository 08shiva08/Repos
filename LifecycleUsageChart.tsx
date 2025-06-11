import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type LifecycleUsageChartProps = {
  data?: {
    lifecycle: {
      phase: string;
      methods: string[];
      states: string[];
      hooks?: string[];
    }[];
  };
};

const defaultData = {
  lifecycle: [
    {
      phase: "componentDidMount",
      methods: ["fetchData"],
      states: ["loading", "data"],
    },
    {
      phase: "componentDidUpdate",
      methods: ["updateChart"],
      states: ["data"],
    },
    {
      phase: "useEffect",
      methods: ["syncState"],
      states: ["count"],
      hooks: ["useEffect"],
    },
  ],
};

export default function LifecycleUsageChart({ data = defaultData }: LifecycleUsageChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const width = 700 - margin.left - margin.right;
    const height = 300;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const phases = data.lifecycle.map((d) => d.phase);
    const y = d3.scaleBand().domain(phases).range([0, height]).padding(0.2);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data.lifecycle, (d) => d.methods.length + d.states.length + (d.hooks?.length || 0)) || 1])
      .range([0, width]);

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "14px");

    const barGroups = g
      .selectAll("g.bar-group")
      .data(data.lifecycle)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", (d) => `translate(0, ${y(d.phase)})`);

    barGroups
      .append("rect")
      .attr("height", y.bandwidth())
      .attr("width", (d) =>
        x(d.methods.length + d.states.length + (d.hooks?.length || 0))
      )
      .attr("fill", "#60a5fa")
      .attr("rx", 5);

    barGroups
      .append("text")
      .attr("x", (d) => x(d.methods.length + d.states.length + (d.hooks?.length || 0)) + 8)
      .attr("y", y.bandwidth() / 2 + 4)
      .text(
        (d) =>
          `${d.methods.length} methods, ${d.states.length} states${
            d.hooks?.length ? `, ${d.hooks.length} hooks` : ""
          }`
      )
      .attr("font-size", "12px")
      .attr("fill", "#333");
  }, [data]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">Lifecycle Usage Chart</h2>
      <svg ref={ref} />
    </div>
  );
}
