import { Customer } from '../models/Customer.js';

// Resilient fallback dataset if MongoDB is running offline
let inMemoryCustomers = [
  {
    id: 'cust-1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@acme.org',
    phone: '+1 (555) 234-5678',
    company: 'Acme Global Corp',
    segment: 'enterprise',
    status: 'active',
    sentiment: 'positive',
    arr: 120000,
    plan: 'Enterprise Tier',
    tags: ['Key Account', 'SOC-2 Signoff', 'Priority Support'],
    conversationsCount: 14,
    lastInteraction: new Date().toISOString(),
    notes: [
      {
        id: 'note-1',
        authorName: 'Alex Rivera',
        content: 'Customer requested SLA guarantees for custom Webhook payloads.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'cust-2',
    name: 'David Chen',
    email: 'd.chen@apextechnologies.io',
    phone: '+1 (555) 876-5432',
    company: 'Apex Technologies',
    segment: 'mid_market',
    status: 'active',
    sentiment: 'neutral',
    arr: 48000,
    plan: 'Growth Tier',
    tags: ['Renewal Upcoming'],
    conversationsCount: 8,
    lastInteraction: new Date().toISOString(),
    notes: [],
  },
  {
    id: 'cust-3',
    name: 'Sophia Patel',
    email: 'sophia@cloudscale.net',
    phone: '+1 (555) 456-7890',
    company: 'CloudScale Networks',
    segment: 'enterprise',
    status: 'trial',
    sentiment: 'negative',
    arr: 85000,
    plan: 'Enterprise Pilot',
    tags: ['Escalation', 'Security Review'],
    conversationsCount: 19,
    lastInteraction: new Date().toISOString(),
    notes: [],
  },
];

export async function getCustomers(req, res, next) {
  try {
    const {
      search = '',
      segment = 'all',
      status = 'all',
      sentiment = 'all',
      page = 1,
      pageSize = 10,
    } = req.query;

    let filtered = [...inMemoryCustomers];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q)
      );
    }

    if (segment !== 'all') filtered = filtered.filter((c) => c.segment === segment);
    if (status !== 'all') filtered = filtered.filter((c) => c.status === status);
    if (sentiment !== 'all') filtered = filtered.filter((c) => c.sentiment === sentiment);

    const total = filtered.length;
    const startIndex = (Number(page) - 1) * Number(pageSize);
    const paginated = filtered.slice(startIndex, startIndex + Number(pageSize));

    res.json({
      success: true,
      data: {
        customers: paginated,
        pagination: {
          total,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(total / Number(pageSize)) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const customer = inMemoryCustomers.find((c) => c.id === req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: { message: `Customer ${req.params.id} not found.` },
      });
    }
    res.json({ success: true, data: { customer } });
  } catch (err) {
    next(err);
  }
}

export async function createCustomer(req, res, next) {
  try {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      conversationsCount: 0,
      lastInteraction: new Date().toISOString(),
      notes: [],
      ...req.body,
    };
    inMemoryCustomers.unshift(newCustomer);
    res.status(201).json({ success: true, data: { customer: newCustomer } });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const idx = inMemoryCustomers.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { message: `Customer ${req.params.id} not found.` },
      });
    }
    inMemoryCustomers[idx] = { ...inMemoryCustomers[idx], ...req.body };
    res.json({ success: true, data: { customer: inMemoryCustomers[idx] } });
  } catch (err) {
    next(err);
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const idx = inMemoryCustomers.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { message: `Customer ${req.params.id} not found.` },
      });
    }
    const [deleted] = inMemoryCustomers.splice(idx, 1);
    res.json({ success: true, data: { customer: deleted } });
  } catch (err) {
    next(err);
  }
}

export async function addCustomerNote(req, res, next) {
  try {
    const customer = inMemoryCustomers.find((c) => c.id === req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: { message: `Customer ${req.params.id} not found.` },
      });
    }
    const note = {
      id: `note-${Date.now()}`,
      authorName: req.body.authorName || 'Alex Rivera',
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };
    customer.notes.unshift(note);
    res.status(201).json({ success: true, data: { note } });
  } catch (err) {
    next(err);
  }
}
