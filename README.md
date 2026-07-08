# BlockPulse AI

BlockPulse AI is an AI-powered blockchain intelligence and alert platform. It continuously monitors blockchain wallets and smart contracts, detects suspicious on-chain activity in real time, explains what happened in plain English using AI, and instantly notifies the user.

## Problem

Blockchain users currently have to manually check Etherscan, wallet apps, Telegram bots, Discord bots, and explorer sites to know what's happening to their assets. There's no single dashboard that combines monitoring, AI explanation, security detection, and notifications.

## Solution

BlockPulse AI unifies monitoring, detection, AI-generated explanations, and notifications into a single pipeline and dashboard, so users get a clear, plain-English alert the moment something risky happens to a wallet or contract they care about.

## Architecture overview

Core pipeline:

```
Monitor → Analyze → Detect risks → Generate AI insight → Notify user → Store in security history
```

- **Monitor** — listens to wallet and contract activity on-chain via blockchain event feeds.
- **Analyze** — normalizes and enriches raw on-chain events.
- **Detect risks** — runs events through the detection engine (large transfer, unlimited approval, contract ownership changed, whale activity), each tagged with a severity level (high/medium/low).
- **Generate AI insight** — produces a plain-English reason and recommendation for each detected event.
- **Notify user** — pushes alerts to the user in real time.
- **Store in security history** — persists events and insights for later review in the analytics dashboard.

Example AI insight output:

```
Risk level: High.
Reason: wallet transferred 420 ETH to an address with no previous interaction history.
Recommendation: verify whether this was intended; if not, revoke approvals immediately.
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full module breakdown.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | TanStack Start (React + TypeScript), Tailwind CSS, shadcn/ui, Recharts, Zustand |
| Backend | NestJS, TypeScript, Prisma ORM, PostgreSQL, Redis, BullMQ, JWT auth, Swagger |
| Blockchain | Ethers.js, Alchemy webhooks (Notify API), Polygon Amoy testnet |
| AI | Claude API for risk explanations (structured JSON output) |
| Smart contract (optional) | Solidity demo contract (Foundry) on Polygon Amoy, used to trigger live demo events |

## Getting started

> Placeholder setup steps — to be filled in as each part of the system is built.

### Prerequisites

- Node.js (LTS)
- Docker & Docker Compose
- pnpm / npm
- Foundry (only if working with the demo contract)

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```
cp .env.example .env
```

### Infrastructure (Postgres + Redis)

```
docker compose up -d
```

### Backend

_Backend setup instructions will be added once the NestJS service is scaffolded._

### Frontend

```
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to view the landing page.

### Smart contracts

_Contract setup instructions will be added once the demo contract is added to `/contracts`._

## Project structure

```
blockpulse-ai/
├── README.md
├── LICENSE
├── .gitignore
├── docker-compose.yml
├── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   └── DEMO_SCRIPT.md
├── frontend/
├── backend/
│   ├── src/
│   └── prisma/
├── contracts/
└── scripts/
```

## About

Built solo for HackHazards '26, submitting under the Blockchain/AI track.
