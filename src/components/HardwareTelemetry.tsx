import React from 'react';
import { EdgeTelemetry } from '../types';
import {
  Cpu,
  Zap,
  Activity,
  Thermometer,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Lock,
  WifiOff,
  Sliders,
  Server,
  Layers,
} from 'lucide-react';

interface HardwareTelemetryProps {
  telemetry: EdgeTelemetry;
  onUpdateHardwareSettings: (settings: {
    powerMode?: '15W Mode (MAXN)' | '7W Mode (Eco)';
    activeSLM?: 'Phi-3.5-mini (3.8B)' | 'Llama 3.2 (3B)';
    quantization?: 'INT4 (Q4_K_M)' | 'FP16';
  }) => void;
}

export const HardwareTelemetry: React.FC<HardwareTelemetryProps> = ({
  telemetry,
  onUpdateHardwareSettings,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-bold text-white">
                {telemetry.deviceName}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE HARDWARE NODE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Edge deployment running on-device inference without dependence on external cloud AI APIs.
            </p>
          </div>
        </div>

        {/* Offline Badge */}
        <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-800/80 px-3 py-2 rounded-lg text-xs">
          <WifiOff className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold text-emerald-300 block">100% Local Inference</span>
            <span className="text-[10px] text-emerald-500">Zero Cloud Dependency</span>
          </div>
        </div>
      </div>

      {/* METRIC GAUGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPU LOAD */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Ampere GPU Load
            </span>
            <span className="font-mono text-emerald-400 font-bold">{telemetry.gpuLoadPct}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            1024 <span className="text-xs font-sans text-slate-400 font-normal">CUDA Cores (32 Tensor)</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${telemetry.gpuLoadPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">Offloads 100% of SLM layers via llama.cpp cuBLAS</p>
        </div>

        {/* THERMALS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              SoC Temperature
            </span>
            <span className="font-mono text-amber-400 font-bold">{telemetry.temperatureC}°C</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {telemetry.temperatureC}°C <span className="text-xs font-sans text-slate-400 font-normal">Optimal Thermal</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                telemetry.temperatureC > 60 ? 'bg-rose-500' : 'bg-amber-400'
              }`}
              style={{ width: `${(telemetry.temperatureC / 85) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">Active PWM Fan: ~2,400 RPM | Junction Safe &lt;85°C</p>
        </div>

        {/* UNIFIED MEMORY (LPDDR5) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              Unified Memory (LPDDR5)
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {((telemetry.memoryUsedMB / telemetry.memoryTotalMB) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {(telemetry.memoryUsedMB / 1024).toFixed(1)} <span className="text-xs font-sans text-slate-400 font-normal">/ 8.0 GB Used</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(telemetry.memoryUsedMB / telemetry.memoryTotalMB) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            SLM Weights: <strong>{(telemetry.slmWeightsVRAM_MB / 1024).toFixed(2)} GB</strong> pinned in VRAM
          </p>
        </div>

        {/* POWER CONSUMPTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              Power Consumption
            </span>
            <span className="font-mono text-indigo-400 font-bold">{telemetry.powerMode}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {telemetry.powerWattage} <span className="text-xs font-sans text-slate-400 font-normal">Watts Draw</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(telemetry.powerWattage / 15) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">Total Inferences Run: <strong>{telemetry.inferenceCount}</strong></p>
        </div>
      </div>

      {/* HARDWARE INTERACTIVE CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Jetson Hardware Configuration & Model Tuner</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* CONTROL 1: Target SLM Selection */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <label className="text-slate-400 font-semibold block">Target Small Language Model (SLM):</label>
            <div className="space-y-1.5">
              {(['Phi-3.5-mini (3.8B)', 'Llama 3.2 (3B)'] as const).map((model) => (
                <button
                  key={model}
                  onClick={() => onUpdateHardwareSettings({ activeSLM: model })}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition flex items-center justify-between border ${
                    telemetry.activeSLM === model
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{model}</span>
                  {telemetry.activeSLM === model && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              Both models fit fully inside Jetson Orin Nano unified 8GB memory footprint.
            </p>
          </div>

          {/* CONTROL 2: Quantization Precision */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <label className="text-slate-400 font-semibold block">Quantization Precision:</label>
            <div className="space-y-1.5">
              {(['INT4 (Q4_K_M)', 'FP16'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => onUpdateHardwareSettings({ quantization: q })}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition flex items-center justify-between border ${
                    telemetry.quantization === q
                      ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{q}</span>
                  {telemetry.quantization === q && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              INT4 Q4_K_M reduces memory bandwidth bottleneck, delivering 26+ tokens/sec.
            </p>
          </div>

          {/* CONTROL 3: Jetson Power Mode */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <label className="text-slate-400 font-semibold block">Jetson Power Profile (NVPMODEL):</label>
            <div className="space-y-1.5">
              {(['15W Mode (MAXN)', '7W Mode (Eco)'] as const).map((pm) => (
                <button
                  key={pm}
                  onClick={() => onUpdateHardwareSettings({ powerMode: pm })}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition flex items-center justify-between border ${
                    telemetry.powerMode === pm
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{pm}</span>
                  {telemetry.powerMode === pm && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              15W enables peak Tensor Core frequency; 7W enables battery/solar operation.
            </p>
          </div>
        </div>
      </div>

      {/* EDGE VS CLOUD COMPARISON TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Architectural Advantage: Jetson Edge Deployment vs Cloud AI Services</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-2.5 font-semibold">Evaluation Metric</th>
                <th className="pb-2.5 font-semibold text-emerald-400">Trackmind (Jetson Orin Nano Edge)</th>
                <th className="pb-2.5 font-semibold text-slate-400">Traditional Cloud API (OpenAI/Cloud)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 font-medium flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-emerald-400" />
                  <span>Internet Dependency</span>
                </td>
                <td className="py-2.5 text-emerald-300 font-semibold font-mono">
                  Zero. Operates 100% offline in isolated subnets.
                </td>
                <td className="py-2.5 text-slate-400">
                  Critical. Outage in WAN drops classification pipeline.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Data Sovereignty & Privacy</span>
                </td>
                <td className="py-2.5 text-emerald-300 font-semibold">
                  100% Local. No customer PII or confidential emails leave premises.
                </td>
                <td className="py-2.5 text-slate-400">
                  Emails transmitted to 3rd-party cloud data centers.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Marginal Cost Per Ticket</span>
                </td>
                <td className="py-2.5 text-emerald-300 font-semibold font-mono">
                  $0.000 (Fixed hardware cost amortized)
                </td>
                <td className="py-2.5 text-slate-400">
                  $0.005 - $0.02 per ticket (Tokens add up at scale)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>End-to-End Latency</span>
                </td>
                <td className="py-2.5 text-emerald-300 font-semibold font-mono">
                  ~300ms - 400ms (Immediate local bus)
                </td>
                <td className="py-2.5 text-slate-400">
                  1,200ms - 3,500ms (Network roundtrips + queueing)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Storage Persistence</span>
                </td>
                <td className="py-2.5 text-emerald-300 font-semibold">
                  Local Embedded SQLite v3 in NVMe SSD storage.
                </td>
                <td className="py-2.5 text-slate-400">
                  Remote cloud DB requiring separate VPC & Auth tokens.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
