class User {
  constructor({
    id,
    public_id: legacyPublicId,
    publicId,
    name,
    email,
    role,
    created_at: legacyCreatedAt,
    createdAt,
    updated_at: legacyUpdatedAt,
    updatedAt,
  }) {
    this.id = id;
    this.publicId = publicId || legacyPublicId;
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt || legacyCreatedAt;
    this.updatedAt = updatedAt || legacyUpdatedAt;
  }

  toJSON() {
    return {
      public_id: this.publicId,
      name: this.name,
      email: this.email,
      role: this.role,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  static fromDb(row) {
    return new User(row);
  }
}

module.exports = User;
