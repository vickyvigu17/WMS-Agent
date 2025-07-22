const db = require('../database');

class QuestionGeneratorService {
  constructor() {
    this.questionCategories = {
      'wms_processes': 'WMS Process Questions',
      'technical_architecture': 'Technical & Architecture Questions', 
      'business_requirements': 'Business Requirements Questions',
      'integration': 'Integration Questions',
      'client_specific': 'Client-Specific Questions'
    };
  }

  async generateQuestionsForProject(projectId, clientInfo, researchData) {
    try {
      const questions = [];
      
      // Generate different types of questions
      const wmsQuestions = await this.generateWMSProcessQuestions(clientInfo);
      const techQuestions = await this.generateTechnicalQuestions(clientInfo);
      const businessQuestions = await this.generateBusinessRequirementQuestions(clientInfo, researchData);
      const integrationQuestions = await this.generateIntegrationQuestions(clientInfo);
      const clientSpecificQuestions = await this.generateClientSpecificQuestions(clientInfo, researchData);

      questions.push(...wmsQuestions, ...techQuestions, ...businessQuestions, 
                    ...integrationQuestions, ...clientSpecificQuestions);

      // Save questions to database
      for (const question of questions) {
        await db.run(`
          INSERT INTO questions 
          (project_id, category, question, question_type, priority)
          VALUES (?, ?, ?, ?, ?)
        `, [projectId, question.category, question.question, 
            question.question_type, question.priority]);
      }

      return questions;
    } catch (error) {
      console.error('Question generation error:', error);
      throw error;
    }
  }

  async generateWMSProcessQuestions(clientInfo) {
    const questions = [];
    const { industry } = clientInfo;

    // Get WMS processes from database
    const processes = await db.all('SELECT * FROM wms_processes');
    
    for (const process of processes) {
      const processQuestions = JSON.parse(process.typical_questions || '[]');
      
      processQuestions.forEach((question, index) => {
        questions.push({
          category: 'wms_processes',
          question: `${process.process_name}: ${question}`,
          question_type: 'process',
          priority: this.calculatePriority(process.category, industry, index)
        });
      });

      // Add process-specific follow-up questions
      const followUpQuestions = this.generateProcessFollowUpQuestions(process, industry);
      questions.push(...followUpQuestions);
    }

    return questions;
  }

  generateProcessFollowUpQuestions(process, industry) {
    const questions = [];
    const processName = process.process_name.toLowerCase();

    const followUpMap = {
      'receiving': [
        'What percentage of your receipts have advance shipment notices (ASN)?',
        'How do you handle discrepancies between expected and actual receipts?',
        'What is your average dock-to-stock time?',
        'Do you require cross-docking capabilities?'
      ],
      'put-away': [
        'What is your current storage utilization rate?',
        'Do you use ABC analysis for slotting optimization?',
        'How often do you re-slot your inventory?',
        'What are your constraints for storage location assignment?'
      ],
      'picking': [
        'What is your current order fill rate?',
        'How many SKUs do you typically handle?',
        'What is your average lines per order?',
        'Do you need support for kitting or assembly operations?'
      ],
      'shipping': [
        'What are your on-time shipment performance targets?',
        'Do you need support for multiple shipping methods?',
        'How do you handle freight optimization?',
        'What compliance requirements do you have (hazmat, international)?'
      ],
      'inventory management': [
        'What is your current inventory accuracy rate?',
        'How frequently do you perform cycle counts?',
        'Do you need support for consignment inventory?',
        'What are your inventory turnover targets?'
      ]
    };

    const processQuestions = followUpMap[processName] || [];
    processQuestions.forEach((question, index) => {
      questions.push({
        category: 'wms_processes',
        question: `${process.process_name} Follow-up: ${question}`,
        question_type: 'process_followup',
        priority: 2 + index
      });
    });

    return questions;
  }

