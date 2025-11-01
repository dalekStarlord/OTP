import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const NGROK_OTP_URL = process.env.NGROK_OTP_URL || 'https://e6833c24d422.ngrok-free.app';

  try {
    // Forward the request to ngrok OTP endpoint
    const response = await fetch(`${NGROK_OTP_URL}/otp/gtfs/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Forward the status and response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Failed to connect to OTP server',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

