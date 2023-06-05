const { Movie, Genre, User, Director } = require('../models/movie');
// genre and director models are imported in the movie model


// Check if a user already exists based on email
const checkExistingUser = async (email) => {
    try {
      const existingUser = await User.findOne({ email });
      return existingUser;
    } catch (error) {
      throw error;
    }
  };

  // Create a new user
  const createUser = async (name, email, password) => {
    try {
      const newUser = new User({ name, email, password });
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      throw error;
    }
  };

  // Update user profile
const updateUserProfile = async (userId, updatedData) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Other user-related functions...

  module.exports = {
    checkExistingUser,
    createUser,
    updateUserProfile,
    // Export other user-related functions...
  };