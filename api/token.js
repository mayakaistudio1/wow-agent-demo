export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing LIVEAVATAR_API_KEY in Vercel env" });

    // твои значения
    const AVATAR_ID = "9650a758-1085-4d49-8bf3-f347565ec229";
    const VOICE_ID  = "c23719ef-d070-42ee-9cd9-4b867c621671";
    const CONTEXT_ID= "0af664ad-8b66-4f6e-91ab-3b3245d4d72d";

    const { language = "ru" } = req.body || {};

    const payload = {
      mode: "FULL",
      avatar_id: AVATAR_ID,
      avatar_persona: {
        voice_id: VOICE_ID,
        context_id: CONTEXT_ID,
        language
      }
    };

    const r = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-API-KEY": apiKey
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text);

    const json = JSON.parse(text);

    // важно: возвращаем и в удобном виде, и raw
    return res.status(200).json({
      session_id: json?.data?.session_id,
      session_token: json?.data?.session_token,
      raw: json
    });
  } catch (e) {
    return res.status(500).json({ error: "Token handler failed", details: String(e?.message || e) });
  }
}