  async generateTechnicalQuestions(clientInfo) {
    const questions = [];
    const { industry, company_size } = clientInfo;

    const technicalQuestions = [
      // Architecture Questions
      {
        question: 'What is your preferred deployment model (cloud, on-premise, hybrid)?',
        category: 'technical_architecture',
        question_type: 'architecture',
        priority: 1
      },
      {
        question: 'What are your scalability requirements (users, transactions, locations)?',
        category: 'technical_architecture', 
        question_type: 'architecture',
        priority: 1
      },
      {
        question: 'What are your performance requirements (response time, throughput)?',
        category: 'technical_architecture',
        question_type: 'performance',
        priority: 2
      },
      {
        question: 'What are your disaster recovery and business continuity requirements?',
        category: 'technical_architecture',
        question_type: 'infrastructure',
        priority: 2
      },

      // Security Questions
      {
        question: 'What are your data security and compliance requirements?',
        category: 'technical_architecture',
        question_type: 'security',
        priority: 1
      },
      {
        question: 'Do you require role-based access control and user management?',
        category: 'technical_architecture',
        question_type: 'security',
        priority: 2
      },

      // Mobile & Hardware Questions
      {
        question: 'What mobile devices and form factors do you need to support?',
        category: 'technical_architecture',
        question_type: 'mobile',
        priority: 1
      },
      {
        question: 'What scanning technology do you use (barcode, RFID, voice)?',
        category: 'technical_architecture',
        question_type: 'hardware',
        priority: 1
      },
      {
        question: 'Do you need support for automation equipment (AS/RS, sorters, conveyors)?',
        category: 'technical_architecture',
        question_type: 'automation',
        priority: 3
      }
    ];

    // Add industry-specific technical questions
    const industrySpecificQuestions = this.getIndustrySpecificTechnicalQuestions(industry);
    questions.push(...technicalQuestions, ...industrySpecificQuestions);

    return questions;
  }

  getIndustrySpecificTechnicalQuestions(industry) {
    const industryQuestions = {
      'Healthcare': [
        {
          question: 'Do you require FDA 21 CFR Part 11 compliance for electronic records?',
          category: 'technical_architecture',
          question_type: 'compliance',
          priority: 1
        },
        {
          question: 'What serialization and track-and-trace requirements do you have?',
          category: 'technical_architecture', 
          question_type: 'compliance',
          priority: 1
        }
      ],
      'Food & Beverage': [
        {
          question: 'Do you require FSMA compliance and food safety features?',
          category: 'technical_architecture',
          question_type: 'compliance',
          priority: 1
        },
        {
          question: 'What temperature monitoring and cold chain requirements do you have?',
          category: 'technical_architecture',
          question_type: 'environmental',
          priority: 1
        }
      ],
      'Manufacturing': [
        {
          question: 'Do you need integration with MES (Manufacturing Execution Systems)?',
          category: 'technical_architecture',
          question_type: 'integration',
          priority: 1
        },
        {
          question: 'What quality management and inspection requirements do you have?',
          category: 'technical_architecture',
          question_type: 'quality',
          priority: 2
        }
      ]
    };

    return industryQuestions[industry] || [];
  }

  async generateBusinessRequirementQuestions(clientInfo, researchData) {
    const questions = [
      {
        question: 'What are your primary business drivers for implementing a new WMS?',
        category: 'business_requirements',
        question_type: 'strategic',
        priority: 1
      },
      {
        question: 'What are your key performance indicators (KPIs) for warehouse operations?',
        category: 'business_requirements',
        question_type: 'metrics',
        priority: 1
      },
      {
        question: 'What is your expected timeline for WMS implementation?',
        category: 'business_requirements',
        question_type: 'timeline',
        priority: 1
      },
      {
        question: 'What is your budget range for the WMS project?',
        category: 'business_requirements',
        question_type: 'budget',
        priority: 1
      },
      {
        question: 'How many users will access the WMS system?',
        category: 'business_requirements',
        question_type: 'users',
        priority: 2
      },
      {
        question: 'What are your reporting and analytics requirements?',
        category: 'business_requirements',
        question_type: 'reporting',
        priority: 2
      },
      {
        question: 'Do you have any specific vendor preferences or restrictions?',
        category: 'business_requirements',
        question_type: 'vendor',
        priority: 2
      },
      {
        question: 'What training and change management support will you need?',
        category: 'business_requirements',
        question_type: 'training',
        priority: 3
      }
    ];

    return questions;
  }

  async generateIntegrationQuestions(clientInfo) {
    const questions = [
      {
        question: 'What ERP system are you currently using?',
        category: 'integration',
        question_type: 'erp',
        priority: 1
      },
      {
        question: 'What other systems need to integrate with the WMS?',
        category: 'integration',
        question_type: 'systems',
        priority: 1
      },
      {
        question: 'What data synchronization requirements do you have?',
        category: 'integration',
        question_type: 'data',
        priority: 1
      },
      {
        question: 'Do you require real-time or batch integration?',
        category: 'integration',
        question_type: 'timing',
        priority: 2
      },
      {
        question: 'What EDI transactions do you need to support?',
        category: 'integration',
        question_type: 'edi',
        priority: 2
      },
      {
        question: 'Do you need API access for custom applications?',
        category: 'integration',
        question_type: 'api',
        priority: 2
      },
      {
        question: 'What master data management approach will you use?',
        category: 'integration',
        question_type: 'master_data',
        priority: 3
      }
    ];

    return questions;
  }

