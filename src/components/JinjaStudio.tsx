import React, { useState } from 'react';
import { JinjaTemplateDef } from '../types';
import { JINJA_TEMPLATES } from '../data/templates';
import { renderJinjaTemplate } from '../utils/jinjaEngine';
import {
  FileCode,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Layers,
  Code2,
} from 'lucide-react';

export const JinjaStudio: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<JinjaTemplateDef>(JINJA_TEMPLATES[0]);
  const [templateText, setTemplateText] = useState<string>(selectedTemplate.rawTemplate);

  // Test variables sandbox state
  const [testVariables, setTestVariables] = useState<Record<string, string>>({
    customer_name: 'Dr. Sarah Connor',
    ticket_id: 'TCK-9921',
    service_name: 'Authentication Core Gateway',
    incident_id: 'INC-8819',
    eta_minutes: '15',
    support_engineer: 'Amardeep Kumar (SRE Lead)',
    severity: 'Critical',
    invoice_reference: 'INV-44102',
    dispute_amount: '$1,250.00',
    resolution_timeline: '2 hours',
    refund_eligible: 'true',
    account_email: 'sarah@skynet-defense.com',
    auth_step: 'Hardware YubiKey Challenge',
    expiry_hours: '4',
    plan_tier: 'Enterprise Platinum',
    account_manager: 'Ankit Kumar Manjhi',
    alternative_offer: 'Dedicated Jetson Tensor partition with 99.99% SLA',
    feature_summary: 'Edge Offline Fallback Caching',
    product_pillar: 'Reliability Core',
    target_milestone: 'Sprint Q4-Edge',
    endpoint_name: '/api/v1/models/phi35',
    sdk_language: 'Python / FastHTML',
    docs_url: 'https://docs.trackmind.io/edge/inference',
    topic_name: 'SLA guarantees on edge',
    resource_link: 'https://support.trackmind.io/edge-sla',
  });

  const handleSelectTemplate = (tpl: JinjaTemplateDef) => {
    setSelectedTemplate(tpl);
    setTemplateText(tpl.rawTemplate);
  };

  const renderedOutput = renderJinjaTemplate(templateText, testVariables);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
            <FileCode className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Jinja2 Reply Templating Studio
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                Context-Aware Reply Formatter
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Formats structured, context-aware draft replies using Jinja2 logic before human review.
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Interface: Templates List + Editor + Live Rendered Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* TEMPLATE PICKER (3 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Jinja2 Templates
          </h3>

          <div className="space-y-2">
            {JINJA_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-400 ring-1 ring-emerald-400/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {tpl.filename}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {tpl.intentMatch}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mt-1">{tpl.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{tpl.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* EDITOR & LIVE TEST BENCH (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Template Raw Source Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {selectedTemplate.filename} Source
                </h4>
              </div>
              <button
                onClick={() => setTemplateText(selectedTemplate.rawTemplate)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>

            <textarea
              rows={9}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 leading-relaxed focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Test Variables Bench */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Test Variables Injector</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Dynamic Context Simulator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
              {selectedTemplate.variables.map((vKey) => (
                <div key={vKey} className="bg-slate-950 p-2 rounded border border-slate-800">
                  <label className="text-[10px] text-slate-400 block mb-1 truncate">
                    {`{{ ${vKey} }}`}
                  </label>
                  <input
                    type="text"
                    value={testVariables[vKey] || ''}
                    onChange={(e) =>
                      setTestVariables({ ...testVariables, [vKey]: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700/60 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Rendered Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Live Rendered Auto-Draft Output</span>
              </h4>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid Jinja2 Syntax
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-200 font-sans whitespace-pre-line leading-relaxed">
              {renderedOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
