import mongoose from 'mongoose';

const AutomationRuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    trigger: {
      event: { type: String, required: true },
      channel: { type: String, default: 'all' },
    },
    conditions: {
      logic: { type: String, enum: ['AND', 'OR'], default: 'AND' },
      rules: [
        {
          field: { type: String, required: true },
          operator: { type: String, required: true },
          value: { type: mongoose.Schema.Types.Mixed, required: true },
        },
      ],
    },
    actions: [
      {
        type: { type: String, required: true },
        params: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'paused', 'draft'],
      default: 'active',
      index: true,
    },
    executionCount: { type: Number, default: 0 },
    lastExecutedAt: { type: Date },
    createdBy: { type: String, default: 'Admin' },
  },
  {
    timestamps: true,
  }
);

export const AutomationRule =
  mongoose.models.AutomationRule || mongoose.model('AutomationRule', AutomationRuleSchema);
export default AutomationRule;
