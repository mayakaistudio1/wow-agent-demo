// api/token.js
module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      return res.end("Method Not Allowed");
    }

    // --- read + parse JSON body (Vercel Functions НЕ гарантируют req.body как объект)
    let raw = "";
    for await (const chunk of req) raw += chunk;
    let body = {};
    if (raw) {
      try { body = JSON.parse(raw); } catch { body = {}; }
    }

    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      return res.end("Missing env LIVEAVATAR_API_KEY in Vercel");
    }

    const r = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      }
      // body тут не обязателен, но если хочешь — можно передать role/name:
      // body: JSON.stringify({ role: body.role, name: body.name })
    });

    const text = await r.text();

    // Если LiveAvatar вернул ошибку — отдадим её наружу как есть (чтобы ты видел реальную причину)
    if (!r.ok) {
      res.statusCode = r.status;
      res.setHeader("content-type", "application/json; charset=utf-8");
      return res.end(JSON.stringify({ error: true, status: r.status, liveavatar: text }));
    }

    // LiveAvatar обычно отдаёт JSON
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    const token =
      json?.data?.session_token ||
      json?.session_token ||
      json?.token;

    if (!token) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json; charset=utf-8");
      return res.end(JSON.stringify({ error: true, message: "Token not found in response", response: json }));
    }

    res.statusCode = 200;
    res.setHeader("content-type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ token }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ error: true, message: e?.message || String(e) }));
  }
};
