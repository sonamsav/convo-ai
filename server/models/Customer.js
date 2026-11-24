import mongoose from 'mongoose';

const CustomerNoteSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    content: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true, index: true },
    avatar: { type: String },
    segment: {
      type: String,
      enum: ['enterprise', 'mid_market', 'smb', 'startup', 'vip'],
      default: 'smb',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'churned', 'trial', 'prospect'],
      default: 'active',
      index: true,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'frustrated'],
      default: 'neutral',
    },
    arr: { type: Number, default: 0 },
    plan: { type: String, default: 'Standard' },
    tags: [{ type: String, trim: true }],
    conversationsCount: { type: Number, default: 0 },
    lastInteraction: { type: Date, default: Date.now },
    notes: [CustomerNoteSchema],
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ name: 'text', company: 'text', email: 'text' });

export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export default Customer;
