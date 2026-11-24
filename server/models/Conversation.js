import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    ticketNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAvatar: { type: String },
    assignedAgentId: { type: String, default: null, index: true },
    assignedTeamId: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ['open', 'pending', 'resolved', 'closed', 'snoozed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    channel: {
      type: String,
      enum: ['web', 'email', 'whatsapp', 'slack', 'api'],
      default: 'web',
      index: true,
    },
    subject: { type: String, required: true },
    lastMessage: { type: String },
    lastMessageTimestamp: { type: Date, default: Date.now, index: true },
    unreadCount: { type: Number, default: 0 },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    slaBreached: { type: Boolean, default: false },
    firstResponseTimeMinutes: { type: Number },
    resolutionTimeMinutes: { type: Number },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ status: 1, priority: 1, lastMessageTimestamp: -1 });

export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
export default Conversation;
