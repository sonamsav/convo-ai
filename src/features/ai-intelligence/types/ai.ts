export type ResponseTone =
  | 'Professional'
  | 'Friendly'
  | 'Empathetic'
  | 'Concise'
  | 'Formal';

export type SupportedLanguage = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ja';

export interface AiSummaryResult {
  overview: string;
  customerProblem: string;
  actionsTaken: string[];
  status: string;
  pendingActions: string[];
  recommendedNextStep: string;
}

export interface AiSmartReply {
  id: string;
  title: string;
  tone: string;
  text: string;
  confidence: number;
}

export interface AiSentimentResult {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number; // 0 - 100
  reasoning: string;
  emotionalIndicators: string[];
  recommendedAction: string;
}

export interface AiIntentResult {
  intent: string;
  explanation: string;
  confidence: number; // 0.0 - 1.0
  suggestedCategory: string;
  recommendedNextAction: string;
  detectedEntities?: { label: string; value: string }[];
}

export interface AiTranslationResult {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  detectedLanguageName: string;
  targetLanguage: string;
  confidence: number;
}

export interface AiInsightsResult {
  repeatedComplaints: string[];
  unresolvedConcerns: string[];
  escalationRisks: string[];
  frequentlyMentionedTopics: string[];
  importantRequests: string[];
  suggestedFollowUps: string[];
}

export interface AiUsageTelemetry {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  tokenConsumptionEstimate: number;
  usageByFeature: {
    summarize: number;
    smartReply: number;
    sentiment: number;
    intent: number;
    translate: number;
    insights: number;
  };
}

export interface AiConfig {
  enabled: boolean;
  model: string;
  defaultTone: ResponseTone;
  defaultLanguage: SupportedLanguage;
  summarizeFormat: string;
  autoSentiment: boolean;
}

export interface AiStatus {
  status: string;
  isLiveOpenAiConfigured: boolean;
  model: string;
  version: string;
  activeFeatures: string[];
}
