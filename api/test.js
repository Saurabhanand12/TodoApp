module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API folder is reachable',
    timestamp: new Date().toISOString()
  });
};
