const { ALLOWED_ROLES } = require('../config/roles');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  }

  async getAllUsers(filters = {}) {
    const roleFilter =
      typeof filters.role === 'string'
        ? filters.role.trim().toUpperCase()
        : undefined;

    if (roleFilter && !ALLOWED_ROLES.includes(roleFilter)) {
      throw createHttpError(400, 'Invalid role filter');
    }

    const payload = {};
    if (roleFilter) {
      payload.role = roleFilter;
    }

    return this.userRepository.findAll(payload);
  }

  async getUserByPublicId(publicId) {
    const user = await this.userRepository.findByPublicId(publicId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    return user;
  }

  async getUserByInternalId(id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw createHttpError(400, 'Invalid numeric id provided');
    }
    const user = await this.userRepository.findByInternalId(numericId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    return user;
  }

  async getUserByEmail(email) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      throw createHttpError(400, 'Invalid email format');
    }
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    return user;
  }

  async createUser({ name, email, role = 'USER' }) {
    const userData = this.validateUserPayload({ name, email, role });
    await this.ensureEmailUnique(userData.email);
    try {
      return await this.userRepository.create(userData);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateUser(publicId, { name, email, role }) {
    await this.getUserByPublicId(publicId);
    const userData = this.validateUserPayload({ name, email, role });
    await this.ensureEmailUnique(userData.email, publicId);
    let updatedUser;
    try {
      updatedUser = await this.userRepository.update(publicId, userData);
    } catch (error) {
      this.handlePrismaError(error);
    }
    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }
    return updatedUser;
  }

  async deleteUser(publicId) {
    const deleted = await this.userRepository.remove(publicId);
    if (!deleted) {
      throw createHttpError(404, 'User not found');
    }
    return deleted;
  }

  validateUserPayload({ name, email, role }) {
    const sanitizedName = typeof name === 'string' ? name.trim() : '';
    const sanitizedEmail = this.normalizeEmail(email);
    const normalizedRole =
      typeof role === 'string' ? role.trim().toUpperCase() : '';

    if (!sanitizedName) {
      throw createHttpError(400, 'Name is required');
    }
    if (!sanitizedEmail) {
      throw createHttpError(400, 'Email is required');
    }
    if (!emailRegex.test(sanitizedEmail)) {
      throw createHttpError(400, 'Invalid email format');
    }
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      throw createHttpError(400, 'Invalid role provided');
    }
    return {
      name: sanitizedName,
      email: sanitizedEmail,
      role: normalizedRole,
    };
  }

  async ensureEmailUnique(email, ignorePublicId) {
    const normalizedEmail = this.normalizeEmail(email);
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser && existingUser.publicId !== ignorePublicId) {
      throw createHttpError(409, 'Email already exists');
    }
  }

  handlePrismaError(error) {
    if (error?.code === 'P2002') {
      throw createHttpError(409, 'Email already exists');
    }
    throw error;
  }
}

module.exports = UserService;
