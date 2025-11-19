const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validatePublicId = (req, res, next) => {
  const { publicId } = req.params;
  if (!publicId || !uuidV4Regex.test(publicId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid publicId format',
    });
  }
  return next();
};

module.exports = { validatePublicId };
