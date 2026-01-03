export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ENV LIVEAVATAR_API_KEY is missing" });
    }

    const body = req.body || {};
    const role = body.role || "unknown";
    const name = body.name || "friend";

    // Если LiveAvatar требует avatar/agent id — добавь ENV и раскомментируй.
    // const avatarId = process.env.LIVEAVATAR_AVATAR_ID;

    const payload = {
      mode: "FULL",
      // ...(avatarId ? { avatar_id: avatarId } : {}),
      metadata: { role, name, source: "wow-agent-demo" },
    };

    const url = "https://api.liveavatar.com/v1/sessions";

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { raw }; }

    if (!upstream.ok) {
      console.error("LiveAvatar API error:", upstream.status, data);
      return res.status(upstream.status).json({
        error: "LiveAvatar API error",
        status: upstream.status,
        data,
      });
    }

    const token =
      data.token ||
      data.session_token ||
      data?.data?.token ||
      null;

    const session_id =
      data.session_id ||
      data.id ||
      data?.data?.session_id ||
      null;

    return res.status(200).json({ token, session_id, data });
  } catch (e) {
    console.error("token.js crash:", e);
    return res.status(500).json({ error: "token.js crash", message: String(e?.message || e) });
  }
}
