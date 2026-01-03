module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.LIVEAVATAR_API_KEY; // как у тебя в Vercel
  if (!apiKey) {
    return res.status(500).json({ error: 'LIVEAVATAR_API_KEY is missing in Vercel env' });
  }

  try {
    const r = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const text = await r.text();

    // ЛОГ: чтобы в Vercel Logs было видно, что вернул LiveAvatar (без ключей)
    console.log('LiveAvatar /sessions/token status:', r.status);
    console.log('LiveAvatar /sessions/token body (first 500):', text.slice(0, 500));

    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!r.ok) {
      return res.status(r.status).json({
        error: 'LiveAvatar token request failed',
        status: r.status,
        response: json,
      });
    }

    const token = json?.data?.session_token;

    if (!token) {
      return res.status(500).json({
        error: 'No session_token in response',
        response: json,
      });
    }

    return res.status(200).json({ token });

  } catch (e) {
    console.log('Token handler crash:', String(e));
    return res.status(500).json({ error: String(e) });
  }
};
