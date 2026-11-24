export let inMemoryTeams = [
  {
    id: 'team-enterprise',
    name: 'Enterprise VIP Support',
    description: 'High-touch escalation triage and white-glove support for Tier-1 ARR accounts.',
    leadAgentId: 'agent-1',
    members: ['agent-1', 'agent-4'],
    channels: ['web', 'email', 'slack'],
    slaUrgentMinutes: 5,
    slaResolutionMinutes: 120,
    activeConversationsCount: 7,
  },
  {
    id: 'team-billing',
    name: 'Billing & Subscriptions',
    description: 'Manages invoice disputes, plan upgrades, payment failures, and credit notes.',
    leadAgentId: 'agent-2',
    members: ['agent-2'],
    channels: ['email', 'web'],
    slaUrgentMinutes: 15,
    slaResolutionMinutes: 240,
    activeConversationsCount: 5,
  },
  {
    id: 'team-technical',
    name: 'Technical Escalations',
    description: 'Deep architectural debugging, REST API integration, and webhook troubleshooting.',
    leadAgentId: 'agent-4',
    members: ['agent-1', 'agent-4'],
    channels: ['web', 'api'],
    slaUrgentMinutes: 10,
    slaResolutionMinutes: 180,
    activeConversationsCount: 6,
  },
  {
    id: 'team-frontline',
    name: 'Frontline Support',
    description: 'High-volume tier-1 customer inquiries, product walkthroughs, and FAQ guidance.',
    leadAgentId: 'agent-3',
    members: ['agent-3'],
    channels: ['web', 'whatsapp'],
    slaUrgentMinutes: 10,
    slaResolutionMinutes: 300,
    activeConversationsCount: 12,
  },
];

export async function getTeams(req, res, next) {
  try {
    res.json({ success: true, data: { teams: inMemoryTeams } });
  } catch (err) {
    next(err);
  }
}

export async function getTeamById(req, res, next) {
  try {
    const team = inMemoryTeams.find((t) => t.id === req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { message: `Team ${req.params.id} not found.` },
      });
    }
    res.json({ success: true, data: { team } });
  } catch (err) {
    next(err);
  }
}

export async function createTeam(req, res, next) {
  try {
    const newTeam = {
      id: `team-${Date.now()}`,
      activeConversationsCount: 0,
      ...req.body,
    };
    inMemoryTeams.push(newTeam);
    res.status(201).json({ success: true, data: { team: newTeam } });
  } catch (err) {
    next(err);
  }
}

export async function updateTeam(req, res, next) {
  try {
    const idx = inMemoryTeams.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { message: `Team ${req.params.id} not found.` },
      });
    }
    inMemoryTeams[idx] = { ...inMemoryTeams[idx], ...req.body };
    res.json({ success: true, data: { team: inMemoryTeams[idx] } });
  } catch (err) {
    next(err);
  }
}

export async function deleteTeam(req, res, next) {
  try {
    const idx = inMemoryTeams.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { message: `Team ${req.params.id} not found.` },
      });
    }
    const [deleted] = inMemoryTeams.splice(idx, 1);
    res.json({ success: true, data: { team: deleted } });
  } catch (err) {
    next(err);
  }
}
