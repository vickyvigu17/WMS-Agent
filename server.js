const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple in-memory storage for demo
let clients = [
  { id: 1, name: "Amazon Logistics", industry: "E-commerce", company_size: "Large", location: "Seattle, WA", created_at: new Date() },
  { id: 2, name: "Walmart Supply Chain", industry: "Retail", company_size: "Large", location: "Bentonville, AR", created_at: new Date() }
];
let projects = [
  { id: 1, client_id: 1, name: "WMS Implementation Phase 1", status: "active", created_at: new Date() }
];
let questions = [];
let marketResearch = [];

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Client routes
app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.get('/api/clients/:id', (req, res) => {
  const client = clients.find(c => c.id == req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
});

app.post('/api/clients', (req, res) => {
  const client = { id: Date.now(), ...req.body, created_at: new Date() };
  clients.push(client);
  res.status(201).json(client);
});

app.put('/api/clients/:id', (req, res) => {
  const index = clients.findIndex(c => c.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Client not found' });
  clients[index] = { ...clients[index], ...req.body };
  res.json(clients[index]);
});

// Project routes
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/clients/:clientId/projects', (req, res) => {
  const clientProjects = projects.filter(p => p.client_id == req.params.clientId);
  res.json(clientProjects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id == req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.post('/api/clients/:clientId/projects', (req, res) => {
  const project = { 
    id: Date.now(), 
    client_id: parseInt(req.params.clientId),
    ...req.body, 
    created_at: new Date() 
  };
  projects.push(project);
  res.status(201).json(project);
});

// Dashboard route
app.get('/api/dashboard', (req, res) => {
  const answeredQuestions = questions.filter(q => q.answered).length;
  const completionRate = questions.length > 0 ? Math.round((answeredQuestions / questions.length) * 100) : 0;
  
  res.json({
    summary: {
      total_clients: clients.length,
      total_projects: projects.length,
      total_questions: questions.length,
      answered_questions: answeredQuestions,
      question_completion_rate: completionRate
    },
    recent_projects: projects.slice(-5),
    industry_distribution: [
      { industry: 'E-commerce', count: clients.filter(c => c.industry === 'E-commerce').length },
      { industry: 'Retail', count: clients.filter(c => c.industry === 'Retail').length },
      { industry: 'Manufacturing', count: clients.filter(c => c.industry === 'Manufacturing').length },
      { industry: 'Healthcare', count: clients.filter(c => c.industry === 'Healthcare').length }
    ].filter(item => item.count > 0)
  });
});

// WMS Processes route
app.get('/api/wms-processes', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Receiving",
      category: "Inbound",
      description: "Process of accepting and processing incoming goods",
      typical_questions: [
        "What is your current receiving capacity?", 
        "How do you handle advance shipment notifications?",
        "What receiving documentation do you currently use?"
      ]
    },
    {
      id: 2,
      name: "Put-away",
      category: "Inbound", 
      description: "Storing received goods in appropriate warehouse locations",
      typical_questions: [
        "What put-away strategies do you currently use?", 
        "How do you determine optimal storage locations?",
        "Do you use directed or operator-directed put-away?"
      ]
    },
    {
      id: 3,
      name: "Picking",
      category: "Outbound",
      description: "Retrieving items from storage locations to fulfill orders",
      typical_questions: [
        "What picking methods do you currently use?",
        "How do you optimize pick paths?",
        "What is your current pick accuracy rate?"
      ]
    }
  ]);
});

// Market Research routes
app.get('/api/clients/:clientId/research', (req, res) => {
  const clientResearch = marketResearch.filter(r => r.client_id == req.params.clientId);
  res.json(clientResearch);
});

app.post('/api/clients/:clientId/research', (req, res) => {
  const research = {
    id: Date.now(),
    client_id: parseInt(req.params.clientId),
    research_type: req.body.research_type,
    results: `Mock ${req.body.research_type} research results for client`,
    created_at: new Date()
  };
  marketResearch.push(research);
  res.status(201).json(research);
});

// Questions routes
app.get('/api/projects/:projectId/questions', (req, res) => {
  const projectQuestions = questions.filter(q => q.project_id == req.params.projectId);
  res.json(projectQuestions);
});

app.post('/api/projects/:projectId/questions/generate', (req, res) => {
  const generatedQuestions = [
    {
      id: Date.now(),
      project_id: parseInt(req.params.projectId),
      category: "WMS Process",
      question: "What is your current inventory accuracy rate?",
      priority: "high",
      answered: false,
      created_at: new Date()
    },
    {
      id: Date.now() + 1,
      project_id: parseInt(req.params.projectId),
      category: "Technical",
      question: "What ERP system are you currently using?",
      priority: "medium", 
      answered: false,
      created_at: new Date()
    }
  ];
  
  questions.push(...generatedQuestions);
  res.json(generatedQuestions);
});

app.put('/api/questions/:id/answer', (req, res) => {
  const index = questions.findIndex(q => q.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Question not found' });
  questions[index] = { ...questions[index], answer: req.body.answer, answered: true };
  res.json(questions[index]);
});

// Serve React app for production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`WMS Consultant Agent server running on port ${PORT}`);
});
