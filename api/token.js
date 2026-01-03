export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const r = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.LIVEAVATAR_API_KEY },
    });

    const json = await r.json();
    const token = json?.data?.session_token;

    if (!token) {
      res.status(500).json({ error: 'No token in response', raw: json });
      return;
    }

    res.status(200).json({ token });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
