import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    reportType: {
      type: String,
      enum: [
        'conversation_performance',
        'agent_performance',
        'customer_satisfaction',
        'ai_usage',
        'automation_performance',
        'customer_activity',
      ],
      required: true,
      index: true,
    },
    dateRange: { type: String, default: '30d' },
    format: { type: String, enum: ['csv', 'json', 'pdf'], default: 'csv' },
    columns: [{ type: String }],
    createdBy: { type: String, default: 'Admin' },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);
export default Report;
