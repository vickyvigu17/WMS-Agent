const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const db = require('./database');
const marketResearchService = require('./services/marketResearch');
const questionGeneratorService = require('./services/questionGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Client Management Routes

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.all('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get client by ID
app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create new client
app.post('/api/clients', async (req, res) => {
  try {
    const { name, industry, company_size, location, contact_email, contact_phone, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Client name is required' });
    }

    const result = await db.run(`
      INSERT INTO clients (name, industry, company_size, location, contact_email, contact_phone, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, industry, company_size, location, contact_email, contact_phone, description]);

    const client = await db.get('SELECT * FROM clients WHERE id = ?', [result.id]);
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { name, industry, company_size, location, contact_email, contact_phone, description } = req.body;
    
    await db.run(`
      UPDATE clients 
      SET name = ?, industry = ?, company_size = ?, location = ?, 
          contact_email = ?, contact_phone = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, industry, company_size, location, contact_email, contact_phone, description, req.params.id]);

    const client = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Project Management Routes

// Get all projects for a client
app.get('/api/clients/:clientId/projects', async (req, res) => {
  try {
    const projects = await db.all(`
      SELECT p.*, c.name as client_name 
      FROM projects p 
      JOIN clients c ON p.client_id = c.id 
      WHERE p.client_id = ? 
      ORDER BY p.created_at DESC
    `, [req.params.clientId]);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.get(`
      SELECT p.*, c.name as client_name, c.industry, c.company_size, c.location
      FROM projects p 
      JOIN clients c ON p.client_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
app.post('/api/clients/:clientId/projects', async (req, res) => {
  try {
    const { name, description, start_date, expected_completion } = req.body;
    const clientId = req.params.clientId;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Create project
    const result = await db.run(`
      INSERT INTO projects (client_id, name, description, start_date, expected_completion)
      VALUES (?, ?, ?, ?, ?)
    `, [clientId, name, description, start_date, expected_completion]);

    const project = await db.get(`
      SELECT p.*, c.name as client_name, c.industry, c.company_size, c.location
      FROM projects p 
      JOIN clients c ON p.client_id = c.id 
      WHERE p.id = ?
    `, [result.id]);

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Market Research Routes

// Conduct market research for client
app.post('/api/clients/:clientId/research', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Get client information
    const client = await db.get('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Conduct market research
    const researchResults = await marketResearchService.conductMarketResearch(clientId, {
      name: client.name,
      industry: client.industry,
      location: client.location,
      company_size: client.company_size
    });

    res.json({
      message: 'Market research completed successfully',
      research_count: researchResults.length,
      research: researchResults
    });
  } catch (error) {
    console.error('Error conducting market research:', error);
    res.status(500).json({ error: 'Failed to conduct market research' });
  }
});

// Get market research for client
app.get('/api/clients/:clientId/research', async (req, res) => {
  try {
    const research = await marketResearchService.getClientResearch(req.params.clientId);
    res.json(research);
  } catch (error) {
    console.error('Error fetching market research:', error);
    res.status(500).json({ error: 'Failed to fetch market research' });
  }
});

// Question Generation Routes

// Generate questions for project
app.post('/api/projects/:projectId/questions/generate', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Get project and client information
    const project = await db.get(`
      SELECT p.*, c.name, c.industry, c.company_size, c.location
      FROM projects p 
      JOIN clients c ON p.client_id = c.id 
      WHERE p.id = ?
    `, [projectId]);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get existing research data
    const researchData = await marketResearchService.getClientResearch(project.client_id);

    // Generate questions
    const questions = await questionGeneratorService.generateQuestionsForProject(
      projectId, 
      {
        name: project.name,
        industry: project.industry,
        company_size: project.company_size,
        location: project.location
      },
      researchData
    );

    res.json({
      message: 'Questions generated successfully',
      question_count: questions.length,
      questions: questions
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Get questions for project
app.get('/api/projects/:projectId/questions', async (req, res) => {
  try {
    const questions = await questionGeneratorService.getProjectQuestions(req.params.projectId);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Update question answer
app.put('/api/questions/:questionId', async (req, res) => {
  try {
    const { answer, notes } = req.body;
    
    await questionGeneratorService.updateQuestionAnswer(req.params.questionId, answer, notes);
    
    const updatedQuestion = await db.get('SELECT * FROM questions WHERE id = ?', [req.params.questionId]);
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Add custom question to project
app.post('/api/projects/:projectId/questions', async (req, res) => {
  try {
    const { category, question, question_type, priority } = req.body;
    const projectId = req.params.projectId;
    
    if (!question) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    const result = await db.run(`
      INSERT INTO questions (project_id, category, question, question_type, priority)
      VALUES (?, ?, ?, ?, ?)
    `, [projectId, category || 'custom', question, question_type || 'custom', priority || 1]);

    const newQuestion = await db.get('SELECT * FROM questions WHERE id = ?', [result.id]);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error adding custom question:', error);
    res.status(500).json({ error: 'Failed to add custom question' });
  }
});

// WMS Processes Reference Routes

// Get all WMS processes
app.get('/api/wms-processes', async (req, res) => {
  try {
    const processes = await db.all('SELECT * FROM wms_processes ORDER BY category, process_name');
    res.json(processes);
  } catch (error) {
    console.error('Error fetching WMS processes:', error);
    res.status(500).json({ error: 'Failed to fetch WMS processes' });
  }
});

// Dashboard/Analytics Routes

// Get dashboard summary
app.get('/api/dashboard', async (req, res) => {
  try {
    const [clientCount] = await db.all('SELECT COUNT(*) as count FROM clients');
    const [projectCount] = await db.all('SELECT COUNT(*) as count FROM projects');
    const [researchCount] = await db.all('SELECT COUNT(*) as count FROM market_research');
    const [questionCount] = await db.all('SELECT COUNT(*) as count FROM questions');
    const [answeredQuestions] = await db.all('SELECT COUNT(*) as count FROM questions WHERE is_answered = 1');

    const recentProjects = await db.all(`
      SELECT p.id, p.name, p.status, p.created_at, c.name as client_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    const industryDistribution = await db.all(`
      SELECT industry, COUNT(*) as count
      FROM clients
      WHERE industry IS NOT NULL
      GROUP BY industry
      ORDER BY count DESC
    `);

    res.json({
      summary: {
        total_clients: clientCount.count,
        total_projects: projectCount.count,
        total_research_items: researchCount.count,
        total_questions: questionCount.count,
        answered_questions: answeredQuestions.count,
        question_completion_rate: questionCount.count > 0 
          ? Math.round((answeredQuestions.count / questionCount.count) * 100) 
          : 0
      },
      recent_projects: recentProjects,
      industry_distribution: industryDistribution
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Serve React app for production (catch-all handler)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`WMS Consultant Agent server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});