import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gemini SDK on server-side if key is available
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Telemetry state simulation for NVIDIA Jetson Orin Nano
let hardwareState = {
  powerMode: '15W Mode (MAXN)',
  activeSLM: 'Phi-3.5-mini (3.8B)',
  quantization: 'INT4 (Q4_K_M)',
  temperatureC: 44.2,
  gpuLoadPct: 38,
  cpuLoadPct: 24,
  memoryUsedMB: 3480,
  memoryTotalMB: 8192,
  slmWeightsVRAM_MB: 2450,
  powerWattage: 12.4,
  tokensPerSec: 26.4,
  inferenceCount: 142,
};

// API: Jetson Orin Nano Hardware Telemetry
app.get('/api/telemetry', (req, res) => {
  // Add realistic small jitter to mimic live hardware sensors
  const jitterTemp = Number((44.0 + (Math.random() * 3.5 - 1.5)).toFixed(1));
  const jitterGpu = Math.min(98, Math.max(15, Math.floor(hardwareState.gpuLoadPct + (Math.random() * 12 - 6))));
  const jitterCpu = Math.min(95, Math.max(12, Math.floor(hardwareState.cpuLoadPct + (Math.random() * 8 - 4))));
  const jitterWatts = Number((11.8 + Math.random() * 2.2).toFixed(1));

  res.json({
    ...hardwareState,
    temperatureC: jitterTemp,
    gpuLoadPct: jitterGpu,
    cpuLoadPct: jitterCpu,
    powerWattage: jitterWatts,
    timestamp: new Date().toISOString(),
  });
});

// API: Update hardware settings (power mode, SLM model)
app.post('/api/telemetry/settings', (req, res) => {
  const { powerMode, activeSLM, quantization } = req.body;
  if (powerMode) hardwareState.powerMode = powerMode;
  if (activeSLM) hardwareState.activeSLM = activeSLM;
  if (quantization) hardwareState.quantization = quantization;
  res.json({ success: true, hardwareState });
});

