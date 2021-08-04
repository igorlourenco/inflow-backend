const httpStatus = require('http-status');
// const uuidv4 = require('uuid');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const User = require('./model');
const Artist = require('../artist/model');
const { keysToCamel } = require('../../../utils/snake');

exports.users = async (req, res, next) => {
  try {
    const {
      user,
      query: {
        companyId, userId,
      },
    } = req;

    let query = {};

    if (companyId) {
      query = { company_id: companyId };
    } else if (userId) {
      query = { _id: userId };
    } else {
      query = {
        _id: { $nin: user._id },
        role: { $ne: 'admin' },
      };
    }

    const options = {
      _id: 1,
      company_id: 1,
      email: 1,
      first_name: 1,
      is_verified: 1,
      last_name: 1,
      phone: 1,
      photo: 1,
      role: 1,
      status: 1,
    };

    let users = await User.find(query, options);

    if (users.length > 0 && userId) {
      const [singleUser] = users;

      users = keysToCamel(singleUser.toObject());
    } else {
      users = users.map((singleUser) => keysToCamel(singleUser.toObject()));
    }

    return res.status(httpStatus.OK).json(users);
  } catch (error) {
    return next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const {
      // eslint-disable-next-line camelcase
      firebase_user_id, phone, email,
    } = req.body;

    let usercreated = false;

    let user;

    let
      type;

    if (phone) {
      const existingUser = await User.findOne({ $or: [{ firebase_user_id }, { phone }] });

      if (existingUser) {
        return res.json({
          message: 'User is already exist with that "firebaseUserId" Or "phone"',
          status: false,
        });
      }

      user = await new User(req.body).save();

      usercreated = true;
      type = 'phone';
    } else if (email) {
      const existingUser = await User.findOne({ $or: [{ firebase_user_id }, { email }] });

      if (existingUser) {
        return res.json({
          message: 'User is already exist with that "firebaseUserId" Or "email"',
          status: false,
        });
      }

      user = await new User(req.body).save();

      usercreated = true;
      type = 'email';
    }
    if (usercreated) {
      if (type === 'email') {
        await User.findOneAndUpdate({ email }, { firebase_user_id });
      } else if (type === 'phone') {
        await User.findOneAndUpdate({ phone }, { firebase_user_id });
      }

      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        data: { user },
        message: 'User registered successfully',
        status: true,
      });
    }

    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: 'No phone or email to register user',
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    let { body: { phone } } = req;

    phone = phone.split(' ').join('');

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(httpStatus.CONFLICT).json({
        code: httpStatus.CONFLICT,
        message: 'User not found with given "phone"',
        status: false,
      });
    }

    const refreshToken = uuidv4() + user._id;
    const newToken = user.token(refreshToken);

    await User.updateOne({ _id: user._id }, { $set: { access_token: newToken } });
    user.access_token = newToken;

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      data: { user },
      message: 'User loggedIn successfully',
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getWallet = async (req, res, next) => {
  try {
    const { user } = req;

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      data: { walletId: user.wallet_id },
      message: 'Wallet details',
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.connectWallet = async (req, res, next) => {
  try {
    const {
      user,
      body: { walletId },
    } = req;

    await User.updateOne({ _id: user._id }, { $set: { wallet_id: walletId } });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Wallet connected successfully',
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.disconnectWallet = async (req, res, next) => {
  try {
    const { user } = req;

    await User.updateOne({ _id: user._id }, { $set: { wallet_id: null } });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Wallet disconnected successfully',
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebase_user_id: req.body.firebase_user_id });

    if (req.files.profile) {
      const profilepic = req.files.profile[0];
      const profilepicname = `${user._id}_profilepic.jpeg`;

      await sharp(profilepic.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${__dirname}/../../../images/${profilepicname}`);
      req.body.profile_image = profilepicname;
    }

    if (req.files.banner) {
      const bannerpic = req.files.banner[0];
      const bannerpicname = `${user._id}_bannerpic.jpeg`;

      await sharp(bannerpic.buffer)
        .resize(1266, 530)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${__dirname}/../../../images/${bannerpicname}`);
      req.body.banner_image = bannerpicname;
    }

    const updatedUser = await User.findOneAndUpdate({ firebase_user_id: req.body.firebase_user_id }, req.body, {
      new: true, runValidators: true,
    });

    await Artist.findOneAndUpdate({ email: updatedUser.email }, req.body);

    if (!updatedUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        code: httpStatus.NOT_FOUND,
        message: 'No document found with the given user id',
      });
    }

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'User updated Successfully',
      updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebase_user_id: req.body.firebase_user_id });

    if (!user) {
      return res.json({ message: 'No document found with the given user id' });
    }

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'User Found',
      user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findByIdAndUpdate(req.user._id, { status: 'deleted' }, { new: true });

      if (!user) {
        return res.json({
          code: httpStatus.NOT_FOUND,
          message: 'No document found with the given user id',
        });
      }

      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: 'User Status set to deleted',
        user,
      });
    }

    return res.status(httpStatus.UNAUTHORIZED).json({
      code: httpStatus.UNAUTHORIZED,
      message: 'User must be logged in',
    });
  } catch (error) {
    return next(error);
  }
};

exports.buytoken = async (req, res, next) => {
  try {
    const {
      // eslint-disable-next-line camelcase
      SocialTokenAddress, firebase_user_id,
    } = req.body;

    const user = await User.findOne({ firebase_user_id });

    user.tokensbought.push(SocialTokenAddress);

    await user.save();

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Token added to bought list successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.getTokensBought = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebase_user_id: req.body.firebase_user_id });

    const tokennames = await Promise.all(user.tokensbought.map(async (token) => {
      const artist = await Artist.findOne({ social_token_id: token });

      return artist.social_token_symbol;
    }));

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'User tokens bought',
      tokensBought: user.tokensbought,
      tokenNames: tokennames,
    });
  } catch (error) {
    return next(error);
  }
};
