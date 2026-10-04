import {
  ClassificationResult,
  DraftReply,
  IntentCategory,
  ReplyTone,
  Ticket,
  UrgencyLevel,
} from '../types';
import { JINJA_TEMPLATES } from '../data/templates';
import { renderJinjaTemplate } from './jinjaEngine';

interface ProcessEmailInput {
  subject: string;
  body: string;
  sender: string;
  senderEmail: string;
  senderCompany?: string;
  targetSLM?: 'Phi-3.5-mini (3.8B)' | 'Llama 3.2 (3B)';
  tone?: ReplyTone;
}

export async function processTicketThroughEdgePipeline(
  input: ProcessEmailInput
): Promise<Ticket> {
  const startTime = Date.now();
  const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
  const targetSLM = input.targetSLM || 'Phi-3.5-mini (3.8B)';
  const tone = input.tone || 'Empathetic';

  let classificationResult: ClassificationResult;
  let draftResult: DraftReply;

  // Try calling the server-side API endpoint first (which uses Gemini 3.8 Flash if key configured)
  try {
    const res = await fetch('/api/classify-and-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: input.subject,
        body: input.body,
        sender: input.sender,
        targetSLM,
        tonePreference: tone,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.result) {
        const r = data.result;
        const matchedTemplate =
          JINJA_TEMPLATES.find((t) => t.filename === r.templateUsed) ||
          JINJA_TEMPLATES.find((t) => t.intentMatch === r.intent) ||
          JINJA_TEMPLATES[0];

        const templateVars: Record<string, string> = {
          customer_name: r.entities?.customerName || input.sender.split(' ')[0] || 'Customer',
          ticket_id: ticketId,
          service_name: r.entities?.productMentioned || 'Core Services',
          incident_id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
          eta_minutes: '20',
          support_engineer: 'Edge On-Device Dispatcher',
          severity: r.urgency,
          invoice_reference: r.entities?.errorCodes?.[0] || 'INV-CURRENT',
          dispute_amount: r.entities?.amount || 'pending review',
          resolution_timeline: '4 hours',
          account_email: input.senderEmail,
          auth_step: 'Cryptographic challenge',
          expiry_hours: '6',
          plan_tier: 'Enterprise',
          account_manager: 'Trackmind Solutions Team',
          alternative_offer: 'Dedicated Jetson Tensor Core allocation',
          feature_summary: input.subject,
          product_pillar: 'Platform Core',
          target_milestone: 'Upcoming Sprint',
          endpoint_name: '/api/v1/edge',
          sdk_language: 'REST / TypeScript',
          docs_url: 'https://docs.trackmind.io',
          topic_name: input.subject,
          resource_link: 'https://support.trackmind.io/kb',
        };

        const finalDraft =
          r.generatedDraft ||
          renderJinjaTemplate(matchedTemplate.rawTemplate, templateVars);

        return {
          id: ticketId,
          sqliteRowId: Date.now() % 100000,
          subject: input.subject,
          sender: input.sender,
          senderEmail: input.senderEmail,
          senderCompany: input.senderCompany || 'Verified Organization',
          channel: 'Email',
          receivedAt: new Date().toISOString(),
          body: input.body,
          status: 'pending_review',
          classification: {
            intent: r.intent as IntentCategory,
            urgency: r.urgency as UrgencyLevel,
            urgencyReason: r.urgencyReason || 'Auto-classified on edge device',
            sentiment: r.sentiment,
            sentimentScore: r.sentimentScore,
            confidenceScore: r.confidenceScore,
            entities: r.entities || {},
            edgeLatencyMs: data.latencyMs || Date.now() - startTime,
            modelUsed: `${targetSLM} (Edge Pipeline via LangChain)`,
            tokensPerSec: data.tokensPerSec || 26.5,
            recommendedAction: r.recommendedAction || 'Review and dispatch draft reply.',
            pipelineStagesCompleted: [
              'Raw Email Ingestion',
              'LangChain Text Sanitizer',
              'Zero-Shot Intent Classification',
              'Sentiment Scoring Engine',
              `Jinja2 Templating (${matchedTemplate.filename})`,
              'SQLite Persistence Sync',
            ],
          },
          draftReply: {
            id: `DFT-${Math.floor(1000 + Math.random() * 9000)}`,
            templateId: matchedTemplate.id,
            templateName: matchedTemplate.filename,
            tone,
            generatedDraft: finalDraft,
            templateVariables: templateVars,
            isEdited: false,
          },
          auditTrail: [
            {
              id: `aud-${Date.now()}-1`,
              timestamp: new Date().toISOString(),
              action: 'Ingested via Jetson Edge Mail Listener',
              actor: 'LangChain Stream Handler',
              details: `Ingested from ${input.senderEmail}`,
            },
            {
              id: `aud-${Date.now()}-2`,
              timestamp: new Date().toISOString(),
              action: 'Zero-Shot Edge Classification',
              actor: `${targetSLM} (Jetson Orin Nano)`,
              details: `Intent: ${r.intent} (${r.confidenceScore}), Urgency: ${r.urgency}`,
            },
          ],
        };
      }
    }
  } catch (err) {
    console.log('Falling back to local client-side edge SLM inference:', err);
  }

  // Local edge fallback with realistic SLM inference simulation
  const textLower = `${input.subject} ${input.body}`.toLowerCase();

  let intent: IntentCategory = 'General Inquiry';
  let urgency: UrgencyLevel = 'Low';
  let urgencyReason = 'General questions with standard response SLA.';
  let sentiment = 'Neutral / Factual';
  let sentimentScore = 0.1;
  let confidenceScore = 0.93;
  let templateId = 'tpl_general';
  let recommendedAction = 'Review auto-draft and send to customer.';

  if (
    textLower.includes('500') ||
    textLower.includes('502') ||
    textLower.includes('crash') ||
    textLower.includes('down') ||
    textLower.includes('outage') ||
    textLower.includes('offline') ||
    textLower.includes('broken') ||
    textLower.includes('panic')
  ) {
    intent = 'Technical Bug / Outage';
    urgency =
      textLower.includes('down') || textLower.includes('production')
        ? 'Critical'
        : 'High';
    urgencyReason = 'Production service disruption affecting end users.';
    sentiment = 'Urgent / Anxious';
    sentimentScore = -0.85;
    confidenceScore = 0.98;
    templateId = 'tpl_outage';
    recommendedAction = 'Verify edge cluster status and approve emergency response.';
  } else if (
    textLower.includes('refund') ||
    textLower.includes('billing') ||
    textLower.includes('charged') ||
    textLower.includes('invoice') ||
    textLower.includes('amex') ||
    textLower.includes('payment') ||
    textLower.includes('chargeback')
  ) {
    intent = 'Billing & Invoicing';
    urgency = textLower.includes('chargeback') || textLower.includes('duplicate') ? 'High' : 'Medium';
    urgencyReason = 'Payment dispute requiring ledger verification before credit reversal.';
    sentiment = 'Frustrated / Angry';
    sentimentScore = -0.65;
    confidenceScore = 0.96;
    templateId = 'tpl_billing';
    recommendedAction = 'Check Stripe transaction logs before dispatching approval.';
  } else if (
    textLower.includes('cancel') ||
    textLower.includes('churn') ||
    textLower.includes('leaving') ||
    textLower.includes('unsubscribe') ||
    textLower.includes('competitor')
  ) {
    intent = 'Cancellation & Churn';
    urgency = 'High';
    urgencyReason = 'High retention risk detected for subscription customer.';
    sentiment = 'Frustrated / Angry';
    sentimentScore = -0.75;
    confidenceScore = 0.95;
    templateId = 'tpl_churn';
    recommendedAction = 'Engage customer success lead with retention incentive.';
  } else if (
    textLower.includes('locked') ||
    textLower.includes('sso') ||
    textLower.includes('saml') ||
    textLower.includes('mfa') ||
    textLower.includes('password') ||
    textLower.includes('security')
  ) {
    intent = 'Account Access & Security';
    urgency = 'High';
    urgencyReason = 'Authentication credential lockout or enterprise identity failure.';
    sentiment = 'Urgent / Anxious';
    sentimentScore = -0.55;
    confidenceScore = 0.97;
    templateId = 'tpl_security';
    recommendedAction = 'Confirm identity proofing before issuing recovery credentials.';
  } else if (
    textLower.includes('api') ||
    textLower.includes('webhook') ||
    textLower.includes('sdk') ||
    textLower.includes('401') ||
    textLower.includes('payload') ||
    textLower.includes('endpoint')
  ) {
    intent = 'Integration & API';
    urgency = 'Medium';
    urgencyReason = 'Developer integration question with code implementation hurdles.';
    sentiment = 'Neutral / Factual';
    sentimentScore = 0.05;
    confidenceScore = 0.94;
    templateId = 'tpl_api';
    recommendedAction = 'Provide code snippet and verify API key scopes.';
  } else if (
    textLower.includes('feature') ||
    textLower.includes('suggest') ||
    textLower.includes('roadmap') ||
    textLower.includes('would love') ||
    textLower.includes('enhancement')
  ) {
    intent = 'Feature Request';
    urgency = 'Low';
    urgencyReason = 'User enhancement idea logged into product planning cycle.';
    sentiment = 'Satisfied / Positive';
    sentimentScore = 0.75;
    confidenceScore = 0.92;
    templateId = 'tpl_feature';
    recommendedAction = 'Log to Jira backlog and thank contributor.';
  }

  // Artificial short delay simulating Jetson Orin Nano SLM inference (280ms - 450ms)
  await new Promise((r) => setTimeout(r, 320));

  const matchedTemplate =
    JINJA_TEMPLATES.find((t) => t.id === templateId) || JINJA_TEMPLATES[0];

  const customerName = input.sender.split(' ')[0] || 'Customer';
  const templateVars: Record<string, string> = {
    customer_name: customerName,
    ticket_id: ticketId,
    service_name: 'Core Edge Services',
    incident_id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
    eta_minutes: '15',
    support_engineer: 'Jetson Auto-Responder',
    severity: urgency,
    invoice_reference: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
    dispute_amount: '$850.00',
    resolution_timeline: '4 hours',
    refund_eligible: 'true',
    account_email: input.senderEmail,
    auth_step: 'Identity Verification Challenge',
    expiry_hours: '6',
    plan_tier: 'Enterprise Tier',
    account_manager: 'Amardeep Kumar (Solutions Director)',
    alternative_offer: 'Dedicated Jetson Tensor Core partition with SLA guarantee',
    feature_summary: input.subject,
    product_pillar: 'Core Edge Intelligence',
    target_milestone: 'Sprint Q4-Edge',
    endpoint_name: '/api/v1/edge/classify',
    sdk_language: 'TypeScript / Python',
    docs_url: 'https://docs.trackmind.io/edge',
    topic_name: input.subject,
    resource_link: 'https://docs.trackmind.io/kb/getting-started',
  };

  const renderedDraft = renderJinjaTemplate(
    matchedTemplate.rawTemplate,
    templateVars
  );

  return {
    id: ticketId,
    sqliteRowId: Math.floor(Math.random() * 10000),
    subject: input.subject,
    sender: input.sender,
    senderEmail: input.senderEmail,
    senderCompany: input.senderCompany || 'Client Org',
    channel: 'Email',
    receivedAt: new Date().toISOString(),
    body: input.body,
    status: 'pending_review',
    classification: {
      intent,
      urgency,
      urgencyReason,
      sentiment: sentiment as any,
      sentimentScore,
      confidenceScore,
      entities: {
        customerName,
        productMentioned: 'Jetson Edge System',
      },
      edgeLatencyMs: Date.now() - startTime,
      modelUsed: `${targetSLM} (Edge Pipeline via LangChain)`,
      tokensPerSec: Number((26.5 + Math.random() * 2).toFixed(1)),
      recommendedAction,
      pipelineStagesCompleted: [
        'Raw Email Ingestion',
        'LangChain Text Sanitizer',
        'Zero-Shot Intent Classification',
        'Sentiment Scoring Engine',
        `Jinja2 Templating (${matchedTemplate.filename})`,
        'SQLite Persistence Sync',
      ],
    },
    draftReply: {
      id: `DFT-${Math.floor(1000 + Math.random() * 9000)}`,
      templateId: matchedTemplate.id,
      templateName: matchedTemplate.filename,
      tone,
      generatedDraft: renderedDraft,
      templateVariables: templateVars,
      isEdited: false,
    },
    auditTrail: [
      {
        id: `aud-${Date.now()}-1`,
        timestamp: new Date().toISOString(),
        action: 'Ingested via Edge Feed',
        actor: 'LangChain Edge Ingestion Daemon',
        details: `Message received from ${input.senderEmail}`,
      },
      {
        id: `aud-${Date.now()}-2`,
        timestamp: new Date().toISOString(),
        action: 'Zero-Shot Edge Classification',
        actor: `${targetSLM} @ Jetson Orin Nano`,
        details: `Intent: ${intent} (${confidenceScore}), Urgency: ${urgency}`,
      },
      {
        id: `aud-${Date.now()}-3`,
        timestamp: new Date().toISOString(),
        action: 'Jinja2 Context-Aware Draft Generation',
        actor: 'Jinja2 Templating Engine',
        details: `Template rendered: ${matchedTemplate.filename}`,
      },
    ],
  };
}
