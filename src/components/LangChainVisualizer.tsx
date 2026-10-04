import React, { useState } from 'react';
import { Ticket } from '../types';
import {
  GitFork,
  Cpu,
  Database,
  FileCode,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Code,
  Sliders,
  Layers,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

interface LangChainVisualizerProps {
  activeTicket: Ticket;
  allTickets: Ticket[];
  onSelectTicket: (id: string) => void;
}

export const LangChainVisualizer: React.FC<LangChainVisualizerProps> = ({
  activeTicket,
  allTickets,
  onSelectTicket,
}) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(2);

  const pipelineNodes = [
    {
      id: 'node-1',
      title: '1. Ticket Ingestion',
      subtitle: 'Raw Message Feed',
      subsystem: 'LangChain DocumentLoader',
      icon: Terminal,
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-500/40',
      description: 'Ingests inbound payload from Email IMAP listener, Webhook API, or Support Portal.',
      inputSnippet: `Source: ${activeTicket.channel}\nFrom: ${activeTicket.senderEmail}\nSubject: ${activeTicket.subject}`,
      outputSnippet: `Loaded Document: 1 chunk\nToken Count: ~${Math.ceil((activeTicket.subject.length + activeTicket.body.length) / 4)} tokens\nMetadata: { channel: "${activeTicket.channel}", receivedAt: "${activeTicket.receivedAt}" }`,
      code: `from langchain_community.document_loaders import IMAPEmailLoader, WebhookLoader

loader = WebhookLoader(port=3000, endpoint="/api/v1/inbound")
raw_docs = loader.load_and_sanitize(request.payload)`,
    },
    {
      id: 'node-2',
      title: '2. Text Sanitization',
      subtitle: 'PII Scrubbing & Tokenizer',
      subsystem: 'LangChain TextSplitter & Cleaner',
      icon: Sliders,
      color: 'from-teal-600 to-emerald-600',
      borderColor: 'border-teal-500/40',
      description: 'Strips email signatures, normalizes line breaks, masks credit card numbers, counts context window.',
      inputSnippet: activeTicket.body.substring(0, 180) + '...',
      outputSnippet: `Cleaned Body: "${activeTicket.body.replace(/\n+/g, ' ').substring(0, 140)}..."\nContext Window: 4096 Safe\nPII Masking: Verified`,
      code: `from langchain.text_splitter import RecursiveCharacterTextSplitter

clean_text = sanitize_email_signatures(raw_text)
tokens = count_llama_tokens(clean_text, tokenizer="phi-3.5-mini")`,
    },
    {
      id: 'node-3',
      title: '3. Zero-Shot Prompting',
      subtitle: 'Structured PromptTemplate',
      subsystem: 'LangChain FewShot/ZeroShot Chain',
      icon: FileCode,
      color: 'from-emerald-600 to-green-600',
      borderColor: 'border-emerald-500/40',
      description: 'Assembles zero-shot system instruction without needing task-specific training data.',
      inputSnippet: `System: You are an edge SLM classifier.\nClasses: [Technical Bug, Billing, Account Access, Feature Request, Churn, API, General]\nUrgency: [Critical, High, Medium, Low]`,
      outputSnippet: `Compiled Prompt:\n"""Given the support message, output JSON containing intent, urgency, sentiment (-1 to 1), and extracted entities."""`,
      code: `from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "Zero-shot edge classifier on Jetson Orin Nano..."),
    ("human", "Subject: {subject}\\nBody: {body}")
])`,
    },
    {
      id: 'node-4',
      title: '4. On-Device SLM Inference',
      subtitle: 'Phi-3.5-mini / Llama 3.2',
      subsystem: 'NVIDIA Jetson Tensor Cores',
      icon: Cpu,
      color: 'from-amber-600 to-orange-600',
      borderColor: 'border-amber-500/40',
      description: 'Executes 4-bit quantized SLM locally on the Jetson Orin Nano Ampere GPU (1024 CUDA cores).',
      inputSnippet: `Engine: llama.cpp INT4 (Q4_K_M)\nModel: ${activeTicket.classification.modelUsed}\nDevice: Jetson Orin Nano (15W MAXN)`,
      outputSnippet: `Inference Duration: ${activeTicket.classification.edgeLatencyMs}ms\nGeneration Speed: ${activeTicket.classification.tokensPerSec} tokens/sec\nVRAM Footprint: ~2.45 GB`,
      code: `from langchain_community.llms import LlamaCpp

llm = LlamaCpp(
    model_path="/opt/models/phi-3.5-mini-q4_k_m.gguf",
    n_gpu_layers=33, # Offload 100% to Jetson Ampere GPU
    n_ctx=4096,
    temperature=0.1
)`,
    },
    {
      id: 'node-5',
      title: '5. JSON Pydantic Parser',
      subtitle: 'Entity & Intent Parser',
      subsystem: 'LangChain JsonOutputParser',
      icon: Code,
      color: 'from-cyan-600 to-blue-600',
      borderColor: 'border-cyan-500/40',
      description: 'Validates SLM completion into typed schema: intent, urgency, sentiment, entities.',
      inputSnippet: `Raw Model Tokens: {"intent": "${activeTicket.classification.intent}", "urgency": "${activeTicket.classification.urgency}", ...}`,
      outputSnippet: JSON.stringify(
        {
          intent: activeTicket.classification.intent,
          urgency: activeTicket.classification.urgency,
          sentiment: activeTicket.classification.sentiment,
          entities: activeTicket.classification.entities,
        },
        null,
        2
      ),
      code: `from pydantic import BaseModel, Field

class TicketClassification(BaseModel):
    intent: str = Field(description="Intent category")
    urgency: str = Field(description="Urgency level")
    sentiment_score: float = Field(description="-1.0 to 1.0")
    entities: dict = Field(default_factory=dict)`,
    },
    {
      id: 'node-6',
      title: '6. Jinja2 Auto-Drafting',
      subtitle: 'Reply Templating Engine',
      subsystem: 'Jinja2 Context Interpolation',
      icon: Sparkles,
      color: 'from-indigo-600 to-purple-600',
      borderColor: 'border-indigo-500/40',
      description: 'Injects extracted context variables into category-specific Jinja2 response template.',
      inputSnippet: `Template: ${activeTicket.draftReply.templateName}\nVariables: ${JSON.stringify(activeTicket.draftReply.templateVariables)}`,
      outputSnippet: `Rendered Draft Reply (length: ${activeTicket.draftReply.generatedDraft.length} chars):\n"${activeTicket.draftReply.generatedDraft.substring(0, 120)}..."`,
      code: `from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("templates/"))
template = env.get_template("${activeTicket.draftReply.templateName}")
draft_reply = template.render(**extracted_context)`,
    },
    {
      id: 'node-7',
      title: '7. SQLite Persistence',
      subtitle: 'Local Storage Commit',
      subsystem: 'Jetson Embedded SQLite v3',
      icon: Database,
      color: 'from-purple-600 to-pink-600',
      borderColor: 'border-purple-500/40',
      description: 'Atomically writes raw ticket, classification tags, and generated draft into local SQLite tables.',
      inputSnippet: `INSERT INTO tickets VALUES ('${activeTicket.id}', ...)\nINSERT INTO classifications VALUES ('${activeTicket.id}', ...)\nINSERT INTO draft_replies VALUES (...)`,
      outputSnippet: `Status: Committed\nSQLite Row: #${activeTicket.sqliteRowId}\nDB File: /var/lib/trackmind/tickets.sqlite (WAL Mode)`,
      code: `import sqlite3

conn = sqlite3.connect("/var/lib/trackmind/tickets.sqlite")
cursor = conn.cursor()
cursor.execute("INSERT OR REPLACE INTO tickets VALUES (?, ?, ...)", (...))
conn.commit()`,
    },
    {
      id: 'node-8',
      title: '8. Human-in-the-Loop Review',
      subtitle: 'Agent Approval Gate',
      subsystem: 'HITL Review & Dispatch',
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      borderColor: 'border-emerald-500/40',
      description: 'Presents auto-draft to human support agent for one-click approval, tone adjustment, or editing before sending.',
      inputSnippet: `Ticket Status: ${activeTicket.status}\nPending Review: ${activeTicket.status === 'pending_review' ? 'YES' : 'COMPLETED'}`,
      outputSnippet: `Approved Action: ${activeTicket.status === 'approved_and_sent' ? 'Approved & Dispatched' : 'Awaiting Review'}\nFeedback loop: Stored in SQLite for future fine-tuning`,
      code: `@app.post("/api/tickets/{id}/approve")
def approve_ticket(id: str, final_draft: str):
    record_human_feedback(id, original_draft, final_draft)
    dispatch_email(id, final_draft)`,
    },
  ];

  const activeNode = pipelineNodes[selectedNodeIndex];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-6 space-y-6">
      {/* Top Banner & Ticket Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-emerald-400" />
            <span>LangChain Pipeline DAG Orchestration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full end-to-end edge pipeline executing on the NVIDIA Jetson Orin Nano, chaining LangChain, SLM inference, Jinja2, and SQLite.
          </p>
        </div>

        {/* Ticket Selector Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Inspecting Ticket:</span>
          <select
            value={activeTicket.id}
            onChange={(e) => onSelectTicket(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
          >
            {allTickets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} - {t.classification.urgency} ({t.classification.intent})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* HORIZONTAL INTERACTIVE DAG PIPELINE GRAPH */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 overflow-x-auto scrollbar-thin">
        <div className="min-w-[1020px] flex items-center justify-between gap-2">
          {pipelineNodes.map((node, idx) => {
            const isSelected = selectedNodeIndex === idx;
            const Icon = node.icon;
            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <button
                  onClick={() => setSelectedNodeIndex(idx)}
                  className={`flex-1 min-w-[110px] p-3 rounded-xl border text-left transition relative flex flex-col justify-between h-28 group ${
                    isSelected
                      ? `bg-slate-800 ring-2 ring-emerald-400 ${node.borderColor}`
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center text-white shadow`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-slate-300">
                      #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{node.title.replace(/^\d+\.\s*/, '')}</h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{node.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Edge verified</span>
                  </div>
                </button>

                {/* Arrow Connector between nodes */}
                {idx < pipelineNodes.length - 1 && (
                  <div className="shrink-0 text-slate-600 flex items-center justify-center px-0.5">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* INSPECTOR PANEL FOR SELECTED NODE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeNode.color} flex items-center justify-center text-white shadow-lg`}
            >
              <activeNode.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{activeNode.title}</h3>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                  {activeNode.subsystem}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeNode.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Pipeline Execution:</span>
            <span className="text-emerald-400 font-bold">100% Jetson On-Device</span>
          </div>
        </div>

        {/* Node Detail Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          {/* Box 1: Input to Node */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              <span>Node Input Payload</span>
              <span className="text-[10px] text-cyan-400">Context Source</span>
            </div>
            <pre className="text-slate-300 text-[11px] whitespace-pre-wrap font-mono leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/80 flex-1 overflow-x-auto">
              {activeNode.inputSnippet}
            </pre>
          </div>

          {/* Box 2: Node Output Payload */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              <span>Node Transformed Output</span>
              <span className="text-[10px] text-emerald-400">Processed</span>
            </div>
            <pre className="text-emerald-300 text-[11px] whitespace-pre-wrap font-mono leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/80 flex-1 overflow-x-auto">
              {activeNode.outputSnippet}
            </pre>
          </div>

          {/* Box 3: LangChain Python Code Definition */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5 flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              <span>LangChain Edge Definition</span>
              <span className="text-[10px] text-amber-400">Python 3.10</span>
            </div>
            <pre className="text-slate-300 text-[10px] whitespace-pre font-mono leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/80 flex-1 overflow-x-auto">
              {activeNode.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
