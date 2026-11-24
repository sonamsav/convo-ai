import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    leadAgentId: { type: String, required: true },
    members: [{ type: String }],
    channels: [{ type: String }],
    slaUrgentMinutes: { type: Number, default: 5 },
    slaResolutionMinutes: { type: Number, default: 240 },
    activeConversationsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);
export default Team;
