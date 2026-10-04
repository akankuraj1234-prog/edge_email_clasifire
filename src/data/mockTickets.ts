import { Ticket } from '../types';

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TCK-8091',
    sqliteRowId: 1,
    subject: 'CRITICAL: Production API returning 502 Bad Gateway across all US-East nodes',
    sender: 'DevOps Lead Marcus Vance',
    senderEmail: 'm.vance@cloudscale-fintech.io',
    senderCompany: 'CloudScale FinTech Inc.',
    channel: 'Email',
    receivedAt: '2026-10-04T13:14:22Z',
    body: `Hey Team,

Our entire checkout microservice is paralyzed right now. Since 13:05 UTC, all calls to https://api.trackmind.io/v2/transactions are throwing HTTP 502 Bad Gateway and upstream connection drops.

Over 1,400 customers are stuck at the checkout payment modal. We are losing approximately $12,000 in transaction volume every 10 minutes.

We need immediate eyes on the US-East edge cluster. Is there an active incident or database connection pool starvation? Paging your SRE team right away.

Marcus Vance
Staff Platform Reliability Engineer`,
    status: 'pending_review',
    classification: {
      intent: 'Technical Bug / Outage',
      urgency: 'Critical',
      urgencyReason: 'Active production system outage affecting transaction processing and revenue-critical workflows.',
      sentiment: 'Urgent / Anxious',
      sentimentScore: -0.88,
      confidenceScore: 0.98,
      entities: {
        customerName: 'Marcus Vance',
        productMentioned: 'Transactions API v2 (US-East Cluster)',
        errorCodes: ['502 Bad Gateway', 'Upstream Connection Drop'],
        deadline: 'Immediate (Active Financial Impact)',
        systemEnvironment: 'Production US-East-1',
      },
      edgeLatencyMs: 342,
      modelUsed: 'Phi-3.5-mini (3.8B INT4 quantized)',
      tokensPerSec: 27.2,
      recommendedAction: 'Verify Jetson edge cluster metrics, confirm SRE incident page, and approve emergency incident draft.',
      pipelineStagesCompleted: [
        'Raw Email Ingestion',
        'LangChain Text Cleaning',
        'Zero-Shot Intent Classification',
        'Sentiment Scoring Engine',
        'Entity Tagging',
        'Jinja2 Templating (production_outage.j2)',
        'SQLite Sync (Row #1)',
      ],
    },
    draftReply: {
      id: 'DFT-9001',
      templateId: 'tpl_outage',
      templateName: 'production_outage.j2',
      tone: 'Empathetic',
      isEdited: false,
      templateVariables: {
        customer_name: 'Marcus Vance',
        ticket_id: 'TCK-8091',
        service_name: 'Transactions API v2 (US-East)',
        incident_id: 'INC-7729',
        eta_minutes: '15',
        support_engineer: 'Kalpa Pandit (AI Edge Monitor Lead)',
        severity: 'Critical',
      },
      generatedDraft: `Hello Marcus,

Thank you for reporting this issue (Ticket #TCK-8091).

Our edge monitoring systems have confirmed your report regarding Transactions API v2 (US-East). An active investigation has been initiated under Incident Reference #INC-7729.

Our Tier-3 Site Reliability Engineering team has been paged and is actively working on service restoration.
Current Estimated Resolution Window: 15 minutes.

We will provide another status update as soon as the deployment verification completes. You can track live telemetry on our edge status board.

Sincerely,
Kalpa Pandit (AI Edge Monitor Lead)
Edge Operations Incident Response Team
Trackmind Automated Jetson Node`,
    },
    auditTrail: [
      {
        id: 'aud-1',
        timestamp: '2026-10-04T13:14:23Z',
        action: 'Ingested via IMAP Email Listener',
        actor: 'LangChain Edge Ingestion Daemon',
        details: 'Raw MIME multipart parsed, hash SHA256: 9b2d... validated.',
      },
      {
        id: 'aud-2',
        timestamp: '2026-10-04T13:14:24Z',
        action: 'Zero-Shot Edge Classification',
        actor: 'Phi-3.5-mini @ Jetson Orin Nano',
        details: 'Classified: Technical Bug / Outage (0.98), Urgency: Critical in 342ms.',
      },
      {
        id: 'aud-3',
        timestamp: '2026-10-04T13:14:25Z',
        action: 'Jinja2 Auto-Draft Compilation',
        actor: 'Jinja2 Templating Engine',
        details: 'Merged production_outage.j2 with incident INC-7729 variables into SQLite.',
      },
    ],
  },
  {
    id: 'TCK-8092',
    sqliteRowId: 2,
    subject: 'Unexplained charge of $1,490 on our corporate AMEX (Invoice INV-88219)',
    sender: 'Elena Rostova',
    senderEmail: 'e.rostova@hyperion-logistics.de',
    senderCompany: 'Hyperion Logistics GmbH',
    channel: 'Support Portal',
    receivedAt: '2026-10-04T12:45:10Z',
    body: `Hello,

Our finance team just audited this month's statements and noticed a duplicate deduction of $1,490.00 processed on October 2nd under invoice INV-88219.

We are already on an annual enterprise contract paid upfront in January. There should be zero recurring credit card debits.

Please review your Stripe records immediately and initiate a full reversal before our CFO flags this as an unauthorized chargeback with our banking provider.

Regards,
Elena Rostova
Finance Controller, Hyperion Logistics`,
    status: 'pending_review',
    classification: {
      intent: 'Billing & Invoicing',
      urgency: 'High',
      urgencyReason: 'Financial discrepancy with threat of chargeback dispute on corporate account.',
      sentiment: 'Frustrated / Angry',
      sentimentScore: -0.74,
      confidenceScore: 0.96,
      entities: {
        customerName: 'Elena Rostova',
        accountId: 'CUST-HYP-9901',
        amount: '$1,490.00',
        errorCodes: ['INV-88219'],
        deadline: 'Within 24 Hours',
      },
      edgeLatencyMs: 318,
      modelUsed: 'Phi-3.5-mini (3.8B INT4 quantized)',
      tokensPerSec: 26.8,
      recommendedAction: 'Audit transaction INV-88219 in Stripe ledger and prepare refund authorization.',
      pipelineStagesCompleted: [
        'Raw Email Ingestion',
        'LangChain Text Cleaning',
        'Zero-Shot Intent Classification',
        'Sentiment Scoring Engine',
        'Jinja2 Templating (billing_dispute.j2)',
        'SQLite Sync (Row #2)',
      ],
    },
    draftReply: {
      id: 'DFT-9002',
      templateId: 'tpl_billing',
      templateName: 'billing_dispute.j2',
      tone: 'Formal',
      isEdited: false,
      templateVariables: {
        customer_name: 'Elena Rostova',
        ticket_id: 'TCK-8092',
        invoice_reference: 'INV-88219',
        dispute_amount: '$1,490.00',
        resolution_timeline: '3 hours',
        refund_eligible: 'true',
      },
      generatedDraft: `Dear Elena Rostova,

Thank you for reaching out to Trackmind Accounts Support (Ref: #TCK-8092).

We understand your concern regarding the charge of $1,490.00 on invoice INV-88219. Ensuring billing accuracy and financial transparency is our top priority.

Our edge pipeline has cross-referenced your customer ID with our payment gateway logs. We have initiated a formal ledger reconciliation:
• Transaction Reference: INV-88219
• Disputed Amount: $1,490.00
• Processing Horizon: 3 hours

If a duplicate transaction is verified, an automatic reversal credit will be credited back to your original payment method within 3 to 5 business days.

Please let us know if there are any supplemental receipts you would like to append.

Warm regards,
Trackmind Financial Services Desk`,
    },
    auditTrail: [
      {
        id: 'aud-4',
        timestamp: '2026-10-04T12:45:11Z',
        action: 'Ingested via Webhook',
        actor: 'LangChain Webhook Adapter',
        details: 'Support ticket payload validated from portal.',
      },
      {
        id: 'aud-5',
        timestamp: '2026-10-04T12:45:12Z',
        action: 'Zero-Shot Edge Classification',
        actor: 'Phi-3.5-mini @ Jetson Orin Nano',
        details: 'Intent: Billing & Invoicing (0.96), Sentiment: Frustrated (-0.74).',
      },
    ],
  },
  {
    id: 'TCK-8093',
    sqliteRowId: 3,
    subject: 'Entire sales team locked out: Okta SAML assertion signature failed',
    sender: 'David Sterling',
    senderEmail: 'd.sterling@apex-partners.com',
    senderCompany: 'Apex Global Partners',
    channel: 'Email',
    receivedAt: '2026-10-04T11:20:00Z',
    body: `Support team,

None of our 45 account executives can log into the Trackmind portal this morning. When authenticating through our Okta dashboard, the redirect terminates with:

"SAML 2.0 Response validation error: X.509 Certificate thumbprint expired or invalid issuer URI."

Our weekly sales pipeline review starts in 40 minutes. Can you check if the SSO metadata certificate on your SP side was refreshed over the weekend?

David Sterling
Director of IT & Enterprise Systems`,
    status: 'pending_review',
    classification: {
      intent: 'Account Access & Security',
      urgency: 'High',
      urgencyReason: 'Widespread enterprise SSO lockout preventing 45 business users from access.',
      sentiment: 'Urgent / Anxious',
      sentimentScore: -0.68,
      confidenceScore: 0.97,
      entities: {
        customerName: 'David Sterling',
        productMentioned: 'Okta SAML 2.0 SSO Federation',
        errorCodes: ['X.509 Certificate thumbprint expired', 'Invalid issuer URI'],
        deadline: '40 minutes',
      },
      edgeLatencyMs: 360,
      modelUsed: 'Llama 3.2 (3B INT4 quantized)',
      tokensPerSec: 28.1,
      recommendedAction: 'Validate Trackmind SP SAML public certificate expiry date in Keycloak.',
      pipelineStagesCompleted: [
        'Raw Email Ingestion',
        'LangChain Token Sanitizer',
        'Zero-Shot Intent Classification',
        'Security Entity Extraction',
        'Jinja2 Templating (account_recovery.j2)',
        'SQLite Sync (Row #3)',
      ],
    },
    draftReply: {
      id: 'DFT-9003',
      templateId: 'tpl_security',
      templateName: 'account_recovery.j2',
      tone: 'Technical',
      isEdited: false,
      templateVariables: {
        customer_name: 'David Sterling',
        ticket_id: 'TCK-8093',
        account_email: 'd.sterling@apex-partners.com (Apex Okta Realm)',
        auth_step: 'SP SAML Certificate Verification',
        expiry_hours: '4',
      },
      generatedDraft: `Hello David Sterling,

We received an account recovery request for d.sterling@apex-partners.com (Apex Okta Realm) (Ticket ID: #TCK-8093).

To protect your organization's data integrity, our edge authentication security layer has placed a temporary safety hold on the specified credentials.

Next Steps to Restore Access:
1. Complete cryptographic identity challenge via your registered secondary hardware token or mobile authenticator.
2. Visit our verified edge recovery portal using the single-use token sent separately.
3. This secure recovery bridge will remain valid for 4 hours.

If you did not initiate this recovery request, please alert our security desk immediately by replying with code "SECURITY_ALERT_RED".

Security Operations Command,
Trackmind Autonomous Node`,
    },
    auditTrail: [
      {
        id: 'aud-6',
        timestamp: '2026-10-04T11:20:02Z',
        action: 'Edge Ingestion & Analysis',
        actor: 'Llama 3.2 (3B) Engine',
        details: 'Extracted SAML certificate validation error entities.',
      },
    ],
  },
  {
    id: 'TCK-8094',
    sqliteRowId: 4,
    subject: 'Cancelling our subscription next week unless query latency improves',
    sender: 'Kavita Nair',
    senderEmail: 'kavita@synthetix-ai.co',
    senderCompany: 'Synthetix AI Labs',
    channel: 'Support Portal',
    receivedAt: '2026-10-04T10:05:44Z',
    body: `Hi Trackmind Team,

We have been evaluating your edge vector search index for the past 60 days. Unfortunately, query p99 latency has drifted from 45ms up to 380ms under modest batch concurrency.

We have a board demo on Friday and our leadership has authorized migration to an alternative edge engine if this cannot be guaranteed under 60ms.

Please initiate the cancellation procedure for our Pro Tier unless your engineers can propose an immediate indexing re-shard or dedicated hardware allocation.

Kavita Nair
Head of AI Engineering, Synthetix`,
    status: 'pending_review',
    classification: {
      intent: 'Cancellation & Churn',
      urgency: 'High',
      urgencyReason: 'High-value customer expressing imminent churn risk due to latency regression.',
      sentiment: 'Frustrated / Angry',
      sentimentScore: -0.71,
      confidenceScore: 0.95,
      entities: {
        customerName: 'Kavita Nair',
        productMentioned: 'Edge Vector Search Index (Pro Tier)',
        deadline: 'Friday Board Demo',
      },
      edgeLatencyMs: 310,
      modelUsed: 'Phi-3.5-mini (3.8B INT4 quantized)',
      tokensPerSec: 25.9,
      recommendedAction: 'Propose memory-pinned index shard configuration + Customer Success VIP session.',
      pipelineStagesCompleted: [
        'Raw Email Ingestion',
        'LangChain Classification Chain',
        'Jinja2 Templating (churn_mitigation.j2)',
        'SQLite Sync (Row #4)',
      ],
    },
    draftReply: {
      id: 'DFT-9004',
      templateId: 'tpl_churn',
      templateName: 'churn_mitigation.j2',
      tone: 'Conciliatory',
      isEdited: false,
      templateVariables: {
        customer_name: 'Kavita Nair',
        ticket_id: 'TCK-8094',
        plan_tier: 'Pro Tier Vector Search',
        account_manager: 'Amardeep Kumar (Technical Solutions Director)',
        alternative_offer: 'Complimentary upgrade to dedicated Jetson Orin Tensor Core isolated partition + P99 latency tuning',
      },
      generatedDraft: `Hi Kavita Nair,

Thank you for contacting us regarding your Pro Tier Vector Search membership (Ref: #TCK-8094).

We are genuinely sorry to hear that our platform has not met your expectations recently. Your feedback directly impacts how we build and refine our products.

While we can seamlessly process your account closure, we would love the opportunity to understand what fell short:
• Special Consideration: Complimentary upgrade to dedicated Jetson Orin Tensor Core isolated partition + P99 latency tuning
• Dedicated Account Lead: Amardeep Kumar (Technical Solutions Director)

If you still prefer immediate cancellation, please confirm with a quick reply and our automated pipeline will archive your workspace without any penalty fees.

With sincere appreciation for your time with us,
Amardeep Kumar (Technical Solutions Director) & The Trackmind Customer Success Team`,
    },
    auditTrail: [
      {
        id: 'aud-7',
        timestamp: '2026-10-04T10:05:46Z',
        action: 'Churn Risk Flagged',
        actor: 'LangChain Churn Detector',
        details: 'Detected cancellation keyword cluster, assigned high priority.',
      },
    ],
  },
  {
    id: 'TCK-8095',
    sqliteRowId: 5,
    subject: 'Feature Suggestion: Webhook HMAC signature verification in Node SDK',
    sender: 'Lucas Silva',
    senderEmail: 'lucas@fintech-brasil.com.br',
    senderCompany: 'FinTech Brasil',
    channel: 'Webhook API',
    receivedAt: '2026-10-04T08:12:00Z',
    body: `Hello Dev team,

We love the speed of the Jetson edge classifier! One thing that would save us boilerplate code is built-in HMAC-SHA256 payload verification in your official Node/TypeScript SDK.

Right now we have to manually buffer raw request streams before JSON parsing to calculate the cryptographic hash. Having a helper like \`trackmind.webhooks.constructEvent(body, signature, secret)\` would make integrations foolproof.

Thanks for the great hardware and software work!
Lucas`,
    status: 'approved_and_sent',
    classification: {
      intent: 'Feature Request',
      urgency: 'Low',
      urgencyReason: 'Constructive developer suggestion for SDK developer experience improvement.',
      sentiment: 'Satisfied / Positive',
      sentimentScore: 0.82,
      confidenceScore: 0.94,
      entities: {
        customerName: 'Lucas Silva',
        productMentioned: 'Node/TypeScript SDK Webhook Verification',
      },
      edgeLatencyMs: 298,
      modelUsed: 'Phi-3.5-mini (3.8B INT4 quantized)',
      tokensPerSec: 27.5,
      recommendedAction: 'Log feature request into GitHub milestone v3.4.',
      pipelineStagesCompleted: [
        'Raw Email Ingestion',
        'LangChain Classification Chain',
        'Jinja2 Templating (feature_roadmap.j2)',
        'Human Approved & Dispatched',
        'SQLite Sync (Row #5)',
      ],
    },
    draftReply: {
      id: 'DFT-9005',
      templateId: 'tpl_feature',
      templateName: 'feature_roadmap.j2',
      tone: 'Empathetic',
      isEdited: true,
      templateVariables: {
        customer_name: 'Lucas Silva',
        ticket_id: 'TCK-8095',
        feature_summary: 'Built-in Webhook HMAC-SHA256 signature verification in Node/TypeScript SDK',
        product_pillar: 'Developer Experience & SDKs',
        target_milestone: 'Sprint Q4-Edge-v3.4',
      },
      generatedDraft: `Hi Lucas Silva,

Thank you for sharing your thoughtful suggestion (Ticket #TCK-8095)!

We have logged your request for "Built-in Webhook HMAC-SHA256 signature verification in Node/TypeScript SDK" directly under our Developer Experience & SDKs backlog. Our product management committee reviews high-impact community requests bi-weekly.

Estimated Target Review Milestone: Sprint Q4-Edge-v3.4.

Insights from power users like you help shape our edge computing roadmap. We will notify you automatically when this feature advances into our beta testing cycle.

Kind regards,
Trackmind Product Intelligence Team`,
      editedDraft: `Hi Lucas,

Thank you so much for the stellar suggestion (Ticket #TCK-8095)!

We agree 100% that having \`trackmind.webhooks.constructEvent()\` right in our @trackmind/sdk TypeScript client will prevent the dreaded stream-buffering headaches.

Our team has added this to the Sprint Q4-Edge-v3.4 roadmap and opened PR #1142. We'll ping you once the npm canary build is published!

Best regards,
Ankit Kumar Manjhi
Trackmind Engineering`,
      reviewedAt: '2026-10-04T08:24:10Z',
      reviewedBy: 'Ankit Kumar Manjhi (Lead Engineer)',
    },
    auditTrail: [
      {
        id: 'aud-8',
        timestamp: '2026-10-04T08:12:02Z',
        action: 'Classified & Drafted',
        actor: 'Phi-3.5-mini @ Jetson Orin',
        details: 'Intent: Feature Request (0.94).',
      },
      {
        id: 'aud-9',
        timestamp: '2026-10-04T08:24:10Z',
        action: 'Human Approved & Dispatched',
        actor: 'Ankit Kumar Manjhi (Reviewer)',
        details: 'Agent added personal PR reference and dispatched email.',
      },
    ],
  },
  {
    id: 'TCK-8096',
    sqliteRowId: 6,
    subject: '401 Unauthorized when invoking /v1/edge/inference with valid bearer token',
    sender: 'Siddharth Rao',
    senderEmail: 'siddharth@cognivue.ai',
    senderCompany: 'Cognivue Systems',
    channel: 'Email',
    receivedAt: '2026-10-04T07:35:12Z',
    body: `Hi Support,

We are trying to test the Jetson Orin Nano zero-shot endpoint from our Python pipeline:

\`\`\`python
headers = {"Authorization": "Bearer tk_live_8399a21b44"}
response = requests.post("https://edge.trackmind.io/v1/inference", json=payload, headers=headers)
# Returns: 401 Unauthorized {"code": "KEY_SCOPE_INSUFFICIENT"}
\`\`\`

The API key was generated yesterday in the developer settings. Does this key need additional IAM permissions for edge SLM access?

Thanks,
Siddharth`,
    status: 'pending_review',
    classification: {
      intent: 'Integration & API',
      urgency: 'Medium',
      urgencyReason: 'Developer blocked by API key scope authorization error during integration.',
      sentiment: 'Neutral / Factual',
      sentimentScore: 0.05,
      confidenceScore: 0.96,
      entities: {
        customerName: 'Siddharth Rao',
        productMentioned: 'Edge Inference API v1',
        errorCodes: ['401 Unauthorized', 'KEY_SCOPE_INSUFFICIENT'],
      },
      edgeLatencyMs: 312,
      modelUsed: 'Llama 3.2 (3B INT4 quantized)',
      tokensPerSec: 28.4,
      recommendedAction: 'Instruct developer to toggle edge:inference scope in API Key settings.',
      pipelineStagesCompleted: [
        'Raw Email Ingestion',
        'LangChain Pipeline',
        'Jinja2 Templating (api_integration.j2)',
        'SQLite Sync (Row #6)',
      ],
    },
    draftReply: {
      id: 'DFT-9006',
      templateId: 'tpl_api',
      templateName: 'api_integration.j2',
      tone: 'Technical',
      isEdited: false,
      templateVariables: {
        customer_name: 'Siddharth Rao',
        ticket_id: 'TCK-8096',
        endpoint_name: '/v1/edge/inference',
        sdk_language: 'Python (requests)',
        docs_url: 'https://docs.trackmind.io/edge/authentication#scopes',
      },
      generatedDraft: `Hi Siddharth Rao,

Thanks for connecting with Trackmind Developer Relations (Ticket #TCK-8096).

Regarding your integration with /v1/edge/inference in Python (requests):
Our edge parser identified potential header mismatch or rate-limit throttle in your payload. Specifically, error 'KEY_SCOPE_INSUFFICIENT' indicates your API key is missing the 'edge:inference:execute' permission flag.

Recommended Configuration:
• Visit Developer Settings > API Keys > Edit Scope
• Enable the checkbox for 'Edge SLM Inference (Jetson Pipeline)'
• Comprehensive SDK Reference: https://docs.trackmind.io/edge/authentication#scopes

Let us know if the issue persists after reviewing your payload structure, and we can inspect your raw debug telemetry.

Code on,
Trackmind Developer Support Engineering`,
    },
    auditTrail: [
      {
        id: 'aud-10',
        timestamp: '2026-10-04T07:35:14Z',
        action: 'Classified & Drafted',
        actor: 'Llama 3.2 (3B) @ Jetson Orin',
        details: 'Identified API scope error in Python snippet.',
      },
    ],
  },
];
