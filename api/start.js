export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { session_token } = req.body || {};
    if (!session_token) return res.status(400).json({ error: "Missing session_token" });

    const r = await fetch("https://api.liveavatar.com/v1/sessions/start", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "authorization": `Bearer ${session_token}`
      }
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text);

    return res.status(200).send(text);
  } catch (e) {
    return res.status(500).json({ error: "Start handler failed", details: String(e?.message || e) });
  }
}
