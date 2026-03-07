const generativeService = require('../services/generative');

const generateMarkets = async (req, res) => {
  const count = parseInt(req.body?.count || req.query?.count || '1', 10) || 1;
  try {
    const created = await generativeService.generateAndCreateMarkets(count);
    res.status(201).json({ created_count: created.length, created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate markets' });
  }
};

module.exports = {
  generateMarkets,
};
