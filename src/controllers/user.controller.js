class UserController {
  constructor(userService) {
    this.userService = userService;

    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.searchUser = this.searchUser.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await this.userService.getAllUsers(req.query);
      res.status(200).json({
        success: true,
        data: users.map((user) => user.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  async searchUser(req, res, next) {
    const { email, id } = req.query;

    if (!email && !id) {
      const error = new Error('Query parameter email or id is required');
      error.statusCode = 400;
      return next(error);
    }

    try {
      const user = email
        ? await this.userService.getUserByEmail(email)
        : await this.userService.getUserByInternalId(id);

      res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await this.userService.getUserByPublicId(
        req.params.publicId
      );
      res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await this.userService.updateUser(req.params.publicId, req.body);
      res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await this.userService.deleteUser(req.params.publicId);
      res.status(200).json({
        success: true,
        data: { message: 'User deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
