const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});

// Hash the password before saving the user
/*userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});*/
/*
// Compare the password with the hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};*/

const User = mongoose.model('User', userSchema);

// Create an admin user
const createAdminUser = async () => {
  try {
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('Aa_12345678', 10);
      //const salt = await bcrypt.genSalt(10);
      //const hash = await bcrypt.hash('Admin_123', salt);
      const user = new User({ name: 'admin', email: 'admin@example.com', password: hashedPassword, isAdmin: true });
      await user.save();
    }
  } catch (error) {
    console.log(error);
  }
};


module.exports = User;
