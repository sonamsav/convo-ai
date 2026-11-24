import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String },
    senderType: {
      type: String,
      enum: ['customer', 'agent', 'bot', 'system'],
      required: true,
      index: true,
    },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read'],
      default: 'sent',
    },
    isInternalNote: { type: Boolean, default: false, index: true },
    attachments: [AttachmentSchema],
    aiGenerated: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversationId: 1, timestamp: 1 });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
