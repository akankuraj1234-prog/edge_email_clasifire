import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Cpu,
  Mail,
  FileText,
  Sliders,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ReplyTone } from '../types';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTicket: (data: {
    subject: string;
    body: string;
    sender: string;
    senderEmail: string;
    senderCompany?: string;
    targetSLM: 'Phi-3.5-mini (3.8B)' | 'Llama 3.2 (3B)';
    tone: ReplyTone;
  }) => Promise<void>;
  currentSLM: 'Phi-3.5-mini (3.8B)' | 'Llama 3.2 (3B)';
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmitTicket,
  currentSLM,
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sender, setSender] = useState('Sarah Jenkins');
  const [senderEmail, setSenderEmail] = useState('s.jenkins@vertex-biotech.com');
  const [senderCompany, setSenderCompany] = useState('Vertex BioTech Labs');
  const [targetSLM, setTargetSLM] = useState<'Phi-3.5-mini (3.8B)' | 'Llama 3.2 (3B)'>(currentSLM);
  const [tone, setTone] = useState<ReplyTone>('Empathetic');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Production Outage',
      badge: 'Critical',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      subject: 'URGENT: Entire production database replica failing health checks with 500 error',
      sender: 'Carlos Mendez',
      senderEmail: 'carlos.m@finix-pay.org',
      company: 'Finix Payments',
      body: `Hey Support,

Since 06:15 UTC our primary API workers have been dropping incoming connections. We are getting consecutive HTTP 500 Internal Server Errors with message:
"Fatal: Connection pool exhausted (max_connections=500 reached)".

This is impacting over 3,000 live checkout sessions on Black Friday. We need an immediate failover or connection pool expansion.

Carlos Mendez
Lead Site Reliability Engineer`,
    },
    {
      title: 'Billing Dispute',
      badge: 'High',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      subject: 'Double charge of $899 on our invoice #INV-9921',
      sender: 'Rachel Zhao',
      senderEmail: 'rzhao@solaris-robotics.com',
      company: 'Solaris Robotics',
      body: `Hi Accounts team,

Our credit card was billed twice for $899.00 on invoice #INV-9921 on October 3rd. We only have 1 active seat license.

Please refund the duplicate transaction of $899 immediately or we will have to report this unauthorized charge to Chase.

Thank you,
Rachel Zhao`,
    },
    {
      title: 'Feature Idea',
      badge: 'Low',
      badgeColor: 'text-slate-300 bg-slate-700/50 border-slate-600',
      subject: 'Would love to see Dark Mode and Export to PDF in analytics tab',
      sender: 'Tobias Fünke',
      senderEmail: 'tobias@blueman.org',
      company: 'Blue Group',
      body: `Hi Trackmind,

The edge monitoring speed on Jetson is blazing fast! Would it be possible to add a one-click Export to PDF button for weekly SLA compliance reports?

Our executive team wants to present these metrics at our monthly board reviews.

Best,
Tobias`,
    },
    {
      title: 'Churn Threat',
      badge: 'High',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      subject: 'Considering cancelling our enterprise contract due to missing SSO features',
      sender: 'Vikram Seth',
      senderEmail: 'vikram@omnicorp.in',
      company: 'OmniCorp India',
      body: `Hello Support,

Our security auditors have mandated SAML 2.0 SSO and SCIM provisioning for all SaaS vendors. Without automated user provisioning, our IT department cannot justify renewing our $24,000 annual contract next month.

If this is not on the immediate 30-day roadmap, please send us instructions to terminate our contract without penalties.

Vikram Seth
CISO, OmniCorp`,
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setSubject(p.subject);
    setBody(p.body);
    setSender(p.sender);
    setSenderEmail(p.senderEmail);
    setSenderCompany(p.company);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    setIsProcessing(true);
    try {
      await onSubmitTicket({
        subject,
        body,
        sender,
        senderEmail,
        senderCompany,
        targetSLM,
        tone,
      });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Simulate Inbound Ticket Ingestion
              </h2>
              <p className="text-[11px] text-slate-400">
                Pipes message directly into the NVIDIA Jetson Orin Nano zero-shot pipeline
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick Presets Bar */}
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
              Quick Test Scenarios (Click to Load):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg p-2 text-left transition flex flex-col justify-between"
                >
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border inline-block w-fit mb-1 ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                  <span className="font-semibold text-slate-200 text-[11px] truncate">
                    {p.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sender & Email Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Sender Name:</label>
              <input
                type="text"
                required
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Sender Email:</label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Company / Org:</label>
              <input
                type="text"
                value={senderCompany}
                onChange={(e) => setSenderCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Email / Ticket Subject:</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. CRITICAL: Production Database Replica Down"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Message Body:</label>
            <textarea
              rows={5}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste raw email body here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500 resize-y"
            />
          </div>

          {/* Hardware & Generation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Target Edge SLM:</label>
              <select
                value={targetSLM}
                onChange={(e) => setTargetSLM(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Phi-3.5-mini (3.8B)">Phi-3.5-mini (3.8B) - Default</option>
                <option value="Llama 3.2 (3B)">Llama 3.2 (3B) - Meta</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Initial Draft Tone:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Empathetic">Empathetic</option>
                <option value="Technical">Technical</option>
                <option value="Concise">Concise</option>
                <option value="Formal">Formal</option>
                <option value="Conciliatory">Conciliatory</option>
              </select>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing on Jetson Orin...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Ingest & Run Edge SLM Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
