const axios = require('axios');

class AIResearchService {
  constructor() {
    // You can use OpenAI, Claude, or any other LLM API
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.serpApiKey = process.env.SERP_API_KEY; // For web search
  }

  async conductCompanyResearch(companyName) {
    try {
      // 1. Get basic company info from web search
      const searchResults = await this.searchCompanyInfo(companyName);
      
      // 2. Use LLM to analyze and structure the research
      const research = await this.analyzeWithLLM(companyName, searchResults, 'company_overview');
      
      return {
        company_name: companyName,
        research_type: 'Company Overview',
        results: research,
        sources: searchResults.sources,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Company research error:', error);
      return this.getFallbackCompanyResearch(companyName);
    }
  }

  async conductSupplyChainResearch(companyName) {
    try {
      const searchResults = await this.searchSupplyChainInfo(companyName);
      const research = await this.analyzeWithLLM(companyName, searchResults, 'supply_chain');
      
      return {
        company_name: companyName,
        research_type: 'Supply Chain Analysis',
        results: research,
        sources: searchResults.sources,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Supply chain research error:', error);
      return this.getFallbackSupplyChainResearch(companyName);
    }
  }

  async conductCompetitorResearch(companyName, industry) {
    try {
      const searchResults = await this.searchCompetitorInfo(companyName, industry);
      const research = await this.analyzeWithLLM(companyName, searchResults, 'competitor_analysis');
      
      return {
        company_name: companyName,
        research_type: 'Competitor Analysis',
        results: research,
        sources: searchResults.sources,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Competitor research error:', error);
      return this.getFallbackCompetitorResearch(companyName, industry);
    }
  }

  async searchCompanyInfo(companyName) {
    if (this.serpApiKey) {
      // Use SerpAPI for real web search
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: `${companyName} company revenue warehouse supply chain technology`,
          api_key: this.serpApiKey,
          engine: 'google'
        }
      });
      
      return {
        results: response.data.organic_results?.slice(0, 5) || [],
        sources: response.data.organic_results?.map(r => r.link) || []
      };
    } else {
      // Fallback to mock data for demo
      return this.getMockSearchResults(companyName, 'company');
    }
  }

