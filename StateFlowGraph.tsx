import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type StateNode = {
  id: string;
  type: "state" | "method" | "lifecycle";
};

type StateLink = {
  source: string;
  target: string;
};

type StateFlowGraphProps = {
  data?: {
    nodes: StateNode[];
    links: StateLink[];
  };
};

const defaultData = {
  nodes: [
    { id: "count", type: "state" },
    { id: "setCount", type: "method" },
    { id: "useEffect", type: "lifecycle" },
    { id: "handleClick", type: "method" },
  ],
  links: [
    { source: "handleClick", target: "setCount" },
    { source: "setCount", target: "count" },
    { source: "count", target: "useEffect" },
  ],
};

export default function StateFlowGraph({ data = defaultData }: StateFlowGraphProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    const colorMap = {
      state: "#3b82f6",
      method: "#f59e0b",
      lifecycle: "#10b981",
    };

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("stroke", "#ddd")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", 2);

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 22)
      .attr("fill", (d) => colorMap[d.type])
      .call(
        d3
          .drag<SVGCircleElement, StateNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const labels = svg
      .append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("font-size", 12)
      .attr("fill", "#fff");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });
  }, [data]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">State Variable Flow</h2>
      <svg ref={ref} width="100%" height="400" />
    </div>
  );
}