// API: Process incoming email / ticket through zero-shot classification and draft generation
app.post('/api/classify-and-draft', async (req, res) => {
  const { subject, body, sender, targetSLM, tonePreference } = req.body;

  if (!subject && !body) {
    return res.status(400).json({ error: 'Subject or body is required' });
  }

  const startTime = Date.now();
  hardwareState.inferenceCount += 1;

  // If Gemini is available on server, use gemini-3.8-flash with structured schema
  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an edge-deployed language model (${targetSLM || 'Phi-3.5-mini / Llama 3.2 3B'}) running on an NVIDIA Jetson Orin Nano.
Your task is:
1. Zero-shot intent classification into one of: 'Billing & Invoicing', 'Technical Bug / Outage', 'Account Access & Security', 'Feature Request', 'Cancellation & Churn', 'General Inquiry', 'Integration & API'.
2. Urgency classification: 'Critical', 'High', 'Medium', or 'Low' with a brief justification.
3. Sentiment analysis: 'Frustrated / Angry', 'Urgent / Anxious', 'Neutral / Factual', or 'Satisfied / Positive', plus a sentiment score from -1.0 to 1.0.
4. Extract key entities (customerName, accountId, errorCodes, productMentioned, deadline, amount, systemInfo).
5. Generate a high quality context-aware draft reply (formatted like a Jinja2 rendered template) ready for human approval. Tone: ${tonePreference || 'Empathetic and Professional'}.

Incoming Message Details:
Sender: ${sender || 'Unknown Customer'}
Subject: ${subject}
Message Body:
${body}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: {
                type: Type.STRING,
                description: 'Classified intent category',
              },
              urgency: {
                type: Type.STRING,
                description: 'Urgency rating: Critical, High, Medium, Low',
              },
              urgencyReason: {
                type: Type.STRING,
                description: 'Why this urgency was assigned',
              },
              sentiment: {
                type: Type.STRING,
                description: 'Overall sentiment category',
              },
              sentimentScore: {
                type: Type.NUMBER,
                description: 'Float between -1.0 and 1.0',
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: 'Confidence between 0.0 and 1.0',
              },
              entities: {
                type: Type.OBJECT,
                properties: {
                  customerName: { type: Type.STRING },
                  accountId: { type: Type.STRING },
                  errorCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  productMentioned: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  amount: { type: Type.STRING },
                },
              },
              templateUsed: {
                type: Type.STRING,
                description: 'Jinja2 template filename used (e.g. outage_investigation.j2)',
              },
              generatedDraft: {
                type: Type.STRING,
                description: 'The polished, context-aware draft reply ready for customer dispatch',
              },
              recommendedAction: {
                type: Type.STRING,
                description: 'Recommended next step for human agent',
              },
            },
            required: [
              'intent',
              'urgency',
              'urgencyReason',
              'sentiment',
              'sentimentScore',
              'confidenceScore',
              'templateUsed',
              'generatedDraft',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const latencyMs = Date.now() - startTime;

      return res.json({
        success: true,
        source: 'server-gemini-cloud-engine',
        modelUsed: targetSLM || 'Phi-3.5-mini (Edge Pipeline via Jetson Orchestrator)',
        latencyMs,
        tokensPerSec: Number((180 / (latencyMs / 1000)).toFixed(1)),
        result: parsed,
      });
    } catch (err: any) {
      console.warn('Gemini server call failed or quota exceeded, falling back to edge SLM engine:', err?.message);
    }
  }

  // Edge SLM Deterministic & Context Engine Fallback
  // Emulates Phi-3.5-mini / Llama 3.2 3B zero-shot logic on Jetson Orin Nano
  const combinedText = `${subject} ${body}`.toLowerCase();

  let intent = 'General Inquiry';
  let urgency = 'Low';
  let urgencyReason = 'Standard inquiry requiring normal SLA turnaround.';
  let sentiment = 'Neutral / Factual';
  let sentimentScore = 0.05;
  let confidenceScore = 0.92;
  let templateUsed = 'general_resolution.j2';
  let recommendedAction = 'Review draft reply and dispatch to user.';

  if (
    combinedText.includes('down') ||
    combinedText.includes('outage') ||
    combinedText.includes('crash') ||
    combinedText.includes('500') ||
    combinedText.includes('production') ||
    combinedText.includes('offline') ||
    combinedText.includes('broken')
  ) {
    intent = 'Technical Bug / Outage';
    urgency = combinedText.includes('production') || combinedText.includes('down') ? 'Critical' : 'High';
    urgencyReason = 'Production service impairment or blocker reported by customer.';
    sentiment = 'Urgent / Anxious';
    sentimentScore = -0.65;
    confidenceScore = 0.97;
    templateUsed = 'production_outage.j2';
    recommendedAction = 'Verify system status dashboard, confirm incident response, and dispatch draft.';
  } else if (
    combinedText.includes('refund') ||
    combinedText.includes('billing') ||
    combinedText.includes('charged') ||
    combinedText.includes('invoice') ||
    combinedText.includes('credit card') ||
    combinedText.includes('payment')
  ) {
    intent = 'Billing & Invoicing';
    urgency = combinedText.includes('double') || combinedText.includes('unauthorized') ? 'High' : 'Medium';
    urgencyReason = 'Payment or charge discrepancy requiring financial records audit.';
    sentiment = 'Frustrated / Angry';
    sentimentScore = -0.45;
    confidenceScore = 0.94;
    templateUsed = 'billing_dispute.j2';
    recommendedAction = 'Verify transaction ID in payment gateway before approving refund terms.';
  } else if (
    combinedText.includes('cancel') ||
    combinedText.includes('churn') ||
    combinedText.includes('unsubscribe') ||
    combinedText.includes('leave') ||
    combinedText.includes('competitor')
  ) {
    intent = 'Cancellation & Churn';
    urgency = 'High';
    urgencyReason = 'Active customer expressing retention or cancellation risk.';
    sentiment = 'Frustrated / Angry';
    sentimentScore = -0.72;
    confidenceScore = 0.95;
    templateUsed = 'churn_mitigation.j2';
    recommendedAction = 'Customer Success Lead review recommended with retention concession.';
  } else if (
    combinedText.includes('locked') ||
    combinedText.includes('password') ||
    combinedText.includes('2fa') ||
    combinedText.includes('access') ||
    combinedText.includes('login') ||
    combinedText.includes('mfa')
  ) {
    intent = 'Account Access & Security';
    urgency = 'High';
    urgencyReason = 'User blocked from accessing account resources.';
    sentiment = 'Urgent / Anxious';
    sentimentScore = -0.3;
    confidenceScore = 0.96;
    templateUsed = 'account_recovery.j2';
    recommendedAction = 'Confirm identity verification before resetting 2FA credentials.';
  } else if (
    combinedText.includes('api') ||
    combinedText.includes('webhook') ||
    combinedText.includes('sdk') ||
    combinedText.includes('endpoint') ||
    combinedText.includes('payload')
  ) {
    intent = 'Integration & API';
    urgency = 'Medium';
    urgencyReason = 'Developer API questions or payload integration assistance.';
    sentiment = 'Neutral / Factual';
    sentimentScore = 0.1;
    confidenceScore = 0.93;
    templateUsed = 'api_integration.j2';
    recommendedAction = 'Provide code snippet and developer documentation link.';
  } else if (
    combinedText.includes('feature') ||
    combinedText.includes('would like') ||
    combinedText.includes('suggest') ||
    combinedText.includes('roadmap') ||
    combinedText.includes('enhancement')
  ) {
    intent = 'Feature Request';
    urgency = 'Low';
    urgencyReason = 'Product feedback and feature idea logged for product team.';
    sentiment = 'Satisfied / Positive';
    sentimentScore = 0.55;
    confidenceScore = 0.91;
    templateUsed = 'feature_roadmap.j2';
    recommendedAction = 'Acknowledge suggestion and log ticket in internal product backlog.';
  }

  // Simulate on-device Jetson Orin Nano latency (300ms - 800ms)
  const simulatedDelayMs = 380 + Math.floor(Math.random() * 250);
  await new Promise((resolve) => setTimeout(resolve, simulatedDelayMs));

  const customerName = sender?.split('@')[0] || 'Customer';
  const generatedDraft = `Hello ${customerName},

Thank you for contacting our support team regarding "${subject}".

We have received your request and our automated edge intelligence system has prioritized this as ${urgency} priority under our ${intent} queue.

Our engineering and support team has already been notified and is currently reviewing the details provided. We are actively working to resolve this and will follow up with you directly within our designated SLA timeframe.

If you have any supplementary error logs or transaction identifiers to share, please reply directly to this email.

Best regards,
Support Operations Team
Trackmind Automated Edge Response Unit`;

  res.json({
    success: true,
    source: 'edge-jetson-orin-slm-emulator',
    modelUsed: targetSLM || hardwareState.activeSLM,
    latencyMs: simulatedDelayMs,
    tokensPerSec: Number((hardwareState.tokensPerSec + (Math.random() * 2 - 1)).toFixed(1)),
    result: {
      intent,
      urgency,
      urgencyReason,
      sentiment,
      sentimentScore,
      confidenceScore,
      entities: {
        customerName,
        productMentioned: 'Core Platform',
      },
      templateUsed,
      generatedDraft,
      recommendedAction,
    },
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Trackmind Edge Classifier Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
