// Mock for @tu-org/api package
export const connectDB = jest.fn();

export const User = {
  findOne: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export const loginSchema = {
  parse: jest.fn(),
};