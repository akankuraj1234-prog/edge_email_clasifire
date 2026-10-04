export type UrgencyLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type IntentCategory =
  | 'Billing & Invoicing'
  | 'Technical Bug / Outage'
  | 'Account Access & Security'
  | 'Feature Request'
  | 'Cancellation & Churn'
  | 'General Inquiry'
  | 'Integration & API';

export type SentimentCategory =
  | 'Frustrated / Angry'
  | 'Urgent / Anxious'
  | 'Neutral / Factual'
  | 'Satisfied / Positive';

export type TicketStatus =
  | 'pending_review'
  | 'approved_and_sent'
  | 'edited_and_sent'
  | 'escalated'
  | 'rejected';

export type ReplyTone =
  | 'Empathetic'
  | 'Technical'
  | 'Concise'
  | 'Formal'
  | 'Conciliatory';

export interface ExtractedEntities {
  customerName?: string;
  accountId?: string;
  productMentioned?: string;
  errorCodes?: string[];
  amount?: string;
  deadline?: string;
  systemEnvironment?: string;
}

export interface ClassificationResult {
  intent: IntentCategory;
  urgency: UrgencyLevel;
  urgencyReason: string;
  sentiment: SentimentCategory;
  sentimentScore: number; // -1.0 to +1.0
  confidenceScore: number; // 0.0 to 1.0
  entities: ExtractedEntities;
  edgeLatencyMs: number;
  modelUsed: string;
  tokensPerSec: number;
  recommendedAction: string;
  pipelineStagesCompleted: string[];
}

export interface DraftReply {
  id: string;
  templateId: string;
  templateName: string;
  tone: ReplyTone;
  generatedDraft: string;
  editedDraft?: string;
  templateVariables: Record<string, string>;
  isEdited: boolean;
  humanFeedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface Ticket {
  id: string;
  sqliteRowId: number;
  subject: string;
  sender: string;
  senderEmail: string;
  senderCompany?: string;
  channel: 'Email' | 'Support Portal' | 'Webhook API' | 'Live Ingest';
  receivedAt: string;
  body: string;
  status: TicketStatus;
  classification: ClassificationResult;
  draftReply: DraftReply;
  auditTrail: AuditLogItem[];
}

export interface EdgeTelemetry {
  deviceName: string;
  soc: string;
  gpu: string;
  activeSLM: 'Phi-3.5-mini (3.8B)' | 'Llama 3.2 (3B)';
  quantization: 'INT4 (Q4_K_M)' | 'FP16';
  powerMode: '15W Mode (MAXN)' | '7W Mode (Eco)';
  temperatureC: number;
  gpuLoadPct: number;
  cpuLoadPct: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  slmWeightsVRAM_MB: number;
  powerWattage: number;
  tokensPerSec: number;
  inferenceCount: number;
  offlineMode: boolean;
}

export interface JinjaTemplateDef {
  id: string;
  name: string;
  intentMatch: IntentCategory;
  filename: string;
  rawTemplate: string;
  description: string;
  variables: string[];
}

export interface PipelineExecutionTrace {
  ticketId: string;
  startedAt: string;
  durationMs: number;
  steps: {
    stepNumber: number;
    stepName: string;
    subsystem: 'Ingestion' | 'LangChain' | 'SLM Inference' | 'Jinja2' | 'SQLite' | 'HITL';
    status: 'completed' | 'running' | 'idle' | 'failed';
    durationMs: number;
    inputData: string;
    outputData: string;
  }[];
}
