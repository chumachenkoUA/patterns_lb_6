const prisma = require('../database/prismaClient');
const User = require('../models/user.model');

class UserRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async findAll(filters = {}) {
    const where = {};
    if (filters.role) {
      where.role = filters.role;
    }
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return users.map(User.fromDb);
  }

  async findByPublicId(publicId) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });
    return user ? User.fromDb(user) : null;
  }

  async findByInternalId(id) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? User.fromDb(user) : null;
  }

  async findByEmail(email) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? User.fromDb(user) : null;
  }

  async create({ name, email, role }) {
    const user = await this.prisma.user.create({
      data: { name, email, role },
    });
    return User.fromDb(user);
  }

  async update(publicId, { name, email, role }) {
    try {
      const user = await this.prisma.user.update({
        where: { publicId },
        data: { name, email, role },
      });
      return User.fromDb(user);
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async remove(publicId) {
    try {
      await this.prisma.user.delete({
        where: { publicId },
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}

module.exports = UserRepository;
