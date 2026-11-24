import mongoose from 'mongoose';

const AutomationExecutionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    ruleId: { type: String, required: true, index: true },
    ruleName: { type: String, required: true },
    triggerEvent: { type: String, required: true },
    conversationId: { type: String, index: true },
    status: {
      type: String,
      enum: ['success', 'failed', 'condition_not_met'],
      required: true,
      index: true,
    },
    actionsExecuted: [
      {
        type: { type: String, required: true },
        success: { type: Boolean, default: true },
        error: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    durationMs: { type: Number, default: 0 },
    error: { type: String },
    executedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

export const AutomationExecution =
  mongoose.models.AutomationExecution ||
  mongoose.model('AutomationExecution', AutomationExecutionSchema);
export default AutomationExecution;
