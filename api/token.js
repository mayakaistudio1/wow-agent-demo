// /api/token.js  (CommonJS для Vercel)
module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const API_KEY = process.env.LIVEAVATAR_API_KEY;
    const AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID;
    const CONTEXT_ID = process.env.LIVEAVATAR_CONTEXT_ID;
    const VOICE_ID = process.env.LIVEAVATAR_VOICE_ID;

    if (!API_KEY) return res.status(500).json({ error: "Missing LIVEAVATAR_API_KEY" });
    if (!AVATAR_ID) return res.status(500).json({ error: "Missing LIVEAVATAR_AVATAR_ID" });
    if (!CONTEXT_ID) return res.status(500).json({ error: "Missing LIVEAVATAR_CONTEXT_ID" });
    if (!VOICE_ID) return res.status(500).json({ error: "Missing LIVEAVATAR_VOICE_ID" });

    // Vercel обычно уже парсит JSON body, но подстрахуемся
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const name = body.name || "friend";

    // FULL mode => avatar_persona обязателен (по доке)
    const payload = {
      mode: "FULL",
      avatar_persona: {
        avatar_id: AVATAR_ID,
        context_id: CONTEXT_ID,
        voice_id: VOICE_ID,
      },
      // опционально: можно хранить имя пользователя в metadata (если API это игнорит — не страшно)
      metadata: { name },
    };

    const r = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST", // <<< ЭТО КЛЮЧЕВО, иначе будет GET => 405
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({
        error: "LiveAvatar API error",
        status: r.status,
        data: safeJson(text),
      });
    }

    return res.status(200).json(safeJson(text));
  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      message: e?.message || String(e),
    });
  }
};

function safeJson(text) {
  try { return JSON.parse(text); } catch { return { raw: text }; }
}
