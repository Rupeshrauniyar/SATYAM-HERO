const axios = require('axios');

exports.translate = async (req, res) => {
  const { text, target = 'ne' } = req.body || {};
  if (!text) return res.status(400).json({ success: false, message: 'text required' });

  try {
    const provider = process.env.TRANSLATE_PROVIDER || 'libre';

    if (provider === 'libre') {
      const endpoint = process.env.LIBRE_TRANSLATE_URL || 'https://libretranslate.de/translate';
      const resp = await axios.post(
        endpoint,
        { q: text, source: 'en', target, format: 'text' },
        { headers: { 'accept': 'application/json', 'Content-Type': 'application/json' } },
      );
      const translated = resp.data?.translatedText || resp.data?.translated || null;
      return res.json({ success: true, translated });
    }

    // provider not supported
    return res.status(400).json({ success: false, message: 'translation provider not supported' });
  } catch (err) {
    console.error('translate error', err?.response?.data || err.message || err);
    return res.status(500).json({ success: false, message: 'translation_failed' });
  }
};
