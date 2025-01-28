import createHttpError from 'http-errors';



const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Internal Server Error',
    data: null,
  });
};

export { errorHandler };