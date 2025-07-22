const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Simple in-memory storage for demo (we'll upgrade to SQLite later)
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

// Project routes
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/clients/:clientId/projects', (req, res) => {
  const clientProjects = projects.filter(p => p.client_id == req.params.clientId);
  res.json(clientProjects);
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
  res.json({
    summary: {
      total_clients: clients.length,
      total_projects: projects.length
        total_questions: questions.length,
      answered_questions: 0,
      question_completion_rate: 0
    },
    recent_projects: projects.slice(-5),
    industry_distribution: [
      { industry: 'E-commerce', count: 1 },
      { industry: 'Retail', count: 1 }
    ]
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
      typical_questions: ["What is your current receiving capacity?", "How do you handle advance shipment notifications?"]
    },
    {
      id: 2,
      name: "Put-away",
      category: "Inbound", 
      description: "Storing received goods in appropriate warehouse locations",
      typical_questions: ["What put-away strategies do you currently use?", "How do you determine optimal storage locations?"]
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

  

  
      
        
