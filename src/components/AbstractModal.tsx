import React from 'react';
import {
  X,
  FileText,
  Cpu,
  Layers,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AbstractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AbstractModal: React.FC<AbstractModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Project Abstract – Hardware Project
              </h2>
              <p className="text-[11px] text-slate-400">
                Department of Computer Science & Engineering (Applied AI)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Title & Institutional Affiliation */}
          <div className="text-center space-y-2 pb-4 border-b border-slate-800">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/30 text-[11px] font-mono">
              APPLIED AI HARDWARE CAPSTONE
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Edge Email & Ticket Classifier with Auto-Drafting
            </h1>
            <p className="text-sm text-slate-300 font-medium">
              GIFT Autonomous College, Bhubaneswar
            </p>
          </div>

          {/* Team and Mentor Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 text-[11px] block uppercase font-bold tracking-wider">
                Team Name: Trackmind
              </span>
              <p className="text-slate-200">
                • <strong className="text-emerald-400">Ankit Kumar Manjhi</strong> (Reg: 2301298317)
              </p>
              <p className="text-slate-200">
                • <strong className="text-emerald-400">Amardeep Kumar</strong> (Reg: 2301298308)
              </p>
            </div>
            <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-4">
              <span className="text-slate-500 text-[11px] block uppercase font-bold tracking-wider">
                Mentor / Guide
              </span>
              <p className="text-amber-300 font-bold">Kalpa Pandit</p>
              <p className="text-slate-400 text-[11px]">AI Master Trainer</p>
            </div>
          </div>

          {/* 1. Project Objective */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
              <span>Project Objective</span>
            </h3>
            <p className="text-slate-300">
              Support teams receive a continuous stream of incoming emails and tickets that must be manually read, prioritized and replied to, which is slow and inconsistent, especially outside office hours or on resource-limited setups. This project builds an edge-deployed, hardware-based system that automatically classifies incoming emails and support tickets and drafts context-aware replies for human approval, running entirely on a local edge device. It has three aims:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong className="text-white">Aim 1:</strong> Classify incoming emails/tickets by intent and urgency using zero-shot intent classification and sentiment analysis, without task-specific training data.
              </li>
              <li>
                <strong className="text-white">Aim 2:</strong> Generate context-aware draft replies automatically using a small on-device language model (SLM), ready for human review before sending.
              </li>
              <li>
                <strong className="text-white">Aim 3:</strong> Run the full pipeline on a local edge device so classification and drafting work without dependence on cloud AI services.
              </li>
            </ul>
          </div>

          {/* 2. Hardware Specifications */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
              <span>Hardware & Software Specifications</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="p-2.5 font-semibold">Component</th>
                    <th className="p-2.5 font-semibold text-emerald-400">Proposed Specification</th>
                    <th className="p-2.5 font-semibold">Role in Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
                  <tr>
                    <td className="p-2.5 font-bold text-white">Edge device</td>
                    <td className="p-2.5 font-mono text-emerald-300">NVIDIA Jetson Nano Orin kit</td>
                    <td className="p-2.5">Runs the local SLM and the full classification + drafting pipeline on-device</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Language model</td>
                    <td className="p-2.5 font-mono text-emerald-300">Phi-3.5-mini or Llama 3.2 (3B) (target SLM)</td>
                    <td className="p-2.5">Performs intent classification, sentiment analysis and draft generation</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Ticket ingestion</td>
                    <td className="p-2.5 font-mono text-emerald-300">Incoming email / support-ticket feed</td>
                    <td className="p-2.5">Supplies raw messages to the pipeline for processing</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Orchestration</td>
                    <td className="p-2.5 font-mono text-emerald-300">LangChain</td>
                    <td className="p-2.5">Chains classification, analysis and drafting steps around the SLM</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Database</td>
                    <td className="p-2.5 font-mono text-emerald-300">SQLite</td>
                    <td className="p-2.5">Stores tickets, classification tags and generated drafts</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Templating</td>
                    <td className="p-2.5 font-mono text-emerald-300">Jinja2</td>
                    <td className="p-2.5">Formats structured, context-aware draft replies</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono mt-1">
              <strong>Software layer:</strong> Phi-3.5-mini / Llama 3.2 (3B) SLM, LangChain (pipeline orchestration), zero-shot intent classification, sentiment analysis, context-aware draft generation, SQLite (storage), Jinja2 (reply templating).
            </p>
          </div>

          {/* 3. Expected Outcome & Measurable Targets */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
              <span>Expected Outcome & Measurable Targets</span>
            </h3>
            <p className="text-slate-300">
              The project will deliver a working prototype that ingests incoming emails and support tickets on the Jetson Orin Nano, runs zero-shot intent classification and sentiment analysis using the on-device SLM, and generates a context-aware draft reply for each message using LangChain and Jinja2. Classified tickets and drafts are stored in SQLite for review.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sorted inbox with each email/ticket tagged by urgency and category.</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pre-generated draft reply attached to each ticket, ready for human approval.</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Correct zero-shot classification of intent and sentiment across varied, unseen message types.</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Full pipeline running locally on the Jetson Orin Nano without cloud dependency.</span>
              </div>
            </div>
          </div>

          {/* 4. Future Scope */}
          <div className="space-y-2 bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Future Scope</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Extend toward multi-channel support (chat, social media), auto-routing tickets to the right team, learning from human edits to drafts, and multilingual ticket handling — using the same Jetson Orin Nano edge deployment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
