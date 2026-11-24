import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    workspaceId: { type: String, required: true, unique: true, index: true },
    general: {
      appName: { type: String, default: 'ConvoAI' },
      workspaceName: { type: String, default: 'Acme Global Support HQ' },
      companyName: { type: String, default: 'Acme Technologies Inc.' },
      companyWebsite: { type: String, default: 'https://acme.example.com' },
      supportEmail: { type: String, default: 'support@convoai.io' },
      defaultTimezone: { type: String, default: 'UTC' },
      defaultLanguage: { type: String, default: 'en' },
      dateFormat: { type: String, default: 'YYYY-MM-DD' },
    },
    workspace: {
      planTier: { type: String, default: 'Enterprise Growth' },
      customDomain: { type: String, default: 'support.acme.example.com' },
      slaUrgentMinutes: { type: Number, default: 5 },
      slaResolutionMinutes: { type: Number, default: 240 },
    },
    notifications: {
      inApp: { type: mongoose.Schema.Types.Mixed, default: {} },
      email: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    ai: {
      enabled: { type: Boolean, default: true },
      defaultTone: { type: String, default: 'empathetic' },
      defaultLanguage: { type: String, default: 'en' },
      enableAutoSummarize: { type: Boolean, default: true },
      enableSentimentTelemetry: { type: Boolean, default: true },
      enableSmartReply: { type: Boolean, default: true },
      visibility: { type: String, default: 'all_agents' },
    },
    security: {
      mfaEnforced: { type: Boolean, default: true },
      ssoEnabled: { type: Boolean, default: true },
      activeSessions: [{ type: mongoose.Schema.Types.Mixed }],
      loginHistory: [{ type: mongoose.Schema.Types.Mixed }],
    },
    appearance: {
      theme: { type: String, default: 'system' },
      compactMode: { type: Boolean, default: false },
      accentColor: { type: String, default: 'indigo' },
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
export default Setting;
