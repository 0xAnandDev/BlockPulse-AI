export interface ChatSuggestion {
  question: string
  answer: string
}

export const CHAT_SUGGESTIONS: Array<ChatSuggestion> = [
  {
    question: 'Why is my wallet marked medium risk?',
    answer:
      'Your wallet was flagged medium risk because it granted an unlimited token approval to a contract deployed only 2 days ago. Newly deployed contracts have no on-chain reputation yet, so we can\'t confirm they\'re safe. I recommend reviewing the approval and revoking it if you don\'t recognize the contract.',
  },
  {
    question: 'Explain this transaction.',
    answer:
      'This transaction transferred 42.3 ETH to an address that has never interacted with your wallet before. The receiving address was created 6 days ago and has no prior transaction history, which is why it was flagged as high risk. If this wasn\'t you, secure your wallet immediately.',
  },
  {
    question: 'What should I do next?',
    answer:
      'Based on your current risk profile, I\'d suggest: 1) Revoke the unlimited approval on the newly deployed contract, 2) Enable instant alerts for approvals above a custom threshold, and 3) Review the large transfer from earlier today to confirm it was intentional.',
  },
]

export const DEFAULT_CHAT_REPLY =
  'I looked into your monitored wallets and don\'t see anything urgent beyond what\'s already in your Alert Center. Ask me about a specific transaction, wallet, or risk level and I\'ll break it down in plain English.'
