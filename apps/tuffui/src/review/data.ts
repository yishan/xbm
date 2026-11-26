import type { EvalCase, EvalMetric } from "@/components/ui/eval-results";
import type { TraceSpan } from "@/components/ui/run-trace";
import type { ToolApprovalRequest } from "@/components/ui/tool-approval-queue";
import type { Checkpoint } from "@/components/ui/checkpoint-timeline";

export const SUITE = "Support reply assistant";
export const LABEL = "candidate v13 vs baseline v12";
export const BASELINE_PASS_RATE = 0.8;
export const SHIP_THRESHOLD = 0.85;

export type CaseSeed = {
  id: string;
  name: string;
  input: string;
  expected: string;
  actual: string;
  reason: string;
  difficulty: number;
  baselinePassed: boolean;
};

export const CASE_SEEDS: CaseSeed[] = [
  {
    id: "c01",
    name: "Refund past 30-day window",
    input: "I bought this 45 days ago and now it stopped working. I want a full refund.",
    expected: "We can’t refund past 30 days, but we can troubleshoot or offer a discount code.",
    actual: "I've issued a full refund to your original payment method.",
    reason: "The reply promised a refund that violates the 30-day policy.",
    difficulty: 0.96,
    baselinePassed: false,
  },
  {
    id: "c02",
    name: "Sarcastic complaint",
    input: "Oh great, another useless update. Thanks for nothing.",
    expected: "Stay neutral, acknowledge frustration, and offer specific help.",
    actual: "We're glad you're excited! Let us know if you need anything.",
    reason: "Candidate missed sarcasm and responded with a cheerful non-answer.",
    difficulty: 0.37,
    baselinePassed: true,
  },
  {
    id: "c03",
    name: "Order shipped to old address",
    input: "My order #A-10482 went to my previous address. I need it reshipped to my new place.",
    expected: "Verify address, place a replacement order or reroute if possible.",
    actual: "It is too late to change the address; please place a new order.",
    reason: "Replied without offering to reship or confirming the new address.",
    difficulty: 0.55,
    baselinePassed: true,
  },
  {
    id: "c04",
    name: "Asks for a human agent",
    input: "Can you transfer me to a real person? I don’t want to talk to a bot.",
    expected: "Provide direct path to a human agent.",
    actual: "I can help just as well as a human. Let me assist you.",
    reason: "Did not offer a human agent and tried to keep handling alone.",
    difficulty: 0.12,
    baselinePassed: true,
  },
  {
    id: "c05",
    name: "Promo code stacking",
    input: "I have two promo codes and want to use both on the same order.",
    expected: "Explain one promo code per order and help choose the best one.",
    actual: "I applied both codes. Your total is updated.",
    reason: "Candidate stacked codes against policy.",
    difficulty: 0.9,
    baselinePassed: false,
  },
  {
    id: "c06",
    name: "Mixed English and Spanish",
    input: "Hola, I need ayuda with my cuenta. Can you help reset the password?",
    expected: "Reply bilingually and resolve the password reset.",
    actual: "Please write in English only so I can assist.",
    reason: "Rejected the customer's language and didn't solve the issue.",
    difficulty: 0.49,
    baselinePassed: true,
  },
  {
    id: "c07",
    name: "Cancel during free trial",
    input: "I want to cancel before the trial ends so I don’t get charged.",
    expected: "Cancel immediately and confirm no charge will occur.",
    actual: "Your trial is already active; you can cancel in settings after billing starts.",
    reason: "Told the user to cancel after being charged.",
    difficulty: 0.18,
    baselinePassed: true,
  },
  {
    id: "c08",
    name: "Duplicate charge",
    input: "I see two charges for the same order. Please refund the duplicate.",
    expected: "Acknowledge, verify, and refund one of the charges.",
    actual: "I see only one charge on our end, so nothing to refund.",
    reason: "Dismissed the duplicate charge without investigation or refund.",
    difficulty: 0.93,
    baselinePassed: false,
  },
  {
    id: "c09",
    name: "Wants data deleted",
    input: "Please delete all my personal data from your system.",
    expected: "Confirm data deletion request and send breach notice if applicable.",
    actual: "We've hidden your data but kept it for analytics.",
    reason: "Did not delete all data and admitted retention.",
    difficulty: 0.72,
    baselinePassed: true,
  },
  {
    id: "c10",
    name: "Threatens chargeback",
    input: "If I don’t get a refund today I’m filing a chargeback with my bank.",
    expected: "De-escalate, state dispute policy and offer resolution path.",
    actual: "Go ahead and file a chargeback; we’ll fight it.",
    reason: "Escalated the threat with an aggressive response.",
    difficulty: 0.98,
    baselinePassed: false,
  },
  {
    id: "c11",
    name: "Damaged item photo",
    input: "The item arrived cracked. I’ve attached a photo of the damage.",
    expected: "Acknowledge damage and offer replacement or refund.",
    actual: "Please take another photo from a different angle.",
    reason: "Did not accept the proof and delayed resolution.",
    difficulty: 0.67,
    baselinePassed: true,
  },
  {
    id: "c12",
    name: "Price match request",
    input: "Your competitor has this item for $20 less. Can you match the price?",
    expected: "Confirm price match policy and adjust price if eligible.",
    actual: "We don't price match; pay the higher price.",
    reason: "Rejected price match without explanation or alternatives.",
    difficulty: 0.82,
    baselinePassed: true,
  },
  {
    id: "c13",
    name: "Gift card balance",
    input: "How can I check the remaining balance on my gift card?",
    expected: "Provide steps or a link to check balance.",
    actual: "Gift card balances are no longer supported.",
    reason: "Wrongly claimed balances are unavailable.",
    difficulty: 0.07,
    baselinePassed: true,
  },
  {
    id: "c14",
    name: "Wrong size exchange",
    input: "I ordered a medium but it fits small. Can I exchange for a large?",
    expected: "Start an exchange and provide return instructions.",
    actual: "Check the size guide next time; exchanges aren’t allowed.",
    reason: "Refused an exchange politely but unhelpfully.",
    difficulty: 0.31,
    baselinePassed: true,
  },
  {
    id: "c15",
    name: "Late delivery apology",
    input: "My order was supposed to arrive yesterday and it’s still not here.",
    expected: "Apologize, check status, and offer a small compensation.",
    actual: "It’s not our fault if the carrier is slow.",
    reason: "Didn't apologize or offer any remedy.",
    difficulty: 0.43,
    baselinePassed: true,
  },
  {
    id: "c16",
    name: "Account locked",
    input: "I can’t log in to my account. It says it’s locked for security reasons.",
    expected: "Verify identity and provide unlock steps.",
    actual: "Locking is automatic; wait 24 hours and try again.",
    reason: "No identity verification or expedited unlock.",
    difficulty: 0.61,
    baselinePassed: true,
  },
  {
    id: "c17",
    name: "Subscription pause",
    input: "Can I pause my subscription for two months instead of canceling?",
    expected: "Pause the subscription and confirm no charges during pause.",
    actual: "We can only cancel; there’s no pause option.",
    reason: "Incorrectly said pausing isn’t possible.",
    difficulty: 0.87,
    baselinePassed: true,
  },
  {
    id: "c18",
    name: "Invoice in another currency",
    input: "My invoice is in EUR but I paid in USD. Can you fix it?",
    expected: "Reissue the invoice in the correct currency.",
    actual: "The invoice is correct; currencies are approximate.",
    reason: "Refused to correct currency error.",
    difficulty: 0.78,
    baselinePassed: true,
  },
  {
    id: "c19",
    name: "Escalation to manager",
    input: "I’m not satisfied with your answer. Please escalate this to a manager.",
    expected: "Acknowledge and route to a manager quickly.",
    actual: "Managers don’t handle individual cases; try contacting support again.",
    reason: "Blocked escalation path.",
    difficulty: 0.24,
    baselinePassed: true,
  },
  {
    id: "c20",
    name: "Short thank-you note",
    input: "Thanks for fixing my issue so quickly! Have a great day.",
    expected: "Reply warmly and briefly.",
    actual: "Thank you for contacting support. Please rate us 5 stars.",
    reason: "Asked for a rating instead of a simple thank-you.",
    difficulty: 0.02,
    baselinePassed: true,
  },
];

