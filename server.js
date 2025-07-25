const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for production deployment (Render, Heroku, etc.)
app.set('trust proxy', 1);

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

// AI Services Implementation (embedded in server for reliability)
class AIResearchService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.serpApiKey = process.env.SERP_API_KEY;
  }

  async conductComprehensiveResearch(companyName, industry) {
    console.log(`🔍 Conducting comprehensive research for ${companyName}`);
    
    try {
      // Always generate comprehensive research results
      const researchResults = [];

      if (this.openaiApiKey) {
        // AI-powered research
        const [companyOverview, supplyChainAnalysis, competitorAnalysis, technologyAssessment] = await Promise.all([
          this.generateCompanyOverview(companyName, industry),
          this.generateSupplyChainAnalysis(companyName, industry),
          this.generateCompetitorAnalysis(companyName, industry),
          this.generateTechnologyAssessment(companyName, industry)
        ]);

        researchResults.push(
          { type: 'company_overview', ...companyOverview },
          { type: 'supply_chain_analysis', ...supplyChainAnalysis },
          { type: 'competitor_analysis', ...competitorAnalysis },
          { type: 'technology_assessment', ...technologyAssessment }
        );
      } else {
        // Comprehensive fallback research
        researchResults.push(
          this.getComprehensiveCompanyFallback(companyName, industry),
          this.getComprehensiveSupplyChainFallback(companyName, industry),
          this.getComprehensiveCompetitorFallback(companyName, industry),
          this.getComprehensiveTechnologyFallback(companyName, industry)
        );
      }

      return researchResults;
    } catch (error) {
      console.error('Research error:', error);
      // Return comprehensive fallback even on error
      return [
        this.getComprehensiveCompanyFallback(companyName, industry),
        this.getComprehensiveSupplyChainFallback(companyName, industry),
        this.getComprehensiveCompetitorFallback(companyName, industry),
        this.getComprehensiveTechnologyFallback(companyName, industry)
      ];
    }
  }

  async generateCompanyOverview(companyName, industry) {
    const prompt = `Generate a comprehensive company overview for ${companyName} in the ${industry} industry. Include:
    - Business model and operations
    - Revenue and scale
    - Market position
    - Key business challenges
    - Warehouse/logistics footprint
    - Recent news and developments
    
    Format as detailed analysis for WMS consultant preparation.`;

    return await this.callOpenAI(prompt, 'Company Overview', companyName);
  }

  async generateSupplyChainAnalysis(companyName, industry) {
    const prompt = `Analyze ${companyName}'s supply chain and logistics operations. Include:
    - Distribution network and warehouses
    - Inventory management approach
    - Transportation and logistics
    - Supplier relationships
    - Seasonal patterns and challenges
    - Technology stack and automation
    - Key pain points and opportunities
    
    Focus on warehouse management and fulfillment operations.`;

    return await this.callOpenAI(prompt, 'Supply Chain Analysis', companyName);
  }

  async generateCompetitorAnalysis(companyName, industry) {
    const prompt = `Analyze competitors of ${companyName} in the ${industry} industry. Include:
    - Top 3-5 direct competitors
    - Their WMS and logistics strategies
    - Competitive advantages/disadvantages
    - Market positioning differences
    - Technology adoption comparison
    - Best practices ${companyName} could adopt
    
    Focus on warehouse and fulfillment competitive landscape.`;

    return await this.callOpenAI(prompt, 'Competitor Analysis', companyName);
  }

  async generateTechnologyAssessment(companyName, industry) {
    const prompt = `Assess ${companyName}'s technology landscape and WMS requirements. Include:
    - Current technology stack
    - ERP and system integrations
    - Automation and robotics usage
    - Digital transformation initiatives
    - Cloud vs on-premise preferences
    - Mobile and IoT adoption
    - Key technology challenges and opportunities
    
    Focus on warehouse management technology needs.`;

    return await this.callOpenAI(prompt, 'Technology Assessment', companyName);
  }

  async callOpenAI(prompt, title, companyName) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a senior WMS consultant conducting research for client meetings. Provide detailed, actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        title: `${title} - ${companyName}`,
        content: response.data.choices[0].message.content,
        ai_generated: true,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error(`OpenAI error for ${title}:`, error.message);
      throw error;
    }
  }

  getComprehensiveCompanyFallback(companyName, industry) {
    return {
      type: 'company_overview',
      title: `Company Overview - ${companyName}`,
      content: `${companyName} is a major player in the ${industry} industry with significant warehouse and distribution operations. 

Key Business Areas:
- Large-scale retail/distribution operations
- Multi-channel fulfillment requirements
- Complex inventory management needs
- High-volume order processing

Operational Characteristics:
- Multiple distribution centers
- Seasonal demand fluctuations
- Diverse product portfolio
- Customer service focus

WMS Implementation Considerations:
- Need for scalable warehouse management
- Integration with existing ERP systems
- Real-time inventory visibility requirements
- Multi-location coordination needs

This analysis should be expanded with specific company research and current operational data for accurate WMS planning.`,
      ai_generated: false
    };
  }

  getComprehensiveSupplyChainFallback(companyName, industry) {
    return {
      type: 'supply_chain_analysis',
      title: `Supply Chain Analysis - ${companyName}`,
      content: `${companyName}'s supply chain operations in the ${industry} sector involve:

Distribution Network:
- Regional distribution centers
- Local fulfillment facilities
- Direct-to-consumer shipping
- Store replenishment operations

Key Processes:
- Inbound receiving and putaway
- Inventory management and control
- Order picking and fulfillment
- Shipping and transportation

Technology Requirements:
- Warehouse Management System (WMS)
- Transportation Management System (TMS)
- Inventory optimization tools
- Real-time tracking systems

Challenges:
- Peak season capacity management
- Inventory accuracy and visibility
- Order fulfillment speed
- Cost optimization

Opportunities:
- Process automation
- Advanced analytics
- Mobile technology adoption
- System integration improvements`,
      ai_generated: false
    };
  }

  getComprehensiveCompetitorFallback(companyName, industry) {
    return {
      type: 'competitor_analysis',
      title: `Competitive Landscape - ${companyName}`,
      content: `Analysis of ${companyName}'s competitive position in the ${industry} market:

Direct Competitors:
- Major players with similar operations
- Regional competitors with local advantages
- Online-first competitors with advanced fulfillment
- Traditional retailers with omnichannel strategies

Competitive Advantages:
- Scale and geographic coverage
- Brand recognition and customer loyalty
- Technology investments
- Operational efficiency

Areas for Improvement:
- Fulfillment speed and accuracy
- Inventory optimization
- Technology modernization
- Cost structure optimization

Best Practices to Adopt:
- Advanced warehouse automation
- Predictive analytics for demand planning
- Mobile-first warehouse operations
- Real-time inventory visibility

Strategic Recommendations:
- Invest in modern WMS capabilities
- Enhance omnichannel fulfillment
- Improve inventory accuracy
- Optimize warehouse layouts and processes`,
      ai_generated: false
    };
  }

  getComprehensiveTechnologyFallback(companyName, industry) {
    return {
      type: 'technology_assessment',
      title: `Technology Assessment - ${companyName}`,
      content: `Technology landscape analysis for ${companyName}:

Current Systems (Typical for ${industry}):
- Legacy ERP systems requiring integration
- Basic warehouse management tools
- Manual processes in key areas
- Limited real-time visibility

WMS Requirements:
- Modern, cloud-based architecture
- Real-time inventory tracking
- Mobile device support
- Advanced analytics and reporting
- Scalable to handle growth

Integration Needs:
- ERP system connectivity
- E-commerce platform integration
- Transportation management
- Customer service systems

Technology Priorities:
1. Implement modern WMS platform
2. Enhance mobile capabilities
3. Improve data analytics
4. Automate manual processes
5. Establish real-time visibility

Innovation Opportunities:
- IoT sensors for inventory tracking
- AI-powered demand forecasting
- Robotic process automation
- Voice-directed picking
- Predictive maintenance

Implementation Considerations:
- Phased rollout approach
- Change management requirements
- Training and adoption planning
- Performance measurement framework`,
      ai_generated: false
    };
  }
}

