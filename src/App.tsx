import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket,
  EdgeTelemetry,
  ReplyTone,
} from './types';
import { INITIAL_TICKETS } from './data/mockTickets';
import { Header } from './components/Header';
import { TicketInbox } from './components/TicketInbox';
import { LangChainVisualizer } from './components/LangChainVisualizer';
import { HardwareTelemetry } from './components/HardwareTelemetry';
import { SqliteInspector } from './components/SqliteInspector';
import { JinjaStudio } from './components/JinjaStudio';
import { AbstractModal } from './components/AbstractModal';
import { NewTicketModal } from './components/NewTicketModal';
import { processTicketThroughEdgePipeline } from './utils/edgeSLMSimulator';
import { renderJinjaTemplate } from './utils/jinjaEngine';
import { JINJA_TEMPLATES } from './data/templates';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('trackmind_tickets_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TICKETS;
      }
    }
    return INITIAL_TICKETS;
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    tickets[0]?.id || 'TCK-8091'
  );

  const [activeTab, setActiveTab] = useState<
    'inbox' | 'pipeline' | 'hardware' | 'sqlite' | 'templates' | 'abstract'
  >('inbox');

  const [telemetry, setTelemetry] = useState<EdgeTelemetry>({
    deviceName: 'NVIDIA Jetson Orin Nano Developer Kit',
    soc: '6-core ARM Cortex-A78AE v8.2 64-bit CPU @ 1.5GHz',
    gpu: '1024-core NVIDIA Ampere GPU w/ 32 Tensor Cores',
    activeSLM: 'Phi-3.5-mini (3.8B)',
    quantization: 'INT4 (Q4_K_M)',
    powerMode: '15W Mode (MAXN)',
    temperatureC: 44.5,
    gpuLoadPct: 42,
    cpuLoadPct: 26,
    memoryUsedMB: 3480,
    memoryTotalMB: 8192,
    slmWeightsVRAM_MB: 2450,
    powerWattage: 12.6,
    tokensPerSec: 26.8,
    inferenceCount: 146,
    offlineMode: true,
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isAbstractModalOpen, setIsAbstractModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  // Sync tickets to localStorage
  useEffect(() => {
    localStorage.setItem('trackmind_tickets_v1', JSON.stringify(tickets));
  }, [tickets]);

  // Periodic Telemetry Fetch from server or simulation jitter
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          setTelemetry((prev) => ({
            ...prev,
            ...data,
          }));
          return;
        }
      } catch (e) {
        // Local simulation fallback
      }

      setTelemetry((prev) => ({
        ...prev,
        temperatureC: Number((44.0 + (Math.random() * 2.5 - 1.2)).toFixed(1)),
        gpuLoadPct: Math.min(95, Math.max(20, Math.floor(prev.gpuLoadPct + (Math.random() * 8 - 4)))),
        cpuLoadPct: Math.min(90, Math.max(15, Math.floor(prev.cpuLoadPct + (Math.random() * 6 - 3)))),
        powerWattage: Number((12.2 + Math.random() * 1.5).toFixed(1)),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Live Stream Ingestion Simulator
  useEffect(() => {
    if (!isStreaming) return;

    const streamInterval = setInterval(async () => {
      const simulatedInbounds = [
        {
          subject: 'Stripe webhook failure: Signature verification failed on live checkout',
          body: 'We are noticing that incoming webhooks to https://api.trackmind.io/hooks/stripe are throwing 400 Bad Request. Customers are not receiving order confirmation receipts.',
          sender: 'Alex Chen',
          senderEmail: 'alex.chen@vortex-retail.com',
          senderCompany: 'Vortex Retail',
        },
        {
          subject: 'URGENT: Redis cache invalidation loop causing high CPU on Jetson edge',
          body: 'Our edge nodes are cycling Redis keys every 200ms. CPU usage is pegged at 98%. Please check cache TTL parameters on cluster node #4.',
          sender: 'Mireille Dupont',
          senderEmail: 'm.dupont@dataflow-analytics.fr',
          senderCompany: 'DataFlow France',
        },
        {
          subject: 'Requesting VAT refund credit on invoice #INV-77102',
          body: 'Hi Billing, our tax residency has changed to Germany. We attached our EU VAT exemption certificate and request a credit note on last month invoice.',
          sender: 'Hans Gruber',
          senderEmail: 'h.gruber@bavaria-sys.de',
          senderCompany: 'Bavaria Systems',
        },
        {
          subject: 'Loving the fast edge response! Feature idea for dark mode themes',
          body: 'Hey Trackmind Team, we implemented your edge classifier in our call center. It cut first-response times from 4 hours to 4 minutes! Could you add custom theme accents in the agent view?',
          sender: 'Priya Sharma',
          senderEmail: 'priya@delhi-telecom.in',
          senderCompany: 'Delhi Telecom Support',
        },
      ];

      const sample = simulatedInbounds[Math.floor(Math.random() * simulatedInbounds.length)];
      try {
        const newTicket = await processTicketThroughEdgePipeline({
          subject: sample.subject,
          body: sample.body,
          sender: sample.sender,
          senderEmail: sample.senderEmail,
          senderCompany: sample.senderCompany,
          targetSLM: telemetry.activeSLM,
        });

        setTickets((prev) => [newTicket, ...prev]);
        setTelemetry((prev) => ({
          ...prev,
          inferenceCount: prev.inferenceCount + 1,
        }));
        showToast(`New Inbound Ticket Ingested: ${newTicket.id} (${newTicket.classification.intent})`, 'info');
      } catch (err) {
        console.error('Failed to simulate stream ingestion:', err);
      }
    }, 16000);

    return () => clearInterval(streamInterval);
  }, [isStreaming, telemetry.activeSLM]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Human-in-the-Loop Approval Action
  const handleApproveTicket = (ticketId: string, customDraft?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const isEdited = Boolean(customDraft && customDraft.trim() !== t.draftReply.generatedDraft.trim());
          const finalDraft = customDraft || t.draftReply.generatedDraft;
          return {
            ...t,
            status: isEdited ? 'edited_and_sent' : 'approved_and_sent',
            draftReply: {
              ...t.draftReply,
              editedDraft: isEdited ? finalDraft : t.draftReply.editedDraft,
              isEdited,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Human Agent (HITL Gate)',
            },
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: isEdited ? 'Human Edited & Approved' : 'Human Approved & Dispatched',
                actor: 'Human Agent (HITL Gate)',
                details: isEdited
                  ? `Agent customized draft reply (${finalDraft.length} chars) and dispatched.`
                  : 'Auto-draft approved verbatim and dispatched via SMTP edge gateway.',
              },
            ],
          };
        }
        return t;
      })
    );

    showToast(`Ticket ${ticketId} approved & reply dispatched successfully!`, 'success');
  };

  // Escalate Action
  const handleEscalateTicket = (ticketId: string, reason: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'escalated',
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'Escalated to Tier-2 Engineering',
                actor: 'Human Agent (HITL Gate)',
                details: reason || 'Escalated for senior engineer review.',
              },
            ],
          };
        }
        return t;
      })
    );
    showToast(`Ticket ${ticketId} escalated to Tier-2 Engineering.`, 'warning');
  };

  // Reject Action
  const handleRejectTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'rejected',
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'Draft Rejected by Agent',
                actor: 'Human Agent (HITL Gate)',
                details: 'Auto-draft flagged as unsuitable for dispatch.',
              },
            ],
          };
        }
        return t;
      })
    );
    showToast(`Draft for ticket ${ticketId} rejected.`, 'info');
  };

  // Regenerate Draft with New Tone
  const handleRegenerateDraft = (ticketId: string, tone: ReplyTone) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const matchedTemplate =
            JINJA_TEMPLATES.find((tpl) => tpl.id === t.draftReply.templateId) ||
            JINJA_TEMPLATES[0];

          let rendered = renderJinjaTemplate(
            matchedTemplate.rawTemplate,
            t.draftReply.templateVariables
          );

          if (tone === 'Concise') {
            rendered = `Hello ${t.draftReply.templateVariables.customer_name},\n\nWe have received your report regarding "${t.subject}".\nOur edge systems have escalated this directly to Tier-3 support (Ref: #${ticketId}).\nWe are actively working on resolution and will follow up shortly.\n\nRegards,\nTrackmind Operations`;
          } else if (tone === 'Technical') {
            rendered += `\n\n[Diagnostic Trace Attached]:\nNode: jetson-orin-01.local\nKernel: Linux 5.15.136-tegra\nExecution Engine: llama.cpp cuBLAS INT4`;
          }

          return {
            ...t,
            draftReply: {
              ...t.draftReply,
              tone,
              generatedDraft: rendered,
              editedDraft: undefined,
              isEdited: false,
            },
            auditTrail: [
              ...t.auditTrail,
              {
                id: `aud-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: `Draft Regenerated (${tone} Tone)`,
                actor: `${t.classification.modelUsed.split(' ')[0]} Engine`,
                details: `Re-templated draft using ${matchedTemplate.filename} with ${tone} tone constraint.`,
              },
            ],
          };
        }
        return t;
      })
    );
    showToast(`Draft regenerated with ${tone} tone.`, 'info');
  };

  // Create New Custom Inbound Ticket
  const handleCreateNewTicket = async (data: {
    subject: string;
    body: string;
    sender: string;
    senderEmail: string;
    senderCompany?: string;
    targetSLM: 'Phi-3.5-mini (3.8B)' | 'Llama 3.2 (3B)';
    tone: ReplyTone;
  }) => {
    const newTicket = await processTicketThroughEdgePipeline(data);
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
    setActiveTab('inbox');
    setTelemetry((prev) => ({
      ...prev,
      inferenceCount: prev.inferenceCount + 1,
    }));
    showToast(
      `Ticket ${newTicket.id} classified: ${newTicket.classification.urgency} (${newTicket.classification.intent}) in ${newTicket.classification.edgeLatencyMs}ms!`,
      'success'
    );
  };

  // Reset to Seed
  const handleResetData = () => {
    if (window.confirm('Reset all ticket data and SQLite state back to initial seed dataset?')) {
      localStorage.removeItem('trackmind_tickets_v1');
      setTickets(INITIAL_TICKETS);
      setSelectedTicketId(INITIAL_TICKETS[0].id);
      showToast('Database reset to initial demonstration state.', 'info');
    }
  };

  // Update Hardware Settings
  const handleUpdateHardwareSettings = async (settings: {
    powerMode?: '15W Mode (MAXN)' | '7W Mode (Eco)';
    activeSLM?: 'Phi-3.5-mini (3.8B)' | 'Llama 3.2 (3B)';
    quantization?: 'INT4 (Q4_K_M)' | 'FP16';
  }) => {
    setTelemetry((prev) => ({
      ...prev,
      ...settings,
    }));

    try {
      await fetch('/api/telemetry/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (e) {
      // offline fallback
    }

    showToast('Jetson Orin Nano hardware settings updated.', 'success');
  };

  const pendingCount = tickets.filter((t) => t.status === 'pending_review').length;
  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        totalCount={tickets.length}
        telemetry={telemetry}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
        onResetData={handleResetData}
        onOpenAbstractModal={() => setIsAbstractModalOpen(true)}
      />

      {/* Main Tab Views */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'inbox' && (
          <TicketInbox
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
            onApproveTicket={handleApproveTicket}
            onEscalateTicket={handleEscalateTicket}
            onRejectTicket={handleRejectTicket}
            onRegenerateDraft={handleRegenerateDraft}
          />
        )}

        {activeTab === 'pipeline' && (
          <LangChainVisualizer
            activeTicket={activeTicket}
            allTickets={tickets}
            onSelectTicket={setSelectedTicketId}
          />
        )}

        {activeTab === 'hardware' && (
          <HardwareTelemetry
            telemetry={telemetry}
            onUpdateHardwareSettings={handleUpdateHardwareSettings}
          />
        )}

        {activeTab === 'sqlite' && <SqliteInspector tickets={tickets} />}

        {activeTab === 'templates' && <JinjaStudio />}

        {activeTab === 'abstract' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <AbstractModal isOpen={true} onClose={() => setActiveTab('inbox')} />
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-medium ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/50'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/95 text-amber-300 border-amber-500/50'
                : 'bg-slate-900/95 text-cyan-300 border-cyan-500/50'
            }`}
          >
            {toastMessage.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {toastMessage.type === 'warning' && (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSubmitTicket={handleCreateNewTicket}
        currentSLM={telemetry.activeSLM}
      />

      {activeTab !== 'abstract' && (
        <AbstractModal
          isOpen={isAbstractModalOpen}
          onClose={() => setIsAbstractModalOpen(false)}
        />
      )}
    </div>
  );
}
