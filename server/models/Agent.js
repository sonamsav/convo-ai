import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    role: {
      type: String,
      enum: ['admin', 'manager', 'agent'],
      default: 'agent',
      index: true,
    },
    avatar: { type: String },
    status: {
      type: String,
      enum: ['online', 'busy', 'away', 'offline'],
      default: 'offline',
      index: true,
    },
    teams: [{ type: String }],
    maxCapacity: { type: Number, default: 8 },
    activeTickets: { type: Number, default: 0 },
    resolvedTicketsCount: { type: Number, default: 0 },
    csatScore: { type: Number, default: 4.8 },
    avgFirstResponseMinutes: { type: Number, default: 3.5 },
  },
  {
    timestamps: true,
  }
);

export const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
export default Agent;
