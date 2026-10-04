import { JinjaTemplateDef } from '../types';

export const JINJA_TEMPLATES: JinjaTemplateDef[] = [
  {
    id: 'tpl_outage',
    name: 'Production Outage & Critical Incident',
    intentMatch: 'Technical Bug / Outage',
    filename: 'production_outage.j2',
    description: 'Priority response for system crashes, 500 error spikes, and downtime reports.',
    variables: ['customer_name', 'ticket_id', 'service_name', 'incident_id', 'eta_minutes', 'support_engineer'],
    rawTemplate: `Hello {{ customer_name }},

Thank you for reporting this issue (Ticket #{{ ticket_id }}).

Our edge monitoring systems have confirmed your report regarding {{ service_name }}. An active investigation has been initiated under Incident Reference #{{ incident_id }}.

{% if severity == 'Critical' %}
Our Tier-3 Site Reliability Engineering team has been paged and is actively working on service restoration.
Current Estimated Resolution Window: {{ eta_minutes }} minutes.
{% else %}
Our engineering team has isolated the error logs and is testing a targeted hotfix.
{% endif %}

We will provide another status update as soon as the deployment verification completes. You can track live telemetry on our edge status board.

Sincerely,
{{ support_engineer }}
Edge Operations Incident Response Team
Trackmind Automated Jetson Node`,
  },
  {
    id: 'tpl_billing',
    name: 'Billing & Invoice Resolution',
    intentMatch: 'Billing & Invoicing',
    filename: 'billing_dispute.j2',
    description: 'Structured response for duplicate charges, subscription audits, and invoice disputes.',
    variables: ['customer_name', 'ticket_id', 'invoice_reference', 'dispute_amount', 'resolution_timeline'],
    rawTemplate: `Dear {{ customer_name }},

Thank you for reaching out to Trackmind Accounts Support (Ref: #{{ ticket_id }}).

We understand your concern regarding the charge of {{ dispute_amount }} on invoice {{ invoice_reference }}. Ensuring billing accuracy and financial transparency is our top priority.

Our edge pipeline has cross-referenced your customer ID with our payment gateway logs. We have initiated a formal ledger reconciliation:
• Transaction Reference: {{ invoice_reference }}
• Disputed Amount: {{ dispute_amount }}
• Processing Horizon: {{ resolution_timeline }}

{% if refund_eligible %}
If a duplicate transaction is verified, an automatic reversal credit will be credited back to your original payment method within 3 to 5 business days.
{% endif %}

Please let us know if there are any supplemental receipts you would like to append.

Warm regards,
Trackmind Financial Services Desk`,
  },
  {
    id: 'tpl_security',
    name: 'Account Access & Security Reset',
    intentMatch: 'Account Access & Security',
    filename: 'account_recovery.j2',
    description: 'Protocol-driven recovery guide for locked accounts and MFA reset requests.',
    variables: ['customer_name', 'ticket_id', 'account_email', 'auth_step', 'expiry_hours'],
    rawTemplate: `Hello {{ customer_name }},

We received an account recovery request for {{ account_email }} (Ticket ID: #{{ ticket_id }}).

To protect your organization's data integrity, our edge authentication security layer has placed a temporary safety hold on the specified credentials.

Next Steps to Restore Access:
1. Complete cryptographic identity challenge via your registered secondary hardware token or mobile authenticator.
2. Visit our verified edge recovery portal using the single-use token sent separately.
3. This secure recovery bridge will remain valid for {{ expiry_hours }} hours.

If you did not initiate this recovery request, please alert our security desk immediately by replying with code "SECURITY_ALERT_RED".

Security Operations Command,
Trackmind Autonomous Node`,
  },
  {
    id: 'tpl_churn',
    name: 'Cancellation & Retention Outreach',
    intentMatch: 'Cancellation & Churn',
    filename: 'churn_mitigation.j2',
    description: 'Empathetic, value-oriented reply addressing churn signals and offboarding.',
    variables: ['customer_name', 'ticket_id', 'plan_tier', 'account_manager', 'alternative_offer'],
    rawTemplate: `Hi {{ customer_name }},

Thank you for contacting us regarding your {{ plan_tier }} membership (Ref: #{{ ticket_id }}).

We are genuinely sorry to hear that our platform has not met your expectations recently. Your feedback directly impacts how we build and refine our products.

While we can seamlessly process your account closure, we would love the opportunity to understand what fell short:
• Special Consideration: {{ alternative_offer }}
• Dedicated Account Lead: {{ account_manager }}

If you still prefer immediate cancellation, please confirm with a quick reply and our automated pipeline will archive your workspace without any penalty fees.

With sincere appreciation for your time with us,
{{ account_manager }} & The Trackmind Customer Success Team`,
  },
  {
    id: 'tpl_feature',
    name: 'Feature Request & Product Roadmap',
    intentMatch: 'Feature Request',
    filename: 'feature_roadmap.j2',
    description: 'Constructive acknowledgement logging user ideas into the engineering backlog.',
    variables: ['customer_name', 'ticket_id', 'feature_summary', 'product_pillar', 'target_milestone'],
    rawTemplate: `Hi {{ customer_name }},

Thank you for sharing your thoughtful suggestion (Ticket #{{ ticket_id }})!

We have logged your request for "{{ feature_summary }}" directly under our {{ product_pillar }} backlog. Our product management committee reviews high-impact community requests bi-weekly.

Estimated Target Review Milestone: {{ target_milestone }}.

Insights from power users like you help shape our edge computing roadmap. We will notify you automatically when this feature advances into our beta testing cycle.

Kind regards,
Trackmind Product Intelligence Team`,
  },
  {
    id: 'tpl_api',
    name: 'Developer API & Integration Support',
    intentMatch: 'Integration & API',
    filename: 'api_integration.j2',
    description: 'Technical guidance with endpoints, headers, and code references.',
    variables: ['customer_name', 'ticket_id', 'endpoint_name', 'sdk_language', 'docs_url'],
    rawTemplate: `Hi {{ customer_name }},

Thanks for connecting with Trackmind Developer Relations (Ticket #{{ ticket_id }}).

Regarding your integration with {{ endpoint_name }} in {{ sdk_language }}:
Our edge parser identified potential header mismatch or rate-limit throttle in your payload.

Recommended Configuration:
• Verify idempotency key header: 'X-Idempotency-Key: <UUIDv4>'
• Ensure Content-Type is strictly set to 'application/json'
• Comprehensive SDK Reference: {{ docs_url }}

Let us know if the issue persists after reviewing your payload structure, and we can inspect your raw debug telemetry.

Code on,
Trackmind Developer Support Engineering`,
  },
  {
    id: 'tpl_general',
    name: 'General Customer Service Resolution',
    intentMatch: 'General Inquiry',
    filename: 'general_resolution.j2',
    description: 'Polite, clear response for general questions and product guidance.',
    variables: ['customer_name', 'ticket_id', 'topic_name', 'resource_link'],
    rawTemplate: `Hello {{ customer_name }},

Thank you for reaching out to Trackmind Support regarding {{ topic_name }} (Ticket #{{ ticket_id }}).

Our edge AI system has classified your inquiry and matched it with our latest platform knowledge base. We are here to ensure you get the exact information you need.

Helpful Resources:
• Guide: {{ resource_link }}

If you need any further clarification or hands-on assistance, please reply directly to this thread and we will be delighted to assist!

Best regards,
Trackmind Customer Support Team`,
  },
];
