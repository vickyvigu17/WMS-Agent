const axios = require('axios');

class AIQuestionGenerator {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.serpApiKey = process.env.SERP_API_KEY;
  }

  async generateWMSQuestions(clientInfo, projectInfo, questionCategories = []) {
    try {
      if (this.openaiApiKey) {
        // Step 1: Research the company first
        const companyData = await this.researchCompanyForQuestions(clientInfo.name, clientInfo.industry);
        
        // Step 2: Generate AI questions based on real company data
        return await this.generateQuestionsWithLLM(clientInfo, projectInfo, companyData);
      } else {
        console.log('No OpenAI API key - using fallback questions');
        return this.getFallbackQuestions(clientInfo);
      }
    } catch (error) {
      console.error('AI Question generation error:', error);
      return this.getFallbackQuestions(clientInfo);
    }
  }

  async researchCompanyForQuestions(companyName, industry) {
    try {
      console.log(`🔍 Researching ${companyName} for question generation...`);
      
      // Search for company-specific supply chain information
      const searchQueries = [
        `${companyName} warehouse management system WMS technology`,
        `${companyName} supply chain logistics operations`,
        `${companyName} distribution centers fulfillment centers`,
        `${companyName} ${industry} operations challenges`
      ];

      let allSearchResults = [];
      
      for (const query of searchQueries) {
        const results = await this.searchWeb(query);
        allSearchResults = allSearchResults.concat(results);
      }

      return {
        company_name: companyName,
        industry: industry,
        search_results: allSearchResults,
        total_results: allSearchResults.length
      };
    } catch (error) {
      console.error('Company research error:', error);
      return {
        company_name: companyName,
        industry: industry,
        search_results: [],
        total_results: 0
      };
    }
  }

  async searchWeb(query) {
    if (this.serpApiKey) {
      try {
        console.log(`🌐 Searching web: ${query}`);
        const response = await axios.get('https://serpapi.com/search', {
          params: {
            q: query,
            api_key: this.serpApiKey,
            engine: 'google',
            num: 5
          }
        });
        
        return response.data.organic_results?.map(result => ({
          title: result.title,
          snippet: result.snippet,
          link: result.link
        })) || [];
      } catch (error) {
        console.error('Web search error:', error);
        return [];
      }
    } else {
      console.log('No SERP API key - using mock search results');
      return [
        {
          title: `${query} - Sample Result`,
          snippet: `Sample search result for ${query}`,
          link: `https://example.com/search/${encodeURIComponent(query)}`
        }
      ];
    }
  }

  async generateQuestionsWithLLM(clientInfo, projectInfo, companyData) {
    const prompt = `You are a WMS implementation consultant. Based on the real company data below, generate 25-30 highly specific, intelligent questions for a WMS implementation project.

COMPANY INFORMATION:
- Company: ${clientInfo.name}
- Industry: ${clientInfo.industry}
- Size: ${clientInfo.company_size}
- Location: ${clientInfo.location}
- Project: ${projectInfo.name}

REAL COMPANY RESEARCH DATA:
${JSON.stringify(companyData.search_results, null, 2)}

INSTRUCTIONS:
1. Analyze the search results to understand their ACTUAL operations
2. Generate questions that are SPECIFIC to what you learned about this company
3. Don't ask generic questions - make them relevant to their real situation
4. Focus on areas where you found information gaps that need clarification
5. Include questions about technologies, processes, and challenges specific to this company

Generate questions in these categories:
- Current Operations (based on what you found about their actual setup)
- Technology Stack (based on any systems mentioned in search results)
- Industry-Specific Challenges (based on their actual industry context)
- Implementation Priorities (based on their company size and market position)
- Integration Requirements (based on their existing technology mentions)

FORMAT: Return a JSON array where each question is:
{
  "category": "category_name",
  "subcategory": "specific_area", 
  "question": "Very specific question based on research",
  "priority": "high/medium/low",
  "reasoning": "Why this question matters for THIS specific company based on research"
}

Make sure questions reference specific aspects found in the research data.`;

    try {
      console.log(`🤖 Generating AI questions for ${clientInfo.name}...`);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',  // Using GPT-4 for better analysis
        messages: [
          {
            role: 'system',
            content: 'You are an expert WMS consultant who analyzes company data and generates highly specific, relevant questions for WMS implementations. Always base questions on the actual research data provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.3  // Lower temperature for more focused questions
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const generatedText = response.data.choices[0].message.content;
      console.log(`✅ Generated AI questions for ${clientInfo.name}`);
      
      return this.parseAIQuestions(generatedText, clientInfo);
    } catch (error) {
      console.error('LLM question generation error:', error);
      return this.getFallbackQuestions(clientInfo);
    }
  }

  parseAIQuestions(generatedText, clientInfo) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions.map((q, index) => ({
          id: Date.now() + index,
          ...q,
          answered: false,
          ai_generated: true,  // Flag to show these are AI-generated
          created_at: new Date()
        }));
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse AI questions:', error);
      return this.getFallbackQuestions(clientInfo);
    }
  }

  getFallbackQuestions(clientInfo) {
    // Simplified fallback - just a few generic questions
    return [
      {
        id: Date.now(),
        category: "Current Operations",
        subcategory: "General",
        question: `What is ${clientInfo.name}'s current warehouse management approach?`,
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
        question: `What technology systems does ${clientInfo.name} currently use for supply chain management?`,
        priority: "high",
        reasoning: "Technology assessment is critical for integration planning",
        answered: false,
        ai_generated: false,
        created_at: new Date()
      }
    ];
  }
}

module.exports = new AIQuestionGenerator();
