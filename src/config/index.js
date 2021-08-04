require('dotenv').config();

/** Default config will remain same in all environments and can be over-ridded */
const config = {
  allowedMedia: ['jpg', 'jpeg', 'png', 'gif', 'avi', 'mov', '3gp', 'mp4', 'mkv', 'mpeg', 'mpg', 'mp3', 'pdf'],
  baseUrl: 'http://localhost:3001',
  ddosConfig: {
    burst: 100,
    limit: 100,
  },
  env: process.env.NODE_ENV,
  fcm: { 'server-key': '' },
  // JWT expiry time in minutes
  jwtExpirationInterval: 60 * 12,
  jwtSecret: 'qweqweuiquhjkdncjnzxncb12ne23h194y12u84134234h2j34h3',
  mediaTypes: ['photo', 'video', 'document'],
  mongo: {
    uri: 'mongodb+srv://subham:3ADvMYv6pCRf1yhh@cluster0.ruy3u.mongodb.net/inflowDB?retryWrites=true&w=majority',
    // uri: 'mongodb+srv://subham:rs9SXvnXj3unL3wd@cluster0.qi8py.mongodb.net/inflowDB?retryWrites=true&w=majority',
  },
  port: 3001,
  website: 'http://localhost:3000',
  whitelist: null,
};

module.exports = config;
