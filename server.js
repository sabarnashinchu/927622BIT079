const express = require('express');
const axios = require('axios');
const cors = require('cors');

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDczNTY1LCJpYXQiOjE3NDgwNzMyNjUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjQzNmY4NTEwLThhNzQtNGVkMi04NDZiLTk2ZDRjODk2ZjJjOSIsInN1YiI6InNhYmFybmFzaGluY2h1QGdtYWlsLmNvbSJ9LCJlbWFpbCI6InNhYmFybmFzaGluY2h1QGdtYWlsLmNvbSIsIm5hbWUiOiJzYWJhcm5hIHQiLCJyb2xsTm8iOiI5Mjc2MjJiaXQwNzkiLCJhY2Nlc3NDb2RlIjoid2hlUVV5IiwiY2xpZW50SUQiOiI0MzZmODUxMC04YTc0LTRlZDItODQ2Yi05NmQ0Yzg5NmYyYzkiLCJjbGllbnRTZWNyZXQiOiJ1Y3dWTURGeFhSWWFZekRzIn0.mHVR5GCenkrCtLXemWEq8ZDvgc4cj8BT3qkGHIm_uus';

const app = express();
app.use(cors());
app.use(express.json());

// Proxy all requests to the real API
app.use('/api', async (req, res) => {
  try {
    const url = `${API_BASE_URL}${req.url}`;
    const method = req.method.toLowerCase();
    const headers = {
      Authorization: `Bearer ${API_TOKEN}`,
      ...req.headers,
    };
    // Remove host header to avoid conflicts
    delete headers.host;

    const axiosConfig = {
      method,
      url,
      headers,
      data: req.body,
      params: req.query,
      validateStatus: () => true,
    };
    const response = await axios(axiosConfig);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 