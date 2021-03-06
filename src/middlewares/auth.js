const httpStatus = require('http-status');
const jwt = require('jwt-simple');
const User = require('../api/v1/user/model');
const { Error } = require('../utils/api-response');
const { jwtSecret } = require('../config');

const authorize = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    const apiError = new Error({
      message: 'Unauthorized',
      status: httpStatus.UNAUTHORIZED,
    });

    if (!authorization) {
      return next(apiError);
    }

    const token = authorization.split(' ')[1];

    try {
      const tokenResult = jwt.decode(token, jwtSecret);

      // if (!tokenResult || !tokenResult.exp || !tokenResult._id) {
      if (!tokenResult || !tokenResult._id) {
        apiError.message = 'Malformed Token';

        return next(apiError);
      }

      const user = await User.findOne({ _id: tokenResult._id }).lean();

      if (!user) {
        return next(apiError);
      }

      req.user = user;

      return next();
    } catch (e) {
      console.log(e);
      apiError.message = 'Token Expired';

      return next(apiError);
    }
  } catch (e) {
    return next(
      new Error({
        message: httpStatus[500],
        status: httpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

exports.authorize = () => (req, res, next) => authorize(req, res, next);
