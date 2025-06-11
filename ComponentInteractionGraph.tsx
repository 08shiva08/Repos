import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type ComponentNode = {
  id: string;
  label: string;
};

type ComponentLink = {
  source: string;
  target: string;
};

type ComponentInteractionGraphProps = {
  data?: {
    nodes: ComponentNode[];
    links: ComponentLink[];
  };
};

const defaultData = {
  nodes: [
    { id: "App", label: "App" },
    { id: "Header", label: "Header" },
    { id: "Footer", label: "Footer" },
    { id: "Dashboard", label: "Dashboard" },
  ],
  links: [
    { source: "App", target: "Header" },
    { source: "App", target: "Footer" },
    { source: "App", target: "Dashboard" },
    { source: "Dashboard", target: "Header" },
  ],
};

export default function ComponentInteractionGraph({
  data = defaultData,
}: ComponentInteractionGraphProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const width = 600;
    const height = 400;

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3.forceLink(data.links).id((d: any) => d.id).distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("stroke", "#ccc")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", 2);

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", "#4f46e5")
      .call(
        d3
          .drag<SVGCircleElement, ComponentNode>()
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
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("font-size", 12)
      .attr("fill", "#000");

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
      <h2 className="text-lg font-semibold mb-2">Component Interaction</h2>
      <svg ref={ref} width="100%" height="400" />
    </div>
  );
}
