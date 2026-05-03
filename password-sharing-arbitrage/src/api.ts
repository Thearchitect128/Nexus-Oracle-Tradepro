import express from 'express';
import { readFileSync } from 'fs';
import { runArbitrageAnalysis, determineEnforcement } from './index.js';

const app = express();
app.use(express.json());

app.post('/analyze', (req, res) => {
  try {
    const { input, config } = req.body;
    const result = runArbitrageAnalysis(input, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/enforce', (req, res) => {
  try {
    const { accountId, riskScore, confidence, config } = req.body;
    const enforcement = determineEnforcement(riskScore, confidence, config);
    res.json({ accountId, enforcement });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});