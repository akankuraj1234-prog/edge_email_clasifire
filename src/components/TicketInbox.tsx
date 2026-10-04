import React, { useState } from 'react';
import {
  Ticket,
  UrgencyLevel,
  IntentCategory,
  SentimentCategory,
  TicketStatus,
  ReplyTone,
} from '../types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Edit3,
  RotateCw,
  Sparkles,
  ArrowUpRight,
  Shield,
  Tag,
  Smile,
  Frown,
  Meh,
  Flame,
  Search,
  Filter,
  Check,
  X,
  History,
  Terminal,
  Cpu,
  CornerDownRight,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { JINJA_TEMPLATES } from '../data/templates';
import { renderJinjaTemplate } from '../utils/jinjaEngine';

interface TicketInboxProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
  onApproveTicket: (ticketId: string, customDraft?: string) => void;
  onEscalateTicket: (ticketId: string, reason: string) => void;
  onRejectTicket: (ticketId: string) => void;
  onRegenerateDraft: (ticketId: string, tone: ReplyTone) => void;
}

export const TicketInbox: React.FC<TicketInboxProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onApproveTicket,
  onEscalateTicket,
  onRejectTicket,
  onRegenerateDraft,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [intentFilter, setIntentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'urgency' | 'newest' | 'latency'>('urgency');

  // Active ticket draft editing state
  const [editedDraftText, setEditedDraftText] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<ReplyTone>('Empathetic');
  const [showDiffView, setShowDiffView] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('Escalating to Tier-2 Engineering');

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Sync draft text when active ticket changes
  React.useEffect(() => {
    if (activeTicket) {
      setEditedDraftText(
        activeTicket.draftReply.editedDraft || activeTicket.draftReply.generatedDraft
      );
      setSelectedTone(activeTicket.draftReply.tone || 'Empathetic');
      setShowDiffView(false);
    }
  }, [activeTicket?.id]);

  // Filtering
  const urgencyWeight: Record<UrgencyLevel, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const filteredTickets = tickets
    .filter((t) => {
      if (urgencyFilter !== 'ALL' && t.classification.urgency !== urgencyFilter) {
        return false;
      }
      if (intentFilter !== 'ALL' && t.classification.intent !== intentFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && t.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = t.subject.toLowerCase().includes(q);
        const matchesBody = t.body.toLowerCase().includes(q);
        const matchesSender = t.sender.toLowerCase().includes(q);
        const matchesId = t.id.toLowerCase().includes(q);
        const matchesIntent = t.classification.intent.toLowerCase().includes(q);
        return matchesSubject || matchesBody || matchesSender || matchesId || matchesIntent;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'urgency') {
        const diff = urgencyWeight[b.classification.urgency] - urgencyWeight[a.classification.urgency];
        if (diff !== 0) return diff;
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      }
      if (sortBy === 'latency') {
        return a.classification.edgeLatencyMs - b.classification.edgeLatencyMs;
      }
      return 0;
    });

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <Flame className="w-3 h-3 text-rose-400" />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
            <AlertCircle className="w-3 h-3 text-orange-400" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-700/50 text-slate-300 border border-slate-600/40">
            Low
          </span>
        );
    }
  };

  const getSentimentIcon = (sentiment: SentimentCategory, score: number) => {
    if (score < -0.4) {
      return <Frown className="w-3.5 h-3.5 text-rose-400" />;
    }
    if (score > 0.3) {
      return <Smile className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <Meh className="w-3.5 h-3.5 text-amber-400" />;
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Pending Approval
          </span>
        );
      case 'approved_and_sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Approved & Dispatched
          </span>
        );
      case 'edited_and_sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Edit3 className="w-3 h-3 text-cyan-400" />
            Edited & Dispatched
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ArrowUpRight className="w-3 h-3 text-purple-400" />
            Escalated to Tier-2
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-400 border border-slate-600">
            <X className="w-3 h-3 text-slate-400" />
            Draft Rejected
          </span>
        );
    }
  };

  const handleApplyTone = (tone: ReplyTone) => {
    setSelectedTone(tone);
    onRegenerateDraft(activeTicket.id, tone);
  };

  const handleApprove = () => {
    const isCustomized =
      editedDraftText.trim() !== activeTicket.draftReply.generatedDraft.trim();
    onApproveTicket(activeTicket.id, isCustomized ? editedDraftText : undefined);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
      {/* LEFT COLUMN: Ticket List */}
      <div className="w-full lg:w-96 xl:w-[420px] border-r border-slate-800 flex flex-col bg-slate-900/60 shrink-0 h-full overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900/90">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search sender, subject, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-md px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Urgency</option>
              <option value="Critical">🔥 Critical Only</option>
              <option value="High">⚠️ High Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Low">Low Only</option>
            </select>

            <select
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-md px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500 max-w-[130px] truncate"
            >
              <option value="ALL">All Intents</option>
              <option value="Technical Bug / Outage">Technical / Outage</option>
              <option value="Billing & Invoicing">Billing / Refund</option>
              <option value="Account Access & Security">Account & Security</option>
              <option value="Cancellation & Churn">Cancellation / Churn</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Integration & API">Integration / API</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-md px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500 ml-auto"
            >
              <option value="urgency">Sort: Urgency</option>
              <option value="newest">Sort: Newest</option>
              <option value="latency">Sort: Edge Latency</option>
            </select>
          </div>
        </div>

        {/* Tickets Feed List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Filter className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <p className="text-sm font-medium">No tickets match criteria</p>
              <p className="text-xs">Adjust search query or filter tags.</p>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className={`p-3.5 cursor-pointer transition relative group border-l-4 ${
                    isSelected
                      ? 'bg-slate-800/80 border-l-emerald-400'
                      : t.classification.urgency === 'Critical'
                      ? 'hover:bg-slate-800/40 border-l-rose-500'
                      : t.classification.urgency === 'High'
                      ? 'hover:bg-slate-800/40 border-l-orange-500'
                      : 'hover:bg-slate-800/40 border-l-transparent'
                  }`}
                >
                  {/* Top Line: Ticket ID, Urgency & Status */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {t.id}
                      </span>
                      {getUrgencyBadge(t.classification.urgency)}
                    </div>
                    {getStatusBadge(t.status)}
                  </div>

                  {/* Subject Line */}
                  <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition">
                    {t.subject}
                  </h3>

                  {/* Body Snippet */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {t.body}
                  </p>

                  {/* Metadata Footer: Category, Sentiment & Edge Latency */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-800/50 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium truncate max-w-[150px]">
                      {t.classification.intent}
                    </span>

                    <div className="flex items-center gap-2 font-mono text-slate-400">
                      <span className="flex items-center gap-1" title={`Sentiment: ${t.classification.sentiment} (${t.classification.sentimentScore})`}>
                        {getSentimentIcon(t.classification.sentiment, t.classification.sentimentScore)}
                        <span className="text-[10px]">
                          {t.classification.sentimentScore > 0 ? '+' : ''}
                          {t.classification.sentimentScore.toFixed(2)}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400" title="Edge SLM Latency">
                        {t.classification.edgeLatencyMs}ms
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Left Column Bottom Status */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950 text-slate-400 text-[11px] flex items-center justify-between">
          <span>
            Queue: <strong className="text-slate-200">{filteredTickets.length}</strong> / {tickets.length}
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Jetson SQLite v3 synced
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Active Ticket Inspection & Human-in-the-Loop Drafting */}
      {activeTicket ? (
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 p-4 lg:p-6 space-y-4">
          {/* Top Bar: Ticket Subject & Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-xs font-bold">
                  {activeTicket.id}
                </span>
                <span className="text-xs text-slate-400">
                  SQLite Row #{activeTicket.sqliteRowId}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  Channel: <strong className="text-slate-300">{activeTicket.channel}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getUrgencyBadge(activeTicket.classification.urgency)}
                {getStatusBadge(activeTicket.status)}
              </div>
            </div>

            <h2 className="text-base lg:text-lg font-bold text-white tracking-tight">
              {activeTicket.subject}
            </h2>

            {/* Sender Details */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center text-[11px] border border-emerald-500/40">
                  {activeTicket.sender.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-slate-200">{activeTicket.sender}</span>
                  {activeTicket.senderCompany && (
                    <span className="text-slate-400"> ({activeTicket.senderCompany})</span>
                  )}
                  <span className="text-slate-500 ml-1.5">&lt;{activeTicket.senderEmail}&gt;</span>
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono text-slate-500 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(activeTicket.receivedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Inbound Raw Message Body */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
              {activeTicket.body}
            </div>
          </div>

          {/* TWO COLUMN GRID: Zero-Shot Classification Results + SLM Hardware Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CARD 1: Zero-Shot Classification & Sentiment */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Shot Intent & Sentiment</span>
                </h3>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold">
                  {(activeTicket.classification.confidenceScore * 100).toFixed(1)}% Confidence
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400">Classified Category:</span>
                  <span className="font-semibold text-emerald-400">
                    {activeTicket.classification.intent}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400">Urgency Assessment:</span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-200">
                      {activeTicket.classification.urgency}
                    </span>
                    <p className="text-[10px] text-slate-400 italic">
                      {activeTicket.classification.urgencyReason}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sentiment Analysis:</span>
                    <span className="font-medium text-slate-200 flex items-center gap-1.5">
                      {getSentimentIcon(activeTicket.classification.sentiment, activeTicket.classification.sentimentScore)}
                      <span>{activeTicket.classification.sentiment}</span>
                    </span>
                  </div>
                  {/* Visual Sentiment Gauge Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${
                        activeTicket.classification.sentimentScore < -0.3
                          ? 'bg-rose-500'
                          : activeTicket.classification.sentimentScore > 0.3
                          ? 'bg-emerald-500'
                          : 'bg-amber-400'
                      }`}
                      style={{
                        width: `${Math.max(
                          10,
                          Math.min(100, (activeTicket.classification.sentimentScore + 1) * 50)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Extracted Key Entities */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Extracted Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.entries(activeTicket.classification.entities || {}).map(([k, v]) => {
                      if (!v) return null;
                      const valStr = Array.isArray(v) ? v.join(', ') : String(v);
                      return (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700"
                        >
                          <strong className="text-slate-400">{k}:</strong> {valStr}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: LangChain Pipeline Execution & Edge Hardware Stats */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Jetson Nano Hardware Telemetry</span>
                </h3>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                  {activeTicket.classification.tokensPerSec} tok/s
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 text-[11px] block">Target SLM:</span>
                    <span className="font-semibold text-white truncate block">
                      {activeTicket.classification.modelUsed.split(' ')[0]}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 text-[11px] block">Pipeline Latency:</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {activeTicket.classification.edgeLatencyMs} ms
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">Recommended Action:</span>
                    <span className="text-[10px] uppercase font-mono text-amber-400">HITL Required</span>
                  </div>
                  <p className="text-slate-300 font-medium">
                    {activeTicket.classification.recommendedAction}
                  </p>
                </div>

                {/* Pipeline Stages Checklist */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                    LangChain Pipeline Steps:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-300 font-mono mt-1">
                    {activeTicket.classification.pipelineStagesCompleted.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 truncate">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN DRAFT REPLY CARD: Human-in-the-Loop Auto-Drafting */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Context-Aware Pre-Generated Draft Reply</span>
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Template: {activeTicket.draftReply.templateName}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jinja2 structured auto-draft generated by on-device SLM. Review, fine-tune, or approve below.
                </p>
              </div>

              {/* Tone Chooser */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Tone:</span>
                {(['Empathetic', 'Technical', 'Concise', 'Formal', 'Conciliatory'] as ReplyTone[]).map(
                  (tone) => (
                    <button
                      key={tone}
                      onClick={() => handleApplyTone(tone)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        selectedTone === tone
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {tone}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Template Variables Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                Jinja2 Resolved Context:
              </span>
              {Object.entries(activeTicket.draftReply.templateVariables).map(([k, v]) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800"
                >
                  <span className="text-cyan-400 font-mono">{`{{ ${k} }}`}</span> ={' '}
                  <span className="text-slate-200 font-bold">{v}</span>
                </span>
              ))}
            </div>

            {/* View Diff Mode Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDiffView(false)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    !showDiffView
                      ? 'bg-slate-800 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Editable Draft Editor
                </button>
                <button
                  onClick={() => setShowDiffView(true)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    showDiffView
                      ? 'bg-slate-800 text-cyan-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Original SLM vs Human Edits Diff
                </button>
              </div>

              {editedDraftText.trim() !== activeTicket.draftReply.generatedDraft.trim() && (
                <span className="text-amber-400 text-xs font-mono flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" />
                  Contains unsaved human modifications
                </span>
              )}
            </div>

            {/* DRAFT CONTENT: Textarea or Diff View */}
            {!showDiffView ? (
              <div className="space-y-2">
                <textarea
                  rows={9}
                  value={editedDraftText}
                  onChange={(e) => setEditedDraftText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition resize-y"
                  placeholder="Draft reply text..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Characters: {editedDraftText.length} | Words: {editedDraftText.split(/\s+/).filter(Boolean).length}
                  </span>
                  <span>Feedback will be archived to SQLite for edge continuous learning</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono text-[11px] font-bold block mb-1">
                    Raw SLM Generated Draft:
                  </span>
                  <div className="text-slate-400 whitespace-pre-line leading-relaxed text-[11px]">
                    {activeTicket.draftReply.generatedDraft}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/40 space-y-1">
                  <span className="text-cyan-400 font-mono text-[11px] font-bold block mb-1">
                    Human Edited Version:
                  </span>
                  <div className="text-slate-200 whitespace-pre-line leading-relaxed text-[11px]">
                    {editedDraftText}
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS: Approve & Dispatch, Escalate, Reject */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAuditLogs(!showAuditLogs)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded bg-slate-800/80 border border-slate-700 transition"
                >
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Audit Trail ({activeTicket.auditTrail.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRejectTicket(activeTicket.id)}
                  disabled={activeTicket.status === 'rejected'}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition disabled:opacity-50"
                >
                  Reject Draft
                </button>

                <button
                  onClick={() => setEscalateModalOpen(true)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Escalate to Tier-2</span>
                </button>

                <button
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-900/30 border border-emerald-400/40 transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Approve & Dispatch Reply</span>
                </button>
              </div>
            </div>

            {/* Audit Trail Drawer */}
            {showAuditLogs && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-2 mt-2">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>SQLite Audit Records for Ticket {activeTicket.id}:</span>
                  <span className="text-slate-500">Encrypted in-situ</span>
                </div>
                <div className="space-y-1.5 divide-y divide-slate-800/60 font-mono text-[11px]">
                  {activeTicket.auditTrail.map((log) => (
                    <div key={log.id} className="pt-1.5 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-emerald-400 font-bold">{log.action}</span>
                        <span className="text-slate-500 ml-1.5">by {log.actor}</span>
                        <p className="text-slate-400 text-[10px] mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-slate-500 text-[10px] shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
          <p>Select a ticket from the left panel to inspect.</p>
        </div>
      )}

      {/* Escalate Confirmation Modal */}
      {escalateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
              <span>Escalate Ticket {activeTicket?.id}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide an engineering note for the Tier-2 SRE or Incident Management team:
            </p>
            <input
              type="text"
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              placeholder="e.g. SRE investigation needed for database timeout"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEscalateModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEscalateTicket(activeTicket.id, escalateReason);
                  setEscalateModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
