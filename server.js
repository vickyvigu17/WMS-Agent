const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

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

// Import AI services (with error handling)
let aiResearch, aiQuestionGenerator;
try {
  aiResearch = require('./server/services/aiResearch');
  aiQuestionGenerator = require('./server/services/aiQuestionGenerator');
  console.log('✅ AI services loaded successfully');
} catch (error) {
  console.error('⚠️ Failed to load AI services:', error.message);
  console.log('🔄 Continuing with basic functionality...');
}

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

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    ai_services: {
      research: !!aiResearch,
      questions: !!aiQuestionGenerator,
      openai_key: !!process.env.OPENAI_API_KEY,
      serp_key: !!process.env.SERP_API_KEY
    }
  });
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

// Enhanced WMS Processes route
app.get('/api/wms-processes', (req, res) => {
  const processes = [
    {
      id: 1,
      name: "Receiving",
      category: "Inbound",
      description: "Process of accepting and processing incoming goods into the warehouse",
      typical_questions: [
        "What is your current daily receiving volume (number of receipts/SKUs)?",
        "How do you currently handle advance shipment notifications (ASNs)?",
        "What types of receiving documentation do you use (BOL, packing lists, POs)?",
        "Do you perform quality inspections during receiving? What percentage?",
        "How do you handle discrepancies between expected and actual receipts?",
        "What are your peak receiving hours and seasonal variations?",
        "Do you have dedicated receiving docks or shared dock doors?",
        "How do you manage cross-docking operations if applicable?"
      ],
      technical_considerations: [
        "ASN processing capabilities",
        "Mobile device integration for receiving",
        "Quality control workflows",
        "Exception handling procedures",
        "Vendor compliance requirements"
      ]
    },
    {
      id: 2,
      name: "Put-away",
      category: "Inbound",
      description: "Storing received goods in appropriate warehouse locations based on business rules",
      typical_questions: [
        "What put-away strategies do you currently use (random, fixed, zone-based)?",
        "How do you determine optimal storage locations for received items?",
        "Do you use directed or operator-directed put-away processes?",
        "What product characteristics drive your storage decisions (ABC analysis, velocity, size)?",
        "How do you handle storage of hazardous or special handling materials?"
      ]
    },
    {
      id: 3,
      name: "Picking",
      category: "Outbound",
      description: "Retrieving items from storage locations to fulfill customer orders",
      typical_questions: [
        "What picking methods do you currently use (piece, case, pallet, batch)?",
        "What is your current pick accuracy rate and target?",
        "How do you optimize pick paths and minimize travel time?",
        "Do you use any pick validation technology (barcode, RFID, voice, light)?",
        "How do you handle partial picks and backorders?"
      ]
    },
    {
      id: 4,
      name: "Inventory Management",
      category: "Inventory",
      description: "Maintaining accurate inventory records and optimizing stock levels",
      typical_questions: [
        "What is your current inventory accuracy rate and how is it measured?",
        "How frequently do you perform cycle counts and physical inventories?",
        "How do you handle inventory adjustments and variance resolution?",
        "What lot tracking or serialization requirements do you have?",
        "How do you manage expiration dates and FIFO/LIFO requirements?"
      ]
    }
  ];

  res.json(processes);
});

// Enhanced Market Research routes with AI
app.get('/api/clients/:clientId/research', (req, res) => {
  const clientResearch = marketResearch.filter(r => r.client_id == req.params.clientId);
  res.json(clientResearch);
});

