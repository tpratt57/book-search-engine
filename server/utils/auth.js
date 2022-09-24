const jwt = require('jsonwebtoken');

//set token secret and expiration date

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  //function for authentification routes

  authMiddleware: function ({ req }) {
    //allows token to be sent via req.query or req.headers

    let token = req.query.token || req.headers.authorization || req.body.tokens;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    //Verify token and get user data from it

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });

    } catch {
      console.log('Invalid token')
      return res.status(400).json({ message: 'Invalid Token!' })
    }

    //send to next endpoint
    return req;
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },

};

