const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcryptjs

// Define User schema
const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),  // Auto-generate user ID
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  firtname: {
    type: String,
    unique: true,
  },
  lastname: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  }
}, { timestamps: true });

// Hash the password before saving the user to the database
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);  // Create a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt);  // Hash the password
  }
  next();
});

// Method to compare hashed password during login
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);  // Compare the input password with the hashed one
};

// Create User model from schema
const User = mongoose.model('User', userSchema);

module.exports = User;
