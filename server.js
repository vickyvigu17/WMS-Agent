const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simple in-memory storage for demo
let clients = [];
let projects = [];
let questions = [];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic API endpoints
app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const client = { id: Date.now(), ...req.body, created_at: new Date() };
  clients.push(client);
  res.json(client);
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    summary: {
      total_clients: clients.length,
      total_projects: projects.length,
      total_questions: questions.length,
      answered_questions: 0,
      question_completion_rate: 0
    },
    recent_projects: [],
    industry_distribution: []
  });
});

// Serve React app (we'll add this later)
app.get('*', (req, res) => {
  res.send(`
    <h1>🚀 WMS Consultant Agent</h1>
    <p>Backend is running! API endpoints available at /api/*</p>
    <ul>
      <li><a href="/api/health">Health Check</a></li>
      <li><a href="/api/dashboard">Dashboard</a></li>
      <li><a href="/api/clients">Clients</a></li>
    </ul>
  `);
});
app.listen(PORT, () => {
  console.log(`WMS Consultant Agent server running on port ${PORT}`);
});