class AIQuestionGenerator {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async generateQuestionBankQuestions(category, count = 10, priority = 'Mixed', complexity = 'Mixed') {
    console.log(`🤖 Generating ${count} questions for category: ${category}`);
    
    if (!this.openaiApiKey) {
      console.log('🤖 Using fallback questions - OpenAI API key not configured');
      return this.getFallbackQuestionBankQuestions(category, count);
    }

    try {
      const categoryPrompts = this.getCategoryPrompts();
      const categoryInfo = categoryPrompts[category];
      
      if (!categoryInfo) {
        throw new Error(`Unknown category: ${category}`);
      }

      const priorityInstruction = this.getPriorityInstruction(priority);
      const complexityInstruction = this.getComplexityInstruction(complexity);

      const prompt = `You are a WMS (Warehouse Management System) implementation expert. Generate ${count} highly specific, actionable questions for the "${categoryInfo.title}" category.

CATEGORY DESCRIPTION: ${categoryInfo.description}

FOCUS AREAS: ${categoryInfo.focusAreas.join(', ')}

REQUIREMENTS:
- Generate exactly ${count} questions
- ${priorityInstruction}
- ${complexityInstruction}
- Questions should be specific, actionable, and relevant to WMS implementations
- Each question should help consultants understand client requirements
- Avoid generic questions - be specific to WMS processes
- Focus on operational, technical, and business aspects
- Include questions about current state, future requirements, and pain points

FORMAT: Return ONLY a JSON array with this exact structure:
[
  {
    "text": "Detailed question text here?",
    "priority": "High|Medium|Low",
    "category": "${category}",
    "focus_area": "specific_focus_area"
  }
]

EXAMPLE FOCUS AREAS FOR THIS CATEGORY: ${categoryInfo.focusAreas.slice(0, 3).join(', ')}

Generate diverse questions covering different aspects of ${categoryInfo.title}.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a WMS implementation expert who generates highly specific, actionable questions for warehouse management consultants. Always return valid JSON arrays.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const generatedText = response.data.choices[0].message.content.trim();
      const questions = this.parseAIQuestionBankResponse(generatedText, category);
      
      if (questions && questions.length > 0) {
        console.log(`✅ Generated ${questions.length} AI-powered questions for ${category}`);
        return questions;
      } else {
        console.log('⚠️ AI generation failed, using fallback');
        return this.getFallbackQuestionBankQuestions(category, count);
      }
    } catch (error) {
      console.error('❌ Error generating question bank questions:', error.message);
      return this.getFallbackQuestionBankQuestions(category, count);
    }
  }

  getCategoryPrompts() {
    return {
      receiving: {
        title: "Receiving Operations",
        description: "Inbound delivery processing, dock management, quality control, ASN handling",
        focusAreas: [
          "Advance Shipping Notice (ASN) processing",
          "Dock door management and scheduling",
          "Quality control and inspection processes",
          "Discrepancy handling and resolution",
          "Cross-docking operations",
          "Appointment scheduling systems",
          "Receiving documentation workflows",
          "Vendor compliance requirements",
          "Damage assessment procedures",
          "Receiving productivity metrics"
        ]
      },
      picking: {
        title: "Order Picking",
        description: "Pick strategies, path optimization, task management, accuracy validation",
        focusAreas: [
          "Picking methods (discrete, batch, wave, zone)",
          "Pick path optimization algorithms",
          "Task prioritization and sequencing",
          "Short pick handling procedures",
          "Pick accuracy validation methods",
          "Wave planning and management",
          "Voice, RF, and pick-to-light integration",
          "Pick productivity optimization",
          "Multi-order picking strategies",
          "Pick location replenishment"
        ]
      },
      inventory: {
        title: "Inventory Control",
        description: "Stock tracking, cycle counting, inventory accuracy, ABC analysis",
        focusAreas: [
          "Inventory tracking methods (lot, serial, batch)",
          "Cycle counting procedures and frequency",
          "Real-time inventory visibility",
          "Inventory adjustment processes",
          "ABC analysis and classification",
          "Expiration date tracking (FEFO)",
          "Inventory reservations and allocations",
          "Safety stock management",
          "Inventory variance reporting",
          "Physical inventory procedures"
        ]
      }
      // Add more categories as needed...
    };
  }

  getPriorityInstruction(priority) {
    switch (priority) {
      case 'High':
        return 'All questions should be High priority - critical for WMS success';
      case 'Medium':
        return 'All questions should be Medium priority - important but not critical';
      case 'Low':
        return 'All questions should be Low priority - nice to have or future considerations';
      default:
        return 'Mix priority levels: 40% High, 40% Medium, 20% Low priority questions';
    }
  }

  getComplexityInstruction(complexity) {
    switch (complexity) {
      case 'Basic':
        return 'Focus on fundamental, straightforward questions suitable for basic implementations';
      case 'Advanced':
        return 'Focus on complex, technical questions for sophisticated WMS implementations';
      case 'Expert':
        return 'Focus on expert-level questions covering edge cases and complex scenarios';
      default:
        return 'Mix complexity levels from basic operational questions to advanced technical requirements';
    }
  }

  parseAIQuestionBankResponse(generatedText, category) {
    try {
      let jsonText = generatedText;
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const questions = JSON.parse(jsonText);
      
      if (Array.isArray(questions)) {
        return questions.map((q, index) => ({
          id: Date.now() + index,
          text: q.text || q.question || '',
          priority: q.priority || 'Medium',
          category: category,
          focus_area: q.focus_area || 'General',
          ai_generated: true,
          generated_at: new Date().toISOString()
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing AI question bank response:', error.message);
      return [];
    }
  }

  getFallbackQuestionBankQuestions(category, count) {
    const fallbackQuestions = {
      receiving: [
        "What is your current receiving process workflow from truck arrival to inventory confirmation?",
        "How do you handle advance shipping notices (ASN) and what data is required?",
        "What are your dock door management and scheduling requirements?",
        "How do you manage quality control checks during receiving?",
        "What procedures do you have for handling receiving discrepancies?"
      ],
      picking: [
        "What picking methods do you currently use (discrete, batch, wave, zone)?",
        "How do you optimize pick paths and minimize travel time?",
        "What are your requirements for pick task prioritization?",
        "How do you handle short picks and back-order situations?",
        "What validation methods do you use to ensure pick accuracy?"
      ]
    };

    const questions = fallbackQuestions[category] || [
      `What are your main requirements for ${category}?`,
      `What challenges do you face with current ${category} processes?`,
      `How do you measure performance in ${category}?`,
      `What improvements do you want to see in ${category}?`,
      `What integration requirements do you have for ${category}?`
    ];

    return questions.slice(0, count).map((text, index) => ({
      id: Date.now() + index,
      text,
      priority: index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low',
      category,
      focus_area: 'General',
      ai_generated: false
    }));
  }
}

// Initialize AI services
const aiResearch = new AIResearchService();
const aiQuestionGenerator = new AIQuestionGenerator();

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

// Rate limiting with proxy support
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true // Trust proxy headers for accurate IP detection
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

// FIXED: Comprehensive Market Research route
app.post('/api/clients/:clientId/research', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log(`🔍 Conducting comprehensive research for ${client.name}`);

    // Generate comprehensive research automatically
    const researchResults = await aiResearch.conductComprehensiveResearch(client.name, client.industry);

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
      message: 'Comprehensive market research completed successfully',
      types_generated: ['company_overview', 'supply_chain_analysis', 'competitor_analysis', 'technology_assessment']
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

    let generatedQuestions = [
      { id: Date.now(), text: `What are the main warehouse challenges for ${client.name}?`, category: 'General', priority: 'High' },
      { id: Date.now() + 1, text: 'What is your current order volume and SKU count?', category: 'Inventory', priority: 'High' },
      { id: Date.now() + 2, text: 'What integration requirements do you have with existing systems?', category: 'Integration', priority: 'Medium' }
    ];

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

// AI-powered Question Bank generation endpoints
app.post('/api/question-bank/generate', async (req, res) => {
  try {
    const { category, count = 10, priority = 'Mixed', complexity = 'Mixed' } = req.body;
    
    console.log(`🤖 Generating ${count} questions for category: ${category}`);
    
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

// Get available categories for AI generation
app.get('/api/question-bank/categories', (req, res) => {
  try {
    const categories = [
      { key: 'receiving', title: 'Receiving Operations', description: 'Inbound delivery processing, dock management, quality control' },
      { key: 'picking', title: 'Order Picking', description: 'Pick strategies, path optimization, task management, accuracy validation' },
      { key: 'inventory', title: 'Inventory Control', description: 'Stock tracking, cycle counting, inventory accuracy, ABC analysis' }
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

// Bulk generate questions for multiple categories
app.post('/api/question-bank/bulk-generate', async (req, res) => {
  try {
    const { categories, questionsPerCategory = 5, priority = 'Mixed', complexity = 'Mixed' } = req.body;
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ 
        error: 'Categories array is required and must not be empty' 
      });
    }
    
    console.log(`🤖 Bulk generating ${questionsPerCategory} questions for ${categories.length} categories`);

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
  console.log('🤖 AI services: READY');
  console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`🔍 SerpAPI: ${process.env.SERP_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
});