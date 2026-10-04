import React from 'react';
import {
  Cpu,
  Mail,
  GitFork,
  Database,
  FileCode,
  Info,
  PlusCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { EdgeTelemetry } from '../types';

interface HeaderProps {
  activeTab: 'inbox' | 'pipeline' | 'hardware' | 'sqlite' | 'templates' | 'abstract';
  setActiveTab: (tab: 'inbox' | 'pipeline' | 'hardware' | 'sqlite' | 'templates' | 'abstract') => void;
  pendingCount: number;
  totalCount: number;
  telemetry: EdgeTelemetry;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenNewTicketModal: () => void;
  onResetData: () => void;
  onOpenAbstractModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  totalCount,
  telemetry,
  isStreaming,
  onToggleStreaming,
  onOpenNewTicketModal,
  onResetData,
  onOpenAbstractModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Top Banner: College & Team Branding */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            EDGE HARDWARE SYSTEM
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 font-medium hidden md:inline">
            GIFT Autonomous College, Bhubaneswar
          </span>
          <span className="text-slate-500 hidden lg:inline">
            (Dept. of CSE - Applied AI)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">Team Trackmind:</span>
            <span className="text-emerald-400 font-mono">Ankit K. Manjhi</span>
            <span className="text-slate-600">&</span>
            <span className="text-emerald-400 font-mono">Amardeep Kumar</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Mentor:</span>
            <span className="text-amber-300">Kalpa Pandit</span>
          </div>
          <button
            onClick={onOpenAbstractModal}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition text-xs"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Abstract & Specs</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Hardware Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Trackmind Edge Classifier
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                NVIDIA Jetson Orin Nano
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Zero-Shot Intent Classification</span>
              <span className="text-slate-600">•</span>
              <span>SLM Auto-Drafting ({telemetry.activeSLM.split(' ')[0]})</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-mono">100% On-Device</span>
            </p>
          </div>
        </div>

        {/* Live Telemetry Pill */}
        <div className="hidden xl:flex items-center gap-3 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPU:</span>
            <span className="text-emerald-400 font-bold">{telemetry.gpuLoadPct}%</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <span>Temp:</span>
            <span className="text-amber-400 font-bold">{telemetry.temperatureC}°C</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <span>Power:</span>
            <span className="text-cyan-400 font-bold">{telemetry.powerWattage}W</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <span>Throughput:</span>
            <span className="text-indigo-400 font-bold">{telemetry.tokensPerSec} tok/s</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Live Ingestion Toggle */}
          <button
            onClick={onToggleStreaming}
            title={isStreaming ? 'Pause simulated incoming email stream' : 'Start live simulated email feed'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isStreaming
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Streaming Feed (Active)</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Live Ingest</span>
              </>
            )}
          </button>

          {/* New Custom Ticket Button */}
          <button
            onClick={onOpenNewTicketModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-emerald-900/30 transition border border-emerald-400/30"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Inbound Ticket</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            title="Reset to default seed dataset"
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="px-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'inbox'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Sorted Inbox & Review Queue</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/30 font-bold">
              {pendingCount}
            </span>
          )}
          <span className="text-slate-600 text-[11px]">({totalCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'pipeline'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>LangChain Edge Pipeline</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
            DAG
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'hardware'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Jetson Orin Nano Cockpit</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </button>

        <button
          onClick={() => setActiveTab('sqlite')}
          className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'sqlite'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>SQLite Database Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'templates'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Jinja2 Reply Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('abstract')}
          className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'abstract'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Project Abstract & Hardware Spec</span>
        </button>
      </nav>
    </header>
  );
};