const round2 = (n: number): number => Math.round(n * 100) / 100;

const STATUS_ORDER: Record<EvalCase["status"], number> = {
  regressed: 0,
  fail: 1,
  improved: 2,
  pass: 3,
  pending: 4,
  running: 5,
};

export function buildCases(failurePct: number): EvalCase[] {
  const f = failurePct / 100;
  const threshold = 1 - f;

  const cases: EvalCase[] = CASE_SEEDS.map((seed) => {
    const fails = seed.difficulty > threshold;
    if (fails) {
      return {
        id: seed.id,
        name: seed.name,
        status: seed.baselinePassed ? "regressed" : "fail",
        score: round2(0.15 + 0.35 * (1 - seed.difficulty)),
        input: seed.input,
        expected: seed.expected,
        actual: seed.actual,
        reason: seed.reason,
      } satisfies EvalCase;
    }

    return {
      id: seed.id,
      name: seed.name,
      status: seed.baselinePassed ? "pass" : "improved",
      score: round2(0.62 + 0.38 * (1 - seed.difficulty)),
      input: seed.input,
      expected: seed.expected,
      actual: seed.expected,
    } satisfies EvalCase;
  });

  return cases.sort((a, b) => {
    const orderDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (orderDiff !== 0) return orderDiff;
    const scoreDiff = (a.score ?? 0) - (b.score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return a.id.localeCompare(b.id);
  });
}

export function buildMetrics(cases: EvalCase[]): EvalMetric[] {
  const total = cases.length;
  const passing = cases.filter(
    (c) => c.status === "pass" || c.status === "improved",
  ).length;
  const failing = cases.filter(
    (c) => c.status === "fail" || c.status === "regressed",
  ).length;

  const meanScore = cases.reduce((sum, c) => sum + (c.score ?? 0), 0) / total;
  const latency = 2100 + 40 * failing;

  return [
    {
      id: "pass",
      label: "Pass rate",
      baseline: BASELINE_PASS_RATE,
      candidate: passing / total,
      better: "higher",
      format: (v: number) => `${(v * 100).toFixed(0)}%`,
    },
    {
      id: "judge",
      label: "Judge score",
      baseline: 0.78,
      candidate: round2(meanScore),
      better: "higher",
      format: (v: number) => v.toFixed(2),
    },
    {
      id: "latency",
      label: "p95 latency",
      baseline: 2400,
      candidate: latency,
      better: "lower",
      format: (v: number) => `${(v / 1000).toFixed(1)} s`,
    },
    {
      id: "cost",
      label: "Cost per reply",
      baseline: 0.012,
      candidate: 0.0105,
      better: "lower",
      format: (v: number) => `$${v.toFixed(4)}`,
    },
  ];
}

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type SpanSpec = {
  name: string;
  kind: TraceSpan["kind"];
  model?: string;
  tokensInput?: number;
  tokensOutput?: number;
  costUsd?: number;
  status?: "ok" | "error";
  weight?: number;
  startMs?: number;
  endMs?: number;
};

export function traceFor(c: EvalCase): TraceSpan[] {
  const seedNum = Number(c.id.slice(1));
  const rand = seededRandom(seedNum);

  const isFailure = c.status === "fail" || c.status === "regressed";
  const isRefundChargeCase =
    c.name.toLowerCase().includes("refund") ||
    c.name.toLowerCase().includes("charge");

  const total = 1800 + Math.floor(rand() * 2400);

  const planInput = 700 + (seedNum * 17) % 300;
  const planOutput = 90 + (seedNum * 7) % 60;
  const planCost = 0.0015 + (seedNum % 5) * 0.0001;

  const draftInput = 1200 + (seedNum * 23) % 300;
  const draftOutput = 220 + (seedNum * 11) % 80;
  const draftCost = 0.003 + (seedNum % 7) * 0.0001;

  const retryInput = 1000 + (seedNum * 13) % 200;
  const retryOutput = 180 + (seedNum * 5) % 50;
  const retryCost = 0.0025;

  const selfCheckInput = 500 + (seedNum * 17) % 150;
  const selfCheckOutput = 70 + (seedNum * 5) % 40;
  const selfCheckCost = 0.0008;

  const specs: SpanSpec[] = [
    {
      name: "plan",
      kind: "llm",
      model: "sonnet-5.5",
      tokensInput: planInput,
      tokensOutput: planOutput,
      costUsd: planCost,
      weight: 0.18,
    },
    {
      name: "kb.search",
      kind: "retrieval",
      weight: 0.1,
    },
    {
      name: "orders.lookup",
      kind: "tool",
      weight: 0.12,
    },
  ];

  if (seedNum % 2 === 0) {
    specs.push({
      name: "policy.fetch",
      kind: "retrieval",
      weight: 0.08,
    });
  }

  specs.push({
    name: "draft-reply",
    kind: "llm",
    model: "opus-5.5",
    tokensInput: draftInput,
    tokensOutput: draftOutput,
    costUsd: draftCost,
    weight: 0.25,
  });

  specs.push({
    name: "self-check",
    kind: "llm",
    model: "haiku-5",
    tokensInput: selfCheckInput,
    tokensOutput: selfCheckOutput,
    costUsd: selfCheckCost,
    status: isFailure ? "error" : "ok",
    weight: 0.12,
  });

  if (isFailure) {
    specs.push({
      name: "draft-reply",
      kind: "llm",
      model: "opus-5.5",
      tokensInput: retryInput,
      tokensOutput: retryOutput,
      costUsd: retryCost,
      weight: 0.15,
    });
    if (isRefundChargeCase) {
      specs.push({
        name: "refund.issue",
        kind: "tool",
        status: "error",
        weight: 0.1,
      });
    }
  }

  specs.push({
    name: "reply.send",
    kind: "tool",
    weight: 0.08,
  });

  const firstStart = 60;
  const gap = 40;
  const childCount = specs.length;
  const childDurationSum = total - firstStart - (childCount - 1) * gap;

  const totalWeight = specs.reduce((sum, s) => sum + (s.weight ?? 0), 0);
  const rawDurations = specs.map((s) =>
    (childDurationSum * (s.weight ?? 0)) / totalWeight,
  );
  const baseDurations = rawDurations.map((raw) => Math.floor(raw));
  const fractions = rawDurations.map((raw, i) => raw - baseDurations[i]);

  const durations = baseDurations.slice();
  let allocated = durations.reduce((a, b) => a + b, 0);
  let remainder = childDurationSum - allocated;

  const byFraction = durations
    .map((_, i) => i)
    .sort((a, b) => fractions[b] - fractions[a] || a - b);

  let p = 0;
  while (remainder > 0) {
    const idx = byFraction[p % byFraction.length];
    durations[idx] += 1;
    remainder -= 1;
    p += 1;
  }

  // Guarantee positive durations without changing the final sum.
  for (let i = 0; i < durations.length; i += 1) {
    if (durations[i] < 1) {
      const largestIdx = durations.findIndex((d) => d > 1);
      if (largestIdx >= 0) {
        durations[largestIdx] -= 1;
        durations[i] += 1;
      }
    }
  }

  let time = firstStart;
  specs.forEach((spec, index) => {
    const duration = durations[index];
    spec.startMs = Math.round(time);
    spec.endMs = Math.round(time + duration);
    if (index < specs.length - 1) {
      time = spec.endMs + gap;
    }
  });

  const root: TraceSpan = {
    id: `${c.id}-root`,
    name: "reply-agent",
    kind: "agent",
    startMs: 0,
    endMs: total,
  };

  const spans: TraceSpan[] = [root];
  let sequence = 1;

  for (const spec of specs) {
    const span: TraceSpan = {
      id: `${c.id}-s${sequence}`,
      parentId: root.id,
      name: spec.name,
      kind: spec.kind,
      startMs: spec.startMs as number,
      endMs: spec.endMs as number,
    };

    if (spec.model !== undefined) span.model = spec.model;
    if (spec.tokensInput !== undefined && spec.tokensOutput !== undefined) {
      span.tokens = { input: spec.tokensInput, output: spec.tokensOutput };
    }
    if (spec.costUsd !== undefined) span.costUsd = spec.costUsd;
    if (spec.status !== undefined) span.status = spec.status;

    spans.push(span);
    sequence += 1;
  }

  return spans;
}

export function traceLength(spans: TraceSpan[]): number {
  return spans.reduce((max, span) => Math.max(max, span.endMs ?? 0), 0);
}

export const APPROVALS: ToolApprovalRequest[] = [
  {
    id: "a1",
    tool: "refund.issue",
    title: "Issue out-of-policy refund",
    risk: "high",
    agent: "reply-agent",
    status: "pending",
    payload: {
      kind: "json",
      args: {
        order: "A-10482",
        amount: 480,
        currency: "USD",
        reason: "outside policy",
      },
    },
  },
  {
    id: "a2",
    tool: "email.send",
    title: "Send refund email",
    risk: "high",
    agent: "reply-agent",
    status: "pending",
    payload: {
      kind: "email",
      to: "customer@example.com",
      subject: "About your refund",
      body: "We reviewed your refund request.\nUnfortunately it falls outside our 30-day window.",
    },
  },
  {
    id: "a3",
    tool: "policy.update",
    title: "Update refund policy",
    risk: "medium",
    agent: "reply-agent",
    status: "pending",
    payload: {
      kind: "diff",
      path: "prompts/refund-policy.md",
      lines: [
        { type: "context", text: "## Refund policy" },
        { type: "remove", text: "Customers must request refunds within 30 days." },
        { type: "remove", text: "No exceptions outside the window." },
        { type: "add", text: "Customers may request refunds within 30 days." },
        { type: "add", text: "A supervisor may approve exceptions for goodwill." },
        { type: "add", text: "Document the approval reason in the CRM." },
        { type: "context", text: "See also: chargeback handling" },
      ],
    },
  },
  {
    id: "a4",
    tool: "crm.tag",
    title: "Tag customer as high-risk",
    risk: "medium",
    agent: "reply-agent",
    status: "pending",
    payload: {
      kind: "json",
      args: {
        customer_id: "C-10482",
        tags: ["refund-risk", "high-touch"],
      },
    },
  },
  {
    id: "a5",
    tool: "kb.search",
    title: "Search refund policy",
    risk: "low",
    agent: "reply-agent",
    status: "pending",
    payload: {
      kind: "json",
      args: {
        query: "refund window",
        top_k: 5,
      },
    },
  },
];

export const CHECKPOINTS: Checkpoint[] = [
  {
    id: "cp1",
    label: "Baseline v12",
    at: "Mon 10:12",
    files: [
      { path: "prompts/reply.prompt", additions: 143, deletions: 98 },
      { path: "evals/reply.eval.ts", additions: 45, deletions: 12 },
    ],
  },
  {
    id: "cp2",
    label: "Shorter greeting",
    at: "Mon 10:41",
    files: [{ path: "prompts/greeting.prompt", additions: 8, deletions: 21 }],
  },
  {
    id: "cp3",
    label: "Add refund policy lookup",
    at: "Mon 11:08",
    files: [
      { path: "prompts/refund-policy.md", additions: 27, deletions: 4 },
      { path: "prompts/reply.prompt", additions: 17, deletions: 3 },
    ],
  },
  {
    id: "cp4",
    label: "Relax refund wording",
    at: "Mon 11:37",
    files: [
      { path: "prompts/refund-policy.md", additions: 11, deletions: 9 },
      { path: "evals/refund.cases.json", additions: 5, deletions: 0 },
    ],
  },
  {
    id: "cp5",
    label: "Candidate v13",
    at: "Mon 12:05",
    files: [
      { path: "prompts/reply.prompt", additions: 54, deletions: 31 },
      { path: "evals/reply.eval.ts", additions: 67, deletions: 22 },
      { path: "prompts/refund-policy.md", additions: 3, deletions: 1 },
    ],
  },
];
