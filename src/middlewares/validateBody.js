import createHttpError from "http-errors";

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return next(createHttpError(400, `Validation error: ${errorMessages}`));
    }

    next();
  };
};

export default validateBody;