const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Simple in-memory storage for demo (you could replace with a database)
let clients = [
  { id: 1, name: 'Walmart', industry: 'Retail', location: 'Bentonville, AR', company_size: 'Large', created_at: '2024-01-15' },
  { id: 2, name: 'Amazon', industry: 'E-commerce', location: 'Seattle, WA', company_size: 'Large', created_at: '2024-01-20' },
  { id: 3, name: 'Target', industry: 'Retail', location: 'Minneapolis, MN', company_size: 'Large', created_at: '2024-02-01' }
];

let projects = [
  { id: 1, client_id: 1, name: 'DC Modernization', description: 'Modernize distribution center operations', status: 'active', created_at: '2024-01-16' },
  { id: 2, client_id: 2, name: 'Fulfillment Optimization', description: 'Optimize order fulfillment processes', status: 'planning', created_at: '2024-01-22' },
  { id: 3, client_id: 3, name: 'Inventory Management', description: 'Implement advanced inventory tracking', status: 'active', created_at: '2024-02-02' }
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
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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

// Clients routes
app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.get('/api/clients/:id', (req, res) => {
  const client = clients.find(c => c.id === parseInt(req.params.id));
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  res.json(client);
});

app.post('/api/clients', (req, res) => {
  const newClient = {
    id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  clients.push(newClient);
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', (req, res) => {
  const clientIndex = clients.findIndex(c => c.id === parseInt(req.params.id));
  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }
  
  clients[clientIndex] = { ...clients[clientIndex], ...req.body };
  res.json(clients[clientIndex]);
});

// Projects routes
app.get('/api/projects', (req, res) => {
  const projectsWithClients = projects.map(project => {
    const client = clients.find(c => c.id === project.client_id);
    return {
      ...project,
      client_name: client ? client.name : 'Unknown Client'
    };
  });
  res.json(projectsWithClients);
});

app.get('/api/clients/:clientId/projects', (req, res) => {
  const clientProjects = projects.filter(p => p.client_id === parseInt(req.params.clientId));
  res.json(clientProjects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const client = clients.find(c => c.id === project.client_id);
  res.json({
    ...project,
    client_name: client ? client.name : 'Unknown Client',
    client: client
  });
});

app.post('/api/clients/:clientId/projects', (req, res) => {
  const newProject = {
    id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
    client_id: parseInt(req.params.clientId),
    ...req.body,
    created_at: new Date().toISOString()
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

// Dashboard route
app.get('/api/dashboard', (req, res) => {
  const stats = {
    total_clients: clients.length,
    total_projects: projects.length,
    total_questions: questions.length,
    total_research: marketResearch.length,
    recent_projects: projects.slice(-3).map(project => {
      const client = clients.find(c => c.id === project.client_id);
      return {
        ...project,
        client_name: client ? client.name : 'Unknown Client'
      };
    })
  };
  res.json(stats);
});

// Enhanced WMS Processes route
app.get('/api/wms-processes', (req, res) => {
  const wmsProcesses = [
    // Inbound Operations
    { id: 1, category: 'Inbound', process_name: 'Receiving', description: 'Receive and inspect incoming goods' },
    { id: 2, category: 'Inbound', process_name: 'Putaway', description: 'Store items in optimal locations' },
    { id: 3, category: 'Inbound', process_name: 'Cross-docking', description: 'Direct transfer without storage' },
    
    // Inventory Management
    { id: 4, category: 'Inventory', process_name: 'Cycle Counting', description: 'Regular inventory accuracy checks' },
    { id: 5, category: 'Inventory', process_name: 'ABC Analysis', description: 'Categorize inventory by value/movement' },
    { id: 6, category: 'Inventory', process_name: 'Replenishment', description: 'Maintain optimal stock levels' },
    
    // Outbound Operations
    { id: 7, category: 'Outbound', process_name: 'Order Picking', description: 'Collect items for customer orders' },
    { id: 8, category: 'Outbound', process_name: 'Packing', description: 'Package items for shipment' },
    { id: 9, category: 'Outbound', process_name: 'Shipping', description: 'Dispatch orders to customers' },
    
    // Value-added Services
    { id: 10, category: 'Value-added', process_name: 'Kitting', description: 'Assemble product bundles' },
    { id: 11, category: 'Value-added', process_name: 'Returns Processing', description: 'Handle returned merchandise' },
    { id: 12, category: 'Value-added', process_name: 'Quality Control', description: 'Inspect and test products' },
    
    // Technology & Integration
    { id: 13, category: 'Technology', process_name: 'WMS Integration', description: 'Connect with ERP and other systems' },
    { id: 14, category: 'Technology', process_name: 'Automation Systems', description: 'Robotic and conveyor systems' },
    { id: 15, category: 'Technology', process_name: 'Mobile Devices', description: 'RF scanners and mobile applications' }
  ];
  
  res.json(wmsProcesses);
});

// Enhanced Market Research routes with AI
app.post('/api/clients/:clientId/research', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log(`🔍 Conducting market research for ${client.name}`);

    let researchResults = [];
    
    if (aiResearch) {
      try {
        // Conduct AI-powered research
        const [companyResearch, supplyChainResearch, competitorResearch] = await Promise.all([
          aiResearch.conductCompanyResearch(client.name),
          aiResearch.conductSupplyChainResearch(client.name),
          aiResearch.conductCompetitorResearch(client.name, client.industry)
        ]);

        researchResults = [
          { type: 'company_overview', ...companyResearch },
          { type: 'supply_chain', ...supplyChainResearch },
          { type: 'competitor_analysis', ...competitorResearch }
        ];
      } catch (error) {
        console.error('AI research error:', error);
        // Fallback to basic research
        researchResults = [{
          type: 'basic_info',
          title: `Basic Information for ${client.name}`,
          content: `Industry: ${client.industry}, Location: ${client.location}, Size: ${client.company_size}`
        }];
      }
    } else {
      // Fallback research
      researchResults = [{
        type: 'basic_info',
        title: `Basic Information for ${client.name}`,
        content: `Industry: ${client.industry}, Location: ${client.location}, Size: ${client.company_size}`
      }];
    }

    // Store research results
    const research = {
      id: marketResearch.length + 1,
      client_id: clientId,
      research_type: 'comprehensive',
      results: researchResults,
      created_at: new Date().toISOString()
    };
    
    marketResearch.push(research);

    res.json({
      success: true,
      research: researchResults,
      message: 'Market research completed successfully'
    });
  } catch (error) {
    console.error('Market research error:', error);
    res.status(500).json({ error: 'Failed to conduct market research' });
  }
});

// Enhanced Questions routes with AI generation
app.post('/api/projects/:projectId/questions/generate', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const client = clients.find(c => c.id === project.client_id);
    
    console.log(`🤖 Generating questions for project: ${project.name}`);

    let generatedQuestions = [];
    
    if (aiQuestionGenerator) {
      try {
        generatedQuestions = await aiQuestionGenerator.generateWMSQuestions(
          {
            name: client.name,
            industry: client.industry,
            company_size: client.company_size,
            location: client.location
          },
          {
            name: project.name,
            description: project.description,
            type: 'WMS Implementation'
          }
        );
      } catch (error) {
        console.error('AI question generation error:', error);
        // Fallback questions
        generatedQuestions = [
          { id: Date.now(), text: `What are the main warehouse challenges for ${client.name}?`, category: 'General', priority: 'High' },
          { id: Date.now() + 1, text: 'What is your current order volume and SKU count?', category: 'Inventory', priority: 'High' },
          { id: Date.now() + 2, text: 'What integration requirements do you have with existing systems?', category: 'Integration', priority: 'Medium' }
        ];
      }
    } else {
      // Fallback questions
      generatedQuestions = [
        { id: Date.now(), text: `What are the main warehouse challenges for ${client.name}?`, category: 'General', priority: 'High' },
        { id: Date.now() + 1, text: 'What is your current order volume and SKU count?', category: 'Inventory', priority: 'High' },
        { id: Date.now() + 2, text: 'What integration requirements do you have with existing systems?', category: 'Integration', priority: 'Medium' }
      ];
    }

    // Store generated questions
    generatedQuestions.forEach(q => {
      q.project_id = projectId;
      q.created_at = new Date().toISOString();
      questions.push(q);
    });

    res.json({
      success: true,
      questions: generatedQuestions,
      count: generatedQuestions.length
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// NEW: AI-powered Question Bank generation endpoints
app.post('/api/question-bank/generate', async (req, res) => {
  try {
    const { category, count = 10, priority = 'Mixed', complexity = 'Mixed' } = req.body;
    
    console.log(`🤖 Generating ${count} questions for category: ${category}`);
    
    if (!aiQuestionGenerator) {
      return res.status(500).json({ 
        error: 'AI Question Generator service not available',
        fallback: true 
      });
    }

    const questions = await aiQuestionGenerator.generateQuestionBankQuestions(
      category, 
      parseInt(count), 
      priority, 
      complexity
    );
    
    res.json({
      success: true,
      questions,
      count: questions.length,
      category,
      ai_powered: questions.some(q => q.ai_generated === true),
      generation_params: { count, priority, complexity }
    });
  } catch (error) {
    console.error('Question bank generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate question bank questions',
      message: error.message 
    });
  }
});

// NEW: Get available categories for AI generation
app.get('/api/question-bank/categories', (req, res) => {
  try {
    const categories = [
      { key: 'receiving', title: 'Receiving Operations', description: 'Inbound delivery processing, dock management, quality control' },
      { key: 'putaway', title: 'Putaway Management', description: 'Storage location assignment, putaway strategies, slotting optimization' },
      { key: 'inventory', title: 'Inventory Control', description: 'Stock tracking, cycle counting, inventory accuracy, ABC analysis' },
      { key: 'picking', title: 'Order Picking', description: 'Pick strategies, path optimization, task management, accuracy validation' },
      { key: 'packing', title: 'Packing Operations', description: 'Cartonization, packaging strategies, pack verification, labeling' },
      { key: 'shipping', title: 'Shipping Management', description: 'Carrier management, rate shopping, shipment tracking, documentation' },
      { key: 'yard', title: 'Yard Management', description: 'Trailer tracking, dock scheduling, yard operations, detention tracking' },
      { key: 'labor', title: 'Labor Management', description: 'Workforce planning, productivity tracking, performance metrics, incentives' },
      { key: 'configuration', title: 'System Configuration', description: 'Warehouse setup, zones, locations, storage types, business rules' },
      { key: 'technology', title: 'Technology Integration', description: 'ERP integration, system interfaces, APIs, data synchronization' },
      { key: 'automation', title: 'Warehouse Automation', description: 'Conveyor systems, robotics, AS/RS, automated equipment integration' },
      { key: 'mobile', title: 'Mobile Technology', description: 'RF devices, mobile interfaces, barcode scanning, offline capabilities' },
      { key: 'reporting', title: 'Reporting & Analytics', description: 'KPIs, dashboards, standard reports, business intelligence' },
      { key: 'compliance', title: 'Compliance & Quality', description: 'Regulatory compliance, lot traceability, quality control, audit trails' },
      { key: 'orders', title: 'Order Management', description: 'Order processing, prioritization, allocation, customer requirements' },
      { key: 'returns', title: 'Returns Processing', description: 'Return workflows, RMA processing, disposition rules, refurbishment' },
      { key: 'implementation', title: 'Implementation Planning', description: 'Go-live strategy, data migration, training, testing, change management' },
      { key: 'support', title: 'Support & Maintenance', description: 'Ongoing support, SLAs, upgrades, documentation, knowledge transfer' }
    ];
    
    res.json({
      success: true,
      categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error.message 
    });
  }
});

// NEW: Bulk generate questions for multiple categories
app.post('/api/question-bank/bulk-generate', async (req, res) => {
  try {
    const { categories, questionsPerCategory = 5, priority = 'Mixed', complexity = 'Mixed' } = req.body;
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ 
        error: 'Categories array is required and must not be empty' 
      });
    }
    
    console.log(`🤖 Bulk generating ${questionsPerCategory} questions for ${categories.length} categories`);
    
    if (!aiQuestionGenerator) {
      return res.status(500).json({ 
        error: 'AI Question Generator service not available',
        fallback: true 
      });
    }

    const results = {};
    let totalQuestions = 0;
    
    // Generate questions for each category
    for (const category of categories) {
      try {
        const questions = await aiQuestionGenerator.generateQuestionBankQuestions(
          category, 
          questionsPerCategory, 
          priority, 
          complexity
        );
        
        results[category] = {
          success: true,
          questions,
          count: questions.length
        };
        totalQuestions += questions.length;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating questions for ${category}:`, error);
        results[category] = {
          success: false,
          error: error.message,
          questions: [],
          count: 0
        };
      }
    }
    
    res.json({
      success: true,
      results,
      totalQuestions,
      categoriesProcessed: categories.length,
      generation_params: { questionsPerCategory, priority, complexity }
    });
  } catch (error) {
    console.error('Bulk generation error:', error);
    res.status(500).json({ 
      error: 'Failed to bulk generate questions',
      message: error.message 
    });
  }
});

app.put('/api/questions/:id/answer', (req, res) => {
  const questionId = parseInt(req.params.id);
  const { answer } = req.body;
  
  const question = questions.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  question.answer = answer;
  question.is_answered = true;
  question.answered_at = new Date().toISOString();
  
  res.json(question);
});

app.post('/api/projects/:projectId/questions', (req, res) => {
  const newQuestion = {
    id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
    project_id: parseInt(req.params.projectId),
    ...req.body,
    created_at: new Date().toISOString()
  };
  questions.push(newQuestion);
  res.status(201).json(newQuestion);
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
  
  // Log AI service status
  if (aiResearch && aiQuestionGenerator) {
    console.log('🤖 AI services: READY');
    console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    console.log(`🔍 SerpAPI: ${process.env.SERP_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  } else {
    console.log('⚠️ AI services: LIMITED (using fallback)');
  }
});