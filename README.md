# WMS Consultant Agent

A comprehensive web application designed for WMS (Warehouse Management System) implementation consultants to streamline client requirements analysis, conduct market research, and manage implementation projects.

## 🚀 Features

### 1. **Client Management**
- Complete client profile management with industry classification
- Contact information and business details tracking
- Project association and history

### 2. **Market Research Automation**
- Automated industry analysis and trend identification
- Competitor landscape analysis
- Supply chain challenges assessment
- Technology stack evaluation
- Recent news and business developments research

### 3. **Intelligent Question Generation**
- **WMS Process Questions**: Based on standard warehouse operations (receiving, put-away, picking, shipping, inventory management)
- **Technical Architecture Questions**: Deployment models, scalability, security, mobile requirements
- **Business Requirements**: KPIs, timeline, budget, reporting needs
- **Integration Questions**: ERP systems, EDI, APIs, data synchronization
- **Client-Specific Questions**: Generated from market research insights and industry trends

### 4. **Project Management**
- Project creation and tracking per client
- Question categorization and prioritization
- Progress tracking and completion rates
- Answer documentation with notes

### 5. **WMS Process Reference**
- Comprehensive guide to WMS processes
- Industry-specific considerations
- Technical implementation details
- Best practices and typical questions

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Database**: SQLite with comprehensive schema
- **Services**: 
  - Market Research Service (automated research gathering)
  - Question Generator Service (intelligent question creation)
- **APIs**: RESTful endpoints for all operations
- **Security**: Rate limiting, CORS, Helmet security headers

### Frontend (React/Ant Design)
- **Dashboard**: Analytics and project overview
- **Client Management**: CRUD operations with search and filtering
- **Project Details**: Question management and progress tracking
- **Market Research**: Visual presentation of research findings
- **WMS Reference**: Searchable process documentation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wms-consultant-agent
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your configuration
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:3000

## 🔧 Configuration

### Environment Variables

Create `server/.env` file with the following variables:

```env
PORT=5000
NODE_ENV=development

# Database
DB_PATH=./database.sqlite

# External APIs (optional for enhanced market research)
OPENAI_API_KEY=your_openai_api_key_here
SERPAPI_KEY=your_serpapi_key_here
NEWS_API_KEY=your_news_api_key_here
```

## 🎯 Usage Guide

### Getting Started

1. **Create Your First Client**
   - Navigate to "Clients" page
   - Click "Add Client" and fill in company details
   - Include industry and company size for better question generation

2. **Conduct Market Research**
   - Open client details
   - Click "Conduct Market Research" to gather industry insights
   - Review generated research across multiple categories

3. **Create a Project**
   - In client details, create a new WMS implementation project
   - Set timeline and project description

4. **Generate Questions**
   - Open project details
   - Click "Generate Questions" to create comprehensive questionnaire
   - Questions are automatically categorized and prioritized

5. **Conduct Client Meeting**
   - Use generated questions during client discussions
   - Record answers and notes for each question
   - Track progress with visual completion indicators

### Question Categories

- **WMS Processes**: Receiving, Put-away, Picking, Shipping, Inventory Management
- **Technical Architecture**: Deployment, Scalability, Security, Mobile, Hardware
- **Business Requirements**: Budget, Timeline, KPIs, Reporting
- **Integration**: ERP, Systems, Data, APIs
- **Client-Specific**: Industry trends, competitive analysis, company-specific needs

## 🔍 API Documentation

### Key Endpoints

```
GET /api/clients - List all clients
POST /api/clients - Create new client
GET /api/clients/:id - Get client details
POST /api/clients/:id/research - Conduct market research
GET /api/clients/:id/projects - Get client projects

POST /api/projects/:id/questions/generate - Generate questions
GET /api/projects/:id/questions - Get project questions
PUT /api/questions/:id - Update question answer

GET /api/dashboard - Dashboard analytics
GET /api/wms-processes - WMS process reference
```

## 🛠️ Development

### Project Structure
```
├── server/                 # Backend application
│   ├── services/          # Business logic services
│   ├── database.js        # Database configuration
│   └── server.js          # Express application
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── services/      # API service layer
└── package.json           # Root package configuration
```

### Adding New Features

1. **Backend**: Add routes in `server/server.js` and business logic in `server/services/`
2. **Frontend**: Create components in `client/src/components/` and pages in `client/src/pages/`
3. **Database**: Modify schema in `database.js` initialization

### Building for Production

```bash
cd client
npm run build

cd ../server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the WMS Processes reference within the application

## 🔮 Roadmap

- [ ] AI-powered question suggestions based on answers
- [ ] Export capabilities (PDF reports, Excel questionnaires)
- [ ] Integration with popular CRM systems
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Role-based access control
- [ ] Real-time collaboration features

---

**Built for WMS consultants, by WMS consultants.** Streamline your client engagement process and deliver better implementation outcomes.