  async generateClientSpecificQuestions(clientInfo, researchData) {
    const questions = [];
    const { name, industry, company_size } = clientInfo;

    // Generate questions based on market research
    if (researchData && researchData.length > 0) {
      for (const research of researchData) {
        const content = typeof research.content === 'string' 
          ? JSON.parse(research.content) 
          : research.content;

        switch (research.research_type) {
          case 'industry_analysis':
            questions.push(...this.generateIndustryBasedQuestions(content, industry));
            break;
          case 'competitor_analysis':
            questions.push(...this.generateCompetitorBasedQuestions(content));
            break;
          case 'supply_chain_challenges':
            questions.push(...this.generateChallengeBasedQuestions(content));
            break;
          case 'technology_stack':
            questions.push(...this.generateTechnologyBasedQuestions(content));
            break;
        }
      }
    }

    // Add company size specific questions
    questions.push(...this.generateCompanySizeQuestions(company_size));

    return questions;
  }

  generateIndustryBasedQuestions(industryData, industry) {
    const questions = [];
    
    if (industryData.industry_overview) {
      const overview = industryData.industry_overview;
      
      if (overview.trends) {
        overview.trends.forEach((trend, index) => {
          questions.push({
            question: `How is your company addressing the industry trend of ${trend.toLowerCase()}?`,
            category: 'client_specific',
            question_type: 'industry_trend',
            priority: 2 + index
          });
        });
      }

      if (overview.wms_priorities) {
        overview.wms_priorities.forEach((priority, index) => {
          questions.push({
            question: `How important is ${priority.toLowerCase()} for your WMS implementation?`,
            category: 'client_specific',
            question_type: 'industry_priority',
            priority: 1 + index
          });
        });
      }
    }

    return questions;
  }

  generateCompetitorBasedQuestions(competitorData) {
    const questions = [];

    if (competitorData.wms_landscape) {
      questions.push({
        question: 'Have you evaluated any WMS vendors, and what were your findings?',
        category: 'client_specific',
        question_type: 'competitive',
        priority: 2
      });
    }

    questions.push({
      question: 'What differentiates your company from competitors in terms of warehouse operations?',
      category: 'client_specific', 
      question_type: 'competitive_advantage',
      priority: 2
    });

    return questions;
  }

  generateChallengeBasedQuestions(challengeData) {
    const questions = [];

    if (challengeData.primary_challenges) {
      challengeData.primary_challenges.forEach((challenge, index) => {
        questions.push({
          question: `How does ${challenge.toLowerCase()} impact your current warehouse operations?`,
          category: 'client_specific',
          question_type: 'challenge',
          priority: 1 + index
        });
      });
    }

    return questions;
  }

  generateTechnologyBasedQuestions(techData) {
    const questions = [];

    if (techData.common_systems) {
      questions.push({
        question: 'Which of these systems are you currently using that need WMS integration?',
        category: 'client_specific',
        question_type: 'technology',
        priority: 1
      });
    }

    return questions;
  }

  generateCompanySizeQuestions(companySize) {
    const questions = [];
    
    const sizeQuestions = {
      'Small': [
        'What is your growth trajectory and scaling requirements?',
        'Do you need a solution that can grow with your business?',
        'What is your preference for cloud vs on-premise deployment?'
      ],
      'Medium': [
        'How many warehouses or distribution centers do you operate?',
        'Do you need multi-site inventory visibility?',
        'What are your integration complexity requirements?'
      ],
      'Large': [
        'How many facilities will be included in the WMS implementation?',
        'Do you need global deployment capabilities?',
        'What are your requirements for enterprise-level features?'
      ]
    };

    const relevantQuestions = sizeQuestions[companySize] || sizeQuestions['Medium'];
    relevantQuestions.forEach((question, index) => {
      questions.push({
        question,
        category: 'client_specific',
        question_type: 'company_size',
        priority: 2 + index
      });
    });

    return questions;
  }

  calculatePriority(category, industry, index) {
    // Base priority on category importance and industry relevance
    const categoryPriority = {
      'Inbound Operations': 1,
      'Outbound Operations': 1, 
      'Inventory Control': 2,
      'Reporting': 3
    };

    return (categoryPriority[category] || 2) + Math.floor(index / 2);
  }

  async getProjectQuestions(projectId) {
    try {
      const questions = await db.all(`
        SELECT * FROM questions 
        WHERE project_id = ? 
        ORDER BY priority, category, created_at
      `, [projectId]);

      return questions;
    } catch (error) {
      console.error('Error retrieving project questions:', error);
      throw error;
    }
  }

  async updateQuestionAnswer(questionId, answer, notes) {
    try {
      await db.run(`
        UPDATE questions 
        SET answer = ?, notes = ?, is_answered = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [answer, notes, questionId]);

      return true;
    } catch (error) {
      console.error('Error updating question answer:', error);
      throw error;
    }
  }
}

module.exports = new QuestionGeneratorService();