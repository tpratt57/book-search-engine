const { User, Book } = require('../models');
const { AuthentificationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__V -password')
                return userData;
            }
            throw new AuthentificationError('Please log in!')
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        }
    },

    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AuthentificationError('Please use a valid email address!')
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
            throw new AuthentificationError('Invalid email or password!')
        }

        const token = signToken(user);
        return { token, user };
    },

    saveBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updateUser = await User.fineOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            )

            return updateUser;
        }
    }
};

module.exports = resolvers;