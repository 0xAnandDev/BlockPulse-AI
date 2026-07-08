# Architecture

## Pipeline

```
 ┌──────────┐     ┌─────────┐     ┌───────────────┐     ┌────────────────────┐     ┌────────────┐     ┌───────────────────┐
 │  Monitor │ --> │ Analyze │ --> │ Detect risks  │ --> │ Generate AI insight │ --> │ Notify user│ --> │ Store in security │
 │          │     │         │     │               │     │                     │     │            │     │ history           │
 └──────────┘     └─────────┘     └───────────────┘     └────────────────────┘     └────────────┘     └───────────────────┘
```

1. **Monitor** — Blockchain Listener subscribes to wallet/contract activity (Alchemy webhooks / Notify API) on Polygon Amoy.
2. **Analyze** — Raw events are normalized into a common internal event shape (asset, amount, addresses, tx hash, block, timestamp).
3. **Detect risks** — Detection Engine evaluates each normalized event against rule sets for the four supported event types:
   - Large transfer
   - Unlimited approval
   - Contract ownership changed
   - Whale activity

   Each match is tagged with a severity level: `high`, `medium`, or `low`.
4. **Generate AI insight** — AI Insight Engine sends the detected event + context to Claude, which returns a structured JSON insight: risk level, plain-English reason, recommendation.
5. **Notify user** — Notification Service delivers the insight to the user's configured channel(s) (e.g. Telegram) in real time.
6. **Store in security history** — The event and its AI insight are persisted so they appear in the Analytics Dashboard's history view.

## Modules

| Module | Responsibility |
|---|---|
| **Auth** | User registration/login, JWT issuance and validation. |
| **Wallet Manager** | Add/remove wallets a user wants monitored, per-wallet settings. |
| **Contract Manager** | Add/remove smart contracts a user wants monitored. |
| **Blockchain Listener** | Subscribes to on-chain events (Alchemy webhooks) for tracked wallets/contracts and normalizes them. |
| **Detection Engine** | Applies rules to normalized events to detect the four supported risk types and assign severity. |
| **AI Insight Engine** | Calls the Claude API to turn a detected risk into a plain-English explanation and recommendation, as structured JSON. |
| **Notification Service** | Delivers alerts to the user (e.g. Telegram) as soon as an insight is generated. |
| **Analytics Dashboard** | Frontend surface showing live alerts, security history, and wallet/contract stats. |

## Why these tech choices

- **TanStack Start (React + TypeScript)** — full-stack React framework with file-based routing and SSR, fast to iterate on during a hackathon while staying type-safe.
- **Tailwind CSS + shadcn/ui** — quick to build a polished, consistent UI without hand-rolling design primitives.
- **Recharts** — lightweight charting for the analytics dashboard's history/severity visualizations.
- **Zustand** — minimal global state management, avoids Redux boilerplate for a small app.
- **NestJS** — opinionated, modular backend structure (matches the module list above 1:1), built-in support for DI, guards, and Swagger.
- **Prisma ORM + PostgreSQL** — type-safe schema and migrations for relational data (users, wallets, contracts, events, insights).
- **Redis + BullMQ** — queues AI insight generation and notification delivery so on-chain event ingestion isn't blocked by slower downstream calls.
- **JWT auth** — stateless auth suitable for a single backend service without a session store.
- **Swagger** — auto-generated API docs, useful for demoing/testing endpoints quickly.
- **Ethers.js** — standard library for interacting with EVM chains from TypeScript.
- **Alchemy webhooks (Notify API)** — push-based on-chain event delivery, avoids polling for the listener.
- **Polygon Amoy testnet** — free, fast testnet with good tooling support for a live demo.
- **Claude API** — generates the plain-English risk explanations and recommendations as structured JSON, the core "AI" of BlockPulse AI.
- **Foundry (optional demo contract)** — lets us trigger reliable, on-demand on-chain events during the live demo instead of relying on real mainnet activity.
