// Import user model 
const { User } = require('../models');
const { saveBook } = require('../schema/resolvers');
// Import sign token function from auth
const { signToken, signToken } = require('../utils/auth');

module.exports = {
  // Get a Single user by either their id or their username 
  async getSingleUser({ user = null, params }, res) {
    const foundUser = await User.findOne({
      $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
    });

    if (!foundUser) {
      return res.status(400).json({ message: 'Cannot find a user with this id!' })
    }

    res.json(foundUser);
  },

  //create a user, sign a token, and send it back to client/src/components/SignUpForm.js
  async createUser({ body }, res) {
    const user = await User.create(body);

    if (!user) {
      return res.status(400).json({ message: 'Something went wrong 🙃' })
    }
    const token = signToken(user);
    res.json({ token, user });
  },

  //log in a user, sign a token, and send it back to client/src/components/LoginForm.js
  //{body} is destructured req.body
  async login({ body }, res) {
    const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
    if (!user) {
      return res.status(400).json({ message: 'Error, cannot find this user!' });
    }

    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      return res.status(400).json({ message: 'Incorrect Password, Please Try Again!' });
    }

    const token = signToken(user);
    res.json({ token, user });
  },

  //save a book to user's "savedBooks" field by adding it to the set 
  //user comes from `req.user` created in the auth middleware function 

  async saveBook({ user, body }, res) {
    console.log(user);

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user.id },
        { $addToSet: { savedBooks: body } },
        { new: true, runValidators: true }
      );

      return res.json(updatedUser);
    }
    catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  },

  //remove a book from 'savedBooks'
  async deleteBook ({ user, params }, res) {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id},
      { $pull: { savedBooks: { bookId: params.bookId } } },
      { new: true }
    );

    if(!updatedUser) {
      return res.status(404).json({ message: 'Unable to identify user with associated id!' })
    }
    return res.json(updatedUser);
  }
}