import mongoose from 'mongoose';

const AiUsageRecordSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    feature: {
      type: String,
      enum: ['smart_reply', 'summarize', 'sentiment', 'intent', 'translation', 'insights'],
      required: true,
      index: true,
    },
    model: { type: String, default: 'gpt-4o' },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    status: { type: String, enum: ['success', 'error', 'fallback'], default: 'success' },
    requestedBy: { type: String, default: 'system' },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

export const AiUsageRecord =
  mongoose.models.AiUsageRecord || mongoose.model('AiUsageRecord', AiUsageRecordSchema);
export default AiUsageRecord;
