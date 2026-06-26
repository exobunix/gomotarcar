const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VAL_VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