app.post('/api/clients/:clientId/research', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const { research_type } = req.body;
    let researchResult;

    // Use AI to conduct different types of research
    if (aiResearch) {
      console.log(`🤖 Conducting AI research: ${research_type} for ${client.name}`);
      
      switch (research_type.toLowerCase()) {
        case 'company overview':
        case 'company_overview':
          researchResult = await aiResearch.conductCompanyResearch(client.name);
          break;
        
        case 'supply chain':
        case 'supply_chain':
        case 'supply chain analysis':
          researchResult = await aiResearch.conductSupplyChainResearch(client.name);
          break;
        
        case 'competitor analysis':
        case 'competitors':
          researchResult = await aiResearch.conductCompetitorResearch(client.name, client.industry);
          break;
        
        default:
          researchResult = await aiResearch.conductCompanyResearch(client.name);
      }
    } else {
      // Fallback when AI services not available
      researchResult = {
        company_name: client.name,
        research_type: research_type,
        results: `Research for ${client.name} - ${research_type}\n\n⚠️ AI research services not available. Please check:\n1. AI service files are uploaded\n2. API keys are configured\n3. Server has been restarted\n\nThis would normally provide comprehensive AI-powered analysis of the company's operations, supply chain, and competitive landscape.`,
        sources: ['AI services not available'],
        ai_powered: false,
        timestamp: new Date()
      };
    }

    const research = {
      id: Date.now(),
      client_id: clientId,
      research_type: researchResult.research_type,
      results: researchResult.results,
      sources: researchResult.sources || [],
      ai_powered: researchResult.ai_powered || false,
      created_at: new Date()
    };

    marketResearch.push(research);
    res.status(201).json(research);
  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({ error: 'Failed to conduct research: ' + error.message });
  }
});

// Enhanced Questions routes with AI generation
app.get('/api/projects/:projectId/questions', (req, res) => {
  const projectQuestions = questions.filter(q => q.project_id == req.params.projectId);
  res.json(projectQuestions);
});

app.post('/api/projects/:projectId/questions/generate', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const client = clients.find(c => c.id === project.client_id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    let generatedQuestions;

    // Use AI to generate comprehensive questions
    if (aiQuestionGenerator) {
      console.log(`🤖 Generating AI questions for ${client.name} - ${project.name}`);
      generatedQuestions = await aiQuestionGenerator.generateWMSQuestions(
        client,
        project,
        req.body.question_types || []
      );
    } else {
      // Fallback when AI services not available
      generatedQuestions = [
        {
          id: Date.now(),
          category: "General",
          subcategory: "Current State",
          question: `What is ${client.name}'s current warehouse management approach?`,
          priority: "high",
          reasoning: "Understanding current state is essential for WMS implementation",
          answered: false,
          ai_generated: false,
          created_at: new Date()
        },
        {
          id: Date.now() + 1,
          category: "Technology",
          subcategory: "Systems",
          question: `What technology systems does ${client.name} currently use for ${client.industry} operations?`,
          priority: "high",
          reasoning: "Technology assessment is critical for integration planning",
          answered: false,
          ai_generated: false,
          created_at: new Date()
        }
      ];
    }

    // Add project ID to each question
    const projectQuestions = generatedQuestions.map(q => ({
      ...q,
      project_id: projectId
    }));

    // Add to our questions array
    questions.push(...projectQuestions);

    console.log(`✅ Generated ${projectQuestions.length} questions for ${client.name}`);
    res.json(projectQuestions);
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: 'Failed to generate questions: ' + error.message });
  }
});

app.put('/api/questions/:id/answer', (req, res) => {
  const index = questions.findIndex(q => q.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Question not found' });
  questions[index] = { ...questions[index], answer: req.body.answer, answered: true };
  res.json(questions[index]);
});

// Add custom question
app.post('/api/projects/:projectId/questions', (req, res) => {
  const question = {
    id: Date.now(),
    project_id: parseInt(req.params.projectId),
    category: req.body.category || 'Custom',
    subcategory: req.body.subcategory || 'User Defined',
    question: req.body.question,
    priority: req.body.priority || 'medium',
    reasoning: req.body.reasoning || 'Custom question added by user',
    answered: false,
    ai_generated: false,
    created_at: new Date()
  };
  
  questions.push(question);
  res.status(201).json(question);
});

// IMPORTANT: Serve React app for ALL non-API routes (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 WMS Consultant Agent server running on port ${PORT}`);
  console.log(`🤖 AI Services Status:`);
  console.log(`   Research: ${aiResearch ? '✅ Loaded' : '❌ Not available'}`);
  console.log(`   Questions: ${aiQuestionGenerator ? '✅ Loaded' : '❌ Not available'}`);
  console.log(`   OpenAI Key: ${process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log(`   SERP Key: ${process.env.SERP_API_KEY ? '✅ Present' : '❌ Missing'}`);
});
