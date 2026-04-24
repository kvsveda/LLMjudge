const bcrypt = require('bcryptjs');
const { connectDb, User } = require('./database');

const UserStore = {
  findByEmail: async (email) => {
    await connectDb();
    return User.findOne({ email: email.toLowerCase() });
  },

  findById: async (id) => {
    await connectDb();
    return User.findOne({ id });
  },

  create: async ({ name, email, password }) => {
    await connectDb();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const createdAt = new Date().toISOString();

    const user = await User.create({
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt,
    });

    return user;
  },

  comparePassword: async (plain, hashed) => bcrypt.compare(plain, hashed),

  sanitize: (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }),
};

module.exports = UserStore;
