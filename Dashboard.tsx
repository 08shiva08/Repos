import React from "react";
import ComponentInteractionGraph from "./graphs/ComponentInteractionGraph";
import MethodFlowGraph from "./graphs/MethodFlowGraph";
import StateFlowGraph from "./graphs/StateFlowGraph";
import LifecycleUsageChart from "./graphs/LifecycleUsageChart";
import ComponentMetricsCharts from "./graphs/ComponentMetricsCharts";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">React Component Analysis Dashboard</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">Component Interaction Map</h2>
          <ComponentInteractionGraph />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">Method Flow</h2>
          <MethodFlowGraph />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">State Flow</h2>
          <StateFlowGraph />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">Lifecycle Usage Map</h2>
          <LifecycleUsageChart />
        </div>

        <div className="col-span-1 xl:col-span-2 bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">Project Metrics Overview</h2>
          <ComponentMetricsCharts />
        </div>
      </div>
    </div>
  );
}
