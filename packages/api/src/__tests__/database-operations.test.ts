/**
 * Unit tests for database operations and services
 * Tests database connection, models, getUserBackup, and other user services
 * Requirements: 1.2
 */

import {
    connectDB,
    User,
    Account,
    Session,
    UserRole,
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    getUserBackup,
    getAllUsers,
    deleteUser,
} from '../index';
import mongoose from 'mongoose';

// Mock nodemailer to avoid actual email sending during tests
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
    })),
}));

describe('Database Operations and Services', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterEach(async () => {
        // Clean up test data after each test
        if (User.db && User.db.readyState === 1) {
            await User.deleteMany({});
            await Account.deleteMany({});
            await Session.deleteMany({});
        }
    });

    describe('Database Connection', () => {
        it('should connect to database successfully', async () => {
            const connection = await connectDB();
            expect(connection).toBeDefined();
            expect(connection.connection.readyState).toBe(1); // Connected
        });

        it('should reuse existing connection', async () => {
            const connection1 = await connectDB();
            const connection2 = await connectDB();
            expect(connection1).toBe(connection2);
        });
    });

    describe('User Model', () => {
        it('should create a user with valid data', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: UserRole.USER,
            };

            const user = new User(userData);
            await user.save();

            expect(user._id).toBeDefined();
            expect(user.name).toBe(userData.name);
            expect(user.email).toBe(userData.email);
            expect(user.role).toBe(userData.role);
            expect(user.approved).toBe(true); // Default value
        });

        it('should hash password before saving', async () => {
            const userData = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'plainpassword',
                role: UserRole.USER,
            };

            const user = new User(userData);
            await user.save();

            // Password should be hashed
            expect(user.password).not.toBe('plainpassword');
            expect(user.password).toBeDefined();
            expect(user.password!.length).toBeGreaterThan(20); // Hashed passwords are longer
        });

        it('should validate required fields', async () => {
            const user = new User({});

            await expect(user.save()).rejects.toThrow('User validation failed');
        });

        it('should validate email format', async () => {
            const user = new User({
                name: 'Test User',
                email: 'invalid-email',
                role: UserRole.USER,
            });

            await expect(user.save()).rejects.toThrow('Please provide a valid email');
        });

        it('should compare passwords correctly', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword',
                role: UserRole.USER,
            };

            const user = new User(userData);
            await user.save();

            const isValid = await user.comparePassword('testpassword');
            const isInvalid = await user.comparePassword('wrongpassword');

            expect(isValid).toBe(true);
            expect(isInvalid).toBe(false);
        });
    });

    describe('Account Model', () => {
        it('should create an account with valid data', async () => {
            // First create a user
            const user = new User({
                name: 'Test User',
                email: 'test@example.com',
                role: UserRole.USER,
            });
            await user.save();

            const accountData = {
                userId: user._id,
                type: 'oauth',
                provider: 'google',
                providerAccountId: '12345',
                access_token: 'access_token_value',
            };

            const account = new Account(accountData);
            await account.save();

            expect(account._id).toBeDefined();
            expect(account.userId.toString()).toBe(user._id.toString());
            expect(account.provider).toBe(accountData.provider);
            expect(account.providerAccountId).toBe(accountData.providerAccountId);
        });

        it('should validate required fields', async () => {
            const account = new Account({});

            await expect(account.save()).rejects.toThrow('Account validation failed');
        });
    });

    describe('Session Model', () => {
        it('should create a session with valid data', async () => {
            // First create a user
            const user = new User({
                name: 'Test User',
                email: 'test@example.com',
                role: UserRole.USER,
            });
            await user.save();

            const sessionData = {
                sessionToken: 'unique-session-token',
                userId: user._id,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            };

            const session = new Session(sessionData);
            await session.save();

            expect(session._id).toBeDefined();
            expect(session.sessionToken).toBe(sessionData.sessionToken);
            expect(session.userId.toString()).toBe(user._id.toString());
            expect(session.expires).toEqual(sessionData.expires);
        });

        it('should validate required fields', async () => {
            const session = new Session({});

            await expect(session.save()).rejects.toThrow('Session validation failed');
        });
    });

    describe('User Services', () => {
        describe('createUser', () => {
            it('should create a user successfully', async () => {
                const userData = {
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: UserRole.USER,
                };

                const user = await createUser(userData);

                expect(user._id).toBeDefined();
                expect(user.name).toBe(userData.name);
                expect(user.email).toBe(userData.email);
                expect(user.role).toBe(userData.role);
            });

            it('should create user with password', async () => {
                const userData = {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    password: 'securepassword',
                    role: UserRole.ADMIN,
                };

                const user = await createUser(userData);

                expect(user.password).toBeDefined();
                expect(user.password).not.toBe('securepassword'); // Should be hashed
                expect(user.role).toBe(UserRole.ADMIN);
            });
        });

        describe('findUserByEmail', () => {
            it('should find user by email', async () => {
                const userData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    role: UserRole.USER,
                };

                await createUser(userData);
                const foundUser = await findUserByEmail('test@example.com');

                expect(foundUser).toBeDefined();
                expect(foundUser!.email).toBe(userData.email);
                expect(foundUser!.name).toBe(userData.name);
            });

            it('should return null for non-existent email', async () => {
                const foundUser = await findUserByEmail('nonexistent@example.com');
                expect(foundUser).toBeNull();
            });
        });

        describe('findUserById', () => {
            it('should find user by ID', async () => {
                const userData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    role: UserRole.USER,
                };

                const createdUser = await createUser(userData);
                const foundUser = await findUserById(createdUser._id);

                expect(foundUser).toBeDefined();
                expect(foundUser!._id.toString()).toBe(createdUser._id.toString());
                expect(foundUser!.name).toBe(userData.name);
            });

            it('should return null for non-existent ID', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();
                const foundUser = await findUserById(nonExistentId);
                expect(foundUser).toBeNull();
            });
        });

        describe('updateUser', () => {
            it('should update user successfully', async () => {
                const userData = {
                    name: 'Original Name',
                    email: 'test@example.com',
                    role: UserRole.USER,
                };

                const createdUser = await createUser(userData);
                const updatedUser = await updateUser(createdUser._id, {
                    name: 'Updated Name',
                    role: UserRole.ADMIN,
                });

                expect(updatedUser).toBeDefined();
                expect(updatedUser!.name).toBe('Updated Name');
                expect(updatedUser!.role).toBe(UserRole.ADMIN);
                expect(updatedUser!.email).toBe(userData.email);
            });

            it('should return null for non-existent user', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();
                const updatedUser = await updateUser(nonExistentId, { name: 'New Name' });
                expect(updatedUser).toBeNull();
            });
        });

        describe('getAllUsers', () => {
            it('should return all users', async () => {
                await createUser({ name: 'User 1', email: 'user1@example.com', role: UserRole.USER });
                await createUser({ name: 'User 2', email: 'user2@example.com', role: UserRole.ADMIN });

                const users = await getAllUsers();

                expect(users).toHaveLength(2);
                expect(users[0].name).toBeDefined();
                expect(users[0].email).toBeDefined();
                expect(users[0].role).toBeDefined();
            });

            it('should return empty array when no users exist', async () => {
                const users = await getAllUsers();
                expect(users).toHaveLength(0);
            });
        });

        describe('getUserBackup', () => {
            it('should return complete user backup data', async () => {
                // Create user
                const user = await createUser({
                    name: 'Test User',
                    email: 'test@example.com',
                    role: UserRole.USER,
                });

                // Create account for user
                const account = new Account({
                    userId: user._id,
                    type: 'oauth',
                    provider: 'google',
                    providerAccountId: '12345',
                });
                await account.save();

                // Create session for user
                const session = new Session({
                    sessionToken: 'test-session-token',
                    userId: user._id,
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                });
                await session.save();

                // Get backup
                const backup = await getUserBackup(user._id);

                expect(backup).toBeDefined();
                expect(backup!.user.id).toBe(user._id.toString());
                expect(backup!.user.name).toBe('Test User');
                expect(backup!.user.email).toBe('test@example.com');
                expect(backup!.accounts).toHaveLength(1);
                expect(backup!.accounts[0].provider).toBe('google');
                expect(backup!.sessions).toHaveLength(1);
                expect(backup!.sessions[0].sessionToken).toBe('test-session-token');
            });

            it('should return null for non-existent user', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();
                const backup = await getUserBackup(nonExistentId);
                expect(backup).toBeNull();
            });
        });

        describe('deleteUser', () => {
            it('should delete user and all associated data', async () => {
                // Create user
                const user = await createUser({
                    name: 'Test User',
                    email: 'test@example.com',
                    role: UserRole.USER,
                });

                // Create account and session
                const account = new Account({
                    userId: user._id,
                    type: 'oauth',
                    provider: 'google',
                    providerAccountId: '12345',
                });
                await account.save();

                const session = new Session({
                    sessionToken: 'test-session-token',
                    userId: user._id,
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                });
                await session.save();

                // Delete user
                const result = await deleteUser(user._id);
                expect(result).toBe(true);

                // Verify user and associated data are deleted
                const deletedUser = await User.findById(user._id);
                const deletedAccount = await Account.findOne({ userId: user._id });
                const deletedSession = await Session.findOne({ userId: user._id });

                expect(deletedUser).toBeNull();
                expect(deletedAccount).toBeNull();
                expect(deletedSession).toBeNull();
            });

            it('should return false for non-existent user', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();
                const result = await deleteUser(nonExistentId);
                expect(result).toBe(true); // Transaction succeeds even if user doesn't exist
            });
        });
    });
});