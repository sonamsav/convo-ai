export let inMemoryAgents = [
  {
    id: 'agent-1',
    name: 'Sarah Connor',
    email: 'sarah.connor@convoai.io',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'online',
    teams: ['Enterprise VIP', 'Technical Escalations'],
    maxCapacity: 8,
    activeTickets: 4,
    resolvedTicketsCount: 142,
    csatScore: 4.9,
    avgFirstResponseMinutes: 2.1,
  },
  {
    id: 'agent-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@convoai.io',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'online',
    teams: ['Billing & Subscriptions'],
    maxCapacity: 10,
    activeTickets: 5,
    resolvedTicketsCount: 98,
    csatScore: 4.7,
    avgFirstResponseMinutes: 4.2,
  },
  {
    id: 'agent-3',
    name: 'Elena Rostova',
    email: 'elena.rostova@convoai.io',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    status: 'busy',
    teams: ['Frontline Support'],
    maxCapacity: 6,
    activeTickets: 6,
    resolvedTicketsCount: 184,
    csatScore: 4.8,
    avgFirstResponseMinutes: 3.0,
  },
  {
    id: 'agent-4',
    name: 'David Kim',
    email: 'david.kim@convoai.io',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'online',
    teams: ['Technical Escalations'],
    maxCapacity: 8,
    activeTickets: 3,
    resolvedTicketsCount: 112,
    csatScore: 4.6,
    avgFirstResponseMinutes: 5.1,
  },
];

export async function getAgents(req, res, next) {
  try {
    const { team = 'all', status = 'all' } = req.query;
    let list = [...inMemoryAgents];

    if (team !== 'all') {
      list = list.filter((a) => a.teams.includes(team));
    }
    if (status !== 'all') {
      list = list.filter((a) => a.status === status);
    }

    res.json({
      success: true,
      data: {
        agents: list,
        total: list.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAgentById(req, res, next) {
  try {
    const agent = inMemoryAgents.find((a) => a.id === req.params.id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: { message: `Agent ${req.params.id} not found.` },
      });
    }
    res.json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}

export async function updateAgentStatus(req, res, next) {
  try {
    const { status } = req.body;
    const agent = inMemoryAgents.find((a) => a.id === req.params.id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: { message: `Agent ${req.params.id} not found.` },
      });
    }
    agent.status = status;
    res.json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}
