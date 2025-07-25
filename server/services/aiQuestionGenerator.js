const axios = require('axios');

class AIQuestionGenerator {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.serpApiKey = process.env.SERP_API_KEY;
  }

  // Existing method for project-specific questions
  async generateWMSQuestions(clientInfo, projectInfo, questionCategories = []) {
    if (!this.openaiApiKey || !this.serpApiKey) {
      console.log('🤖 Using fallback questions - API keys not configured');
      return this.getFallbackQuestions(clientInfo);
    }

    try {
      console.log(`🔍 Researching company: ${clientInfo.name}`);
      const companyData = await this.researchCompanyForQuestions(clientInfo.name, clientInfo.industry);
      
      console.log(`🤖 Generating AI-powered WMS questions for ${clientInfo.name}`);
      const aiQuestions = await this.generateQuestionsWithLLM(clientInfo, projectInfo, companyData);
      
      if (aiQuestions && aiQuestions.length > 0) {
        console.log(`✅ Generated ${aiQuestions.length} AI-powered questions`);
        return aiQuestions;
      } else {
        console.log('⚠️ AI generation returned empty, using fallback');
        return this.getFallbackQuestions(clientInfo);
      }
    } catch (error) {
      console.error('❌ Error in AI question generation:', error.message);
      return this.getFallbackQuestions(clientInfo);
    }
  }

  // NEW: Generate questions for Question Bank by category
  async generateQuestionBankQuestions(category, count = 10, priority = 'Mixed', complexity = 'Mixed') {
    if (!this.openaiApiKey) {
      console.log('🤖 Using fallback questions - OpenAI API key not configured');
      return this.getFallbackQuestionBankQuestions(category, count);
    }

    try {
      console.log(`🤖 Generating ${count} AI-powered questions for category: ${category}`);
      
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
        `${this.openaiBaseURL || 'https://api.openai.com/v1'}/chat/completions`,
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
      putaway: {
        title: "Putaway Management",
        description: "Storage location assignment, putaway strategies, slotting optimization",
        focusAreas: [
          "Putaway strategy rules (FIFO, LIFO, location-based)",
          "Slotting optimization algorithms",
          "Storage type management (bulk, rack, floor)",
          "Location assignment logic",
          "Putaway task prioritization",
          "Directed vs. random putaway",
          "Hazardous material handling",
          "Storage capacity optimization",
          "Putaway performance metrics",
          "Zone-based putaway strategies"
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
      packing: {
        title: "Packing Operations",
        description: "Cartonization, packaging strategies, pack verification, labeling",
        focusAreas: [
          "Cartonization algorithms and rules",
          "Package optimization strategies",
          "Pack verification procedures",
          "Special packaging requirements",
          "Labeling and documentation",
          "Packing productivity metrics",
          "Quality control in packing",
          "Gift wrapping and customization",
          "Packaging material management",
          "Pack-to-order processing"
        ]
      },
      shipping: {
        title: "Shipping Management",
        description: "Carrier management, rate shopping, shipment tracking, documentation",
        focusAreas: [
          "Multi-carrier management",
          "Rate shopping and optimization",
          "Shipment tracking and visibility",
          "Freight audit and payment",
          "International shipping documentation",
          "Shipment consolidation strategies",
          "Carrier performance management",
          "Delivery confirmation processes",
          "Exception handling procedures",
          "Shipping cost optimization"
        ]
      },
      yard: {
        title: "Yard Management",
        description: "Trailer tracking, dock scheduling, yard operations, detention tracking",
        focusAreas: [
          "Trailer tracking and visibility",
          "Dock door assignment logic",
          "Yard jockey management",
          "Detention and demurrage tracking",
          "Yard activity monitoring",
          "Trailer utilization optimization",
          "Gate management processes",
          "Yard safety procedures",
          "Equipment tracking in yard",
          "Yard capacity planning"
        ]
      },
      labor: {
        title: "Labor Management",
        description: "Workforce planning, productivity tracking, performance metrics, incentives",
        focusAreas: [
          "Workforce planning and scheduling",
          "Labor productivity tracking",
          "Performance metrics and KPIs",
          "Task interleaving optimization",
          "Engineered labor standards",
          "Incentive program management",
          "Training and certification tracking",
          "Cross-training capabilities",
          "Labor cost analysis",
          "Workload balancing"
        ]
      },
      configuration: {
        title: "System Configuration",
        description: "Warehouse setup, zones, locations, storage types, business rules",
        focusAreas: [
          "Warehouse zone configuration",
          "Location labeling schemes",
          "Storage type definitions",
          "Equipment configuration",
          "User roles and permissions",
          "Business rule setup",
          "Workflow configuration",
          "System integration points",
          "Master data management",
          "Configuration change control"
        ]
      },
      technology: {
        title: "Technology Integration",
        description: "ERP integration, system interfaces, APIs, data synchronization",
        focusAreas: [
          "ERP system integration",
          "API requirements and formats",
          "Real-time vs. batch processing",
          "Master data synchronization",
          "System interface architecture",
          "Data mapping and transformation",
          "Error handling and recovery",
          "Performance and scalability",
          "Security and authentication",
          "Integration monitoring"
        ]
      },
      automation: {
        title: "Warehouse Automation",
        description: "Conveyor systems, robotics, AS/RS, automated equipment integration",
        focusAreas: [
          "Conveyor system integration",
          "Robotic system coordination",
          "AS/RS system management",
          "Automated sortation systems",
          "Pick-to-light integration",
          "AGV/AMR coordination",
          "Automation control systems",
          "Equipment monitoring",
          "Automation ROI analysis",
          "Maintenance scheduling"
        ]
      },
      mobile: {
        title: "Mobile Technology",
        description: "RF devices, mobile interfaces, barcode scanning, offline capabilities",
        focusAreas: [
          "Mobile device requirements",
          "RF gun configuration",
          "Barcode scanning standards",
          "RFID integration",
          "Mobile interface design",
          "Offline functionality",
          "Device management",
          "Battery life optimization",
          "Rugged device specifications",
          "Mobile printing solutions"
        ]
      },
      reporting: {
        title: "Reporting & Analytics",
        description: "KPIs, dashboards, standard reports, business intelligence",
        focusAreas: [
          "Key performance indicators",
          "Real-time dashboards",
          "Standard report requirements",
          "Ad-hoc reporting capabilities",
          "Data visualization needs",
          "Historical data retention",
          "Business intelligence integration",
          "Report scheduling and distribution",
          "Performance benchmarking",
          "Analytics and insights"
        ]
      },
      compliance: {
        title: "Compliance & Quality",
        description: "Regulatory compliance, lot traceability, quality control, audit trails",
        focusAreas: [
          "Regulatory compliance requirements",
          "Lot traceability and recall",
          "Quality control processes",
          "Audit trail management",
          "Chain of custody tracking",
          "Temperature monitoring",
          "Documentation requirements",
          "Inspection procedures",
          "Compliance reporting",
          "Risk management"
        ]
      },
      orders: {
        title: "Order Management",
        description: "Order processing, prioritization, allocation, customer requirements",
        focusAreas: [
          "Order prioritization rules",
          "Allocation strategies",
          "Order splitting and consolidation",
          "Rush order handling",
          "Order modification processes",
          "Customer-specific requirements",
          "SLA management",
          "Order status tracking",
          "Backorder management",
          "Order fulfillment optimization"
        ]
      },
      returns: {
        title: "Returns Processing",
        description: "Return workflows, RMA processing, disposition rules, refurbishment",
        focusAreas: [
          "Return authorization processes",
          "Disposition rule management",
          "Return reason handling",
          "Restocking procedures",
          "Refurbishment workflows",
          "Return quality assessment",
          "Customer communication",
          "Return cost tracking",
          "Vendor return processing",
          "Return analytics"
        ]
      },
      implementation: {
        title: "Implementation Planning",
        description: "Go-live strategy, data migration, training, testing, change management",
        focusAreas: [
          "Implementation timeline planning",
          "Data migration strategies",
          "User training programs",
          "System testing procedures",
          "Change management processes",
          "Go-live preparation",
          "Cutover planning",
          "Risk mitigation strategies",
          "Communication plans",
          "Success criteria definition"
        ]
      },
      support: {
        title: "Support & Maintenance",
        description: "Ongoing support, SLAs, upgrades, documentation, knowledge transfer",
        focusAreas: [
          "Support level agreements",
          "Issue escalation procedures",
          "System upgrade planning",
          "Documentation requirements",
          "Knowledge transfer processes",
          "Performance monitoring",
          "Preventive maintenance",
          "User support training",
          "System optimization",
          "Continuous improvement"
        ]
      }
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
      // Try to extract JSON from the response
      let jsonText = generatedText;
      
      // Remove any markdown formatting
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON array in the text
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
      ],
      // Add more categories as needed...
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

  // ... existing methods (researchCompanyForQuestions, searchWeb, generateQuestionsWithLLM, etc.)
  async researchCompanyForQuestions(companyName, industry) {
    if (!this.serpApiKey) {
      return { company_info: 'Basic company research data', supply_chain_info: 'General supply chain information' };
    }

    try {
      const searchQueries = [
        `${companyName} warehouse operations supply chain`,
        `${companyName} distribution logistics technology`,
        `${companyName} inventory management systems`
      ];

      const searchResults = [];
      for (const query of searchQueries) {
        try {
          const result = await this.searchWeb(query);
          searchResults.push(result);
        } catch (error) {
          console.error(`Search failed for query: ${query}`, error.message);
        }
      }

      return {
        company_info: searchResults.length > 0 ? searchResults[0] : 'Limited company information available',
        supply_chain_info: searchResults.length > 1 ? searchResults[1] : 'General supply chain data',
        technology_info: searchResults.length > 2 ? searchResults[2] : 'Basic technology information'
      };
    } catch (error) {
      console.error('Company research error:', error.message);
      return { company_info: 'Research data unavailable', supply_chain_info: 'General information' };
    }
  }

  async searchWeb(query) {
    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google',
          q: query,
          api_key: this.serpApiKey,
          num: 5
        },
        timeout: 10000
      });

      const results = response.data.organic_results || [];
      return results.map(result => ({
        title: result.title,
        snippet: result.snippet,
        link: result.link
      })).slice(0, 3);
    } catch (error) {
      console.error('Web search error:', error.message);
      return [];
    }
  }

  async generateQuestionsWithLLM(clientInfo, projectInfo, companyData) {
    try {
      const prompt = `Based on the following company information, generate 15-20 highly specific WMS (Warehouse Management System) implementation questions for ${clientInfo.name}.

Company: ${clientInfo.name}
Industry: ${clientInfo.industry}
Project Type: ${projectInfo?.type || 'WMS Implementation'}

Company Research Data:
${JSON.stringify(companyData, null, 2)}

Generate questions that are:
1. Specific to their industry and company
2. Cover key WMS areas: receiving, putaway, picking, packing, shipping, inventory management
3. Include both technical and business process questions
4. Consider their likely supply chain challenges
5. Include integration and technology questions

Format as JSON array with structure:
[{"question": "question text", "category": "category_name", "priority": "High/Medium/Low"}]`;

      const response = await axios.post(
        `${this.openaiBaseURL || 'https://api.openai.com/v1'}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a WMS implementation expert. Generate specific, actionable questions for warehouse management system implementations.'
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
      return this.parseAIQuestions(generatedText, clientInfo);
    } catch (error) {
      console.error('LLM question generation error:', error.message);
      return [];
    }
  }

  parseAIQuestions(generatedText, clientInfo) {
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
          text: q.question || q.text || '',
          category: q.category || 'General',
          priority: q.priority || 'Medium',
          client_specific: true,
          generated_for: clientInfo.name
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing AI questions:', error.message);
      return [];
    }
  }

  getFallbackQuestions(clientInfo) {
    return [
      {
        id: 1,
        text: `What are your current warehouse management challenges specific to the ${clientInfo.industry} industry?`,
        category: 'General',
        priority: 'High',
        client_specific: false
      },
      {
        id: 2,
        text: 'How many SKUs do you currently manage and what is your order volume?',
        category: 'Inventory',
        priority: 'High',
        client_specific: false
      },
      {
        id: 3,
        text: 'What is your current picking methodology and accuracy rates?',
        category: 'Picking',
        priority: 'Medium',
        client_specific: false
      },
      {
        id: 4,
        text: 'Do you have any integration requirements with existing ERP or other systems?',
        category: 'Integration',
        priority: 'High',
        client_specific: false
      },
      {
        id: 5,
        text: 'What are your peak season capacity requirements?',
        category: 'Operations',
        priority: 'Medium',
        client_specific: false
      }
    ];
  }
}

module.exports = new AIQuestionGenerator();