  async searchSupplyChainInfo(companyName) {
    const query = `${companyName} warehouse management system WMS transportation logistics supply chain technology ERP`;
    
    if (this.serpApiKey) {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: this.serpApiKey,
          engine: 'google'
        }
      });
      
      return {
        results: response.data.organic_results?.slice(0, 5) || [],
        sources: response.data.organic_results?.map(r => r.link) || []
      };
    } else {
      return this.getMockSearchResults(companyName, 'supply_chain');
    }
  }

  async searchCompetitorInfo(companyName, industry) {
    const query = `${companyName} competitors ${industry} supply chain warehouse logistics`;
    
    if (this.serpApiKey) {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: this.serpApiKey,
          engine: 'google'
        }
      });
      
      return {
        results: response.data.organic_results?.slice(0, 5) || [],
        sources: response.data.organic_results?.map(r => r.link) || []
      };
    } else {
      return this.getMockSearchResults(companyName, 'competitors');
    }
  }

  async analyzeWithLLM(companyName, searchData, researchType) {
    if (!this.openaiApiKey) {
      return this.getMockLLMAnalysis(companyName, researchType);
    }

    const prompts = {
      company_overview: `Analyze the following search results about ${companyName} and provide a comprehensive company overview focusing on:
      - Annual revenue and financial performance
      - Business model and key operations
      - Market position and size
      - Key facilities and locations
      - Recent news and developments
      
      Search Results: ${JSON.stringify(searchData.results)}
      
      Provide a structured analysis in the following format:
      **Financial Overview:**
      **Business Operations:**
      **Market Position:**
      **Key Facilities:**
      **Recent Developments:**`,

      supply_chain: `Analyze ${companyName}'s supply chain infrastructure based on the search results:
      - Warehouse and distribution centers
      - Transportation and logistics
      - Supply chain technology (WMS, ERP, TMS)
      - Inventory management approach
      - Key suppliers and partners
      
      Search Results: ${JSON.stringify(searchData.results)}
      
      Format:
      **Warehouse Infrastructure:**
      **Transportation & Logistics:**
      **Technology Stack:**
      **Inventory Management:**
      **Key Partners:**`,

      competitor_analysis: `Analyze ${companyName}'s competitive landscape:
      - Main competitors in supply chain/logistics
      - Competitive advantages and disadvantages
      - Market share comparison
      - Technology adoption vs competitors
      - Strategic positioning
      
      Search Results: ${JSON.stringify(searchData.results)}
      
      Format:
      **Main Competitors:**
      **Competitive Advantages:**
      **Market Position:**
      **Technology Comparison:**
      **Strategic Insights:**`
    };

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a supply chain and logistics research analyst. Provide detailed, factual analysis based on the provided search results.'
          },
          {
            role: 'user',
            content: prompts[researchType]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('LLM API error:', error);
      return this.getMockLLMAnalysis(companyName, researchType);
    }
  }

  getMockSearchResults(companyName, type) {
    return {
      results: [
        { title: `${companyName} - Company Overview`, snippet: `${companyName} business information...` },
        { title: `${companyName} Supply Chain`, snippet: `Supply chain operations...` }
      ],
      sources: [`https://example.com/${companyName.toLowerCase()}`]
    };
  }

  getMockLLMAnalysis(companyName, researchType) {
    const analyses = {
      company_overview: `**Financial Overview:**
${companyName} is a major player in their industry with estimated annual revenue in the billions. The company has shown consistent growth over the past 5 years.

**Business Operations:**
Primary operations include retail/e-commerce with extensive warehouse and distribution networks. The company operates multiple fulfillment centers across key markets.

**Market Position:**
${companyName} holds a significant market share in their sector and is considered a leader in supply chain innovation.

**Key Facilities:**
Multiple distribution centers, regional warehouses, and fulfillment centers strategically located near major population centers.

**Recent Developments:**
Recent investments in automation technology, expansion of warehouse capacity, and adoption of advanced WMS systems.`,

      supply_chain: `**Warehouse Infrastructure:**
${companyName} operates a network of modern distribution centers with advanced automation. Facilities range from 500K to 1M+ sq ft with high-bay storage systems.

**Transportation & Logistics:**
Multi-modal transportation including truck, rail, and air freight. Partnership with major carriers and some in-house delivery capabilities.

**Technology Stack:**
- WMS: Advanced warehouse management system with real-time inventory tracking
- ERP: Enterprise-wide system integration
- TMS: Transportation management for route optimization
- Automation: Conveyor systems, sortation, and potentially robotics

**Inventory Management:**
Just-in-time inventory strategies with demand forecasting and automated replenishment systems.

**Key Partners:**
Relationships with major logistics providers, technology vendors, and supplier networks.`,

      competitor_analysis: `**Main Competitors:**
Key competitors include other major retailers/distributors in the same market segment with similar supply chain complexity.

**Competitive Advantages:**
- Scale and network coverage
- Technology adoption
- Automation investments
- Customer service capabilities

**Market Position:**
Strong position with significant market share, though facing pressure from emerging competitors and changing customer expectations.

**Technology Comparison:**
Generally ahead of smaller competitors in automation and WMS sophistication, competitive with other major players.

**Strategic Insights:**
Focus areas should include continued automation, last-mile delivery optimization, and sustainable supply chain practices.`
    };

    return analyses[researchType] || `Research analysis for ${companyName} - ${researchType}`;
  }

  getFallbackCompanyResearch(companyName) {
    return {
      company_name: companyName,
      research_type: 'Company Overview',
      results: this.getMockLLMAnalysis(companyName, 'company_overview'),
      sources: [`https://example.com/${companyName.toLowerCase()}`],
      timestamp: new Date()
    };
  }

  getFallbackSupplyChainResearch(companyName) {
    return {
      company_name: companyName,
      research_type: 'Supply Chain Analysis',
      results: this.getMockLLMAnalysis(companyName, 'supply_chain'),
      sources: [`https://example.com/${companyName.toLowerCase()}`],
      timestamp: new Date()
    };
  }

  getFallbackCompetitorResearch(companyName, industry) {
    return {
      company_name: companyName,
      research_type: 'Competitor Analysis',
      results: this.getMockLLMAnalysis(companyName, 'competitor_analysis'),
      sources: [`https://example.com/${companyName.toLowerCase()}`],
      timestamp: new Date()
    };
  }
}

module.exports = new AIResearchService();
