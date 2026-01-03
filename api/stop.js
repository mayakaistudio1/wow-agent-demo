export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Когда подключим SDK/Start, сюда будет приходить session_id.
  const { session_id } = req.body || {};

  // Пока не знаем точный endpoint STOP из их docs,
  // поэтому возвращаем понятный ответ.
  // Как только ты пришлёшь ссылку/строчку из docs “stop session”,
  // я вставлю сюда правильный fetch.
  if (!session_id) {
    res.status(200).json({ ok: false, note: 'No session_id yet. Connect SDK/start to obtain it.' });
    return;
  }

  res.status(200).json({ ok: true, note: 'Stop endpoint not wired yet. Paste LiveAvatar stop endpoint from docs.' });
}
