/**
 * Property-based test for API functionality preservation during extraction
 * **Feature: external-sdk-transformation, Property 1: Functional Preservation During Extraction**
 * **Validates: Requirements 1.2, 1.3, 1.5**
 */

import fc from 'fast-check';
import {
    connectDB,
    User,
    UserRole,
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    getUserBackup,
    hashPassword,
    comparePassword,
    generateToken,
    generatePasswordResetToken,
    validateEmail,
    validatePassword,
    validateName,
    emailSchema,
    passwordSchema,
    nameSchema,
} from '../index';

// Mock nodemailer to avoid actual email sending during tests
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
    })),
}));

describe('API Functionality Preservation Properties', () => {
    beforeAll(async () => {
        // Connect to test database
        await connectDB();
    });

    afterEach(async () => {
        // Clean up test data after each test
        if (User.db && User.db.readyState === 1) {
            await User.deleteMany({});
        }
    });

    it('should preserve user creation and retrieval functionality', async () => {
        // **Feature: external-sdk-transformation, Property 1: Functional Preservation During Extraction**
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    name: fc.string({ minLength: 2, maxLength: 50 }),
                    email: fc.emailAddress(),
                    role: fc.constantFrom(UserRole.USER, UserRole.ADMIN),
                }),
                async (userData) => {
                    // Create user using the extracted service
                    const createdUser = await createUser({
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                    });

                    // Verify user was created correctly
                    expect(createdUser).toBeDefined();
                    expect(createdUser.name).toBe(userData.name);
                    expect(createdUser.email).toBe(userData.email.toLowerCase());
                    expect(createdUser.role).toBe(userData.role);

                    // Verify user can be found by email
                    const foundByEmail = await findUserByEmail(userData.email);
                    expect(foundByEmail).toBeDefined();
                    expect(foundByEmail!.email).toBe(userData.email.toLowerCase());

                    // Verify user can be found by ID
                    const foundById = await findUserById(createdUser._id);
                    expect(foundById).toBeDefined();
                    expect(foundById!._id.toString()).toBe(createdUser._id.toString());

                    // Clean up
                    await User.findByIdAndDelete(createdUser._id);
                }
            ),
            { numRuns: 50 }
        );
    });

    it('should preserve password hashing and comparison functionality', async () => {
        // **Feature: external-sdk-transformation, Property 1: Functional Preservation During Extraction**
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 6, maxLength: 100 }),
                async (password) => {
                    // Hash password using extracted utility
                    const hashedPassword = await hashPassword(password);

                    // Verify hash is different from original password
                    expect(hashedPassword).not.toBe(password);
                    expect(hashedPassword.length).toBeGreaterThan(password.length);

                    // Verify password comparison works correctly
                    const isValid = await comparePassword(password, hashedPassword);
                    expect(isValid).toBe(true);

                    // Verify wrong password fails comparison
                    const isInvalid = await comparePassword(password + 'wrong', hashedPassword);
                    expect(isInvalid).toBe(false);
                }
            ),
            { numRuns: 50 }
        );
    });

    it('should preserve token generation functionality', async () => {
        // **Feature: external-sdk-transformation, Property 1: Functional Preservation During Extraction**
        await fc.assert(
            fc.property(
                fc.integer({ min: 8, max: 64 }),
                (tokenLength) => {
                    // Generate token using extracted utility
                    const token = generateToken(tokenLength);

                    // Verify token properties
                    expect(token).toBeDefined();
                    expect(typeof token).toBe('string');
                    expect(token.length).toBe(tokenLength * 2); // hex encoding doubles length
                    expect(/^[a-f0-9]+$/.test(token)).toBe(true); // hex characters only
                }
            ),
            { numRuns: 50 }
        );
    });

    it('should preserve password reset token generation functionality', async () => {
        // **Feature: external-sdk-transformation, Property 1: Functional Preservation During Extraction**
        await fc.assert(
            fc.property(
                fc.constant(null), // No input needed for this test
                () => {
                    const { token, expires } = generatePasswordResetToken();

                    // Verify token properties
                    expect(token).toBeDefined();
                    expect(typeof token).toBe('string');
                    expect(token.length).toBe(64); // 32 bytes * 2 for hex
                    expect(/^[a-f0-9]+$/.test(token)).toBe(true);

                    // Verify expiration is approximately 1 hour from now
                    const now = new Date();
                    const expectedExpiry = new Date(now.getTime() + 60 * 60 * 1000);
                    const timeDiff = Math.abs(expires.getTime() - expectedExpiry.getTime());
                    expect(timeDiff).toBeLessThan(1000); // Within 1 second
                }
            ),
            { numRuns: 50 }
        );
    });

    it('should preserve validation functionality', async () => {
        // **Feature: external-sdk-transformation, Property 1: Functional Preservation During Extraction**
        await fc.assert(
            fc.property(
                fc.record({
                    validEmail: fc.emailAddress(),
                    invalidEmail: fc.string().filter(s => !s.includes('@') || s.length < 3),
                    validName: fc.string({ minLength: 2, maxLength: 50 }),
                    invalidName: fc.oneof(
                        fc.string({ maxLength: 1 }),
                        fc.string({ minLength: 51 })
                    ),
                    validPassword: fc.string({ minLength: 6, maxLength: 100 }),
                    invalidPassword: fc.oneof(
                        fc.string({ maxLength: 5 }),
                        fc.string({ minLength: 101 })
                    ),
                }),
                (testData) => {
                    // Test email validation
                    expect(validateEmail(testData.validEmail)).toBe(true);
                    expect(validateEmail(testData.invalidEmail)).toBe(false);

                    // Test name validation
                    expect(validateName(testData.validName)).toBe(true);
                    expect(validateName(testData.invalidName)).toBe(false);

                    // Test password validation
                    expect(validatePassword(testData.validPassword)).toBe(true);
                    expect(validatePassword(testData.invalidPassword)).toBe(false);

                    // Test schema validation
                    expect(emailSchema.safeParse(testData.validEmail).success).toBe(true);
                    expect(emailSchema.safeParse(testData.invalidEmail).success).toBe(false);

                    expect(nameSchema.safeParse(testData.validName).success).toBe(true);
                    expect(nameSchema.safeParse(testData.invalidName).success).toBe(false);

                    expect(passwordSchema.safeParse(testData.validPassword).success).toBe(true);
                    expect(passwordSchema.safeParse(testData.invalidPassword).success).toBe(false);
                }
            ),
            { numRuns: 50 }
        );
    });

    it('should preserve user backup functionality', async () => {
        // **Feature: external-sdk-transformation, Property 1: Functional Preservation During Extraction**
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    name: fc.string({ minLength: 2, maxLength: 50 }),
                    email: fc.emailAddress(),
                    role: fc.constantFrom(UserRole.USER, UserRole.ADMIN),
                }),
                async (userData) => {
                    // Create a user
                    const createdUser = await createUser({
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                    });

                    // Get user backup
                    const backup = await getUserBackup(createdUser._id);

                    // Verify backup contains all expected data
                    expect(backup).toBeDefined();
                    expect(backup!.user).toBeDefined();
                    expect(backup!.user.id).toBe(createdUser._id.toString());
                    expect(backup!.user.name).toBe(userData.name);
                    expect(backup!.user.email).toBe(userData.email.toLowerCase());
                    expect(backup!.user.role).toBe(userData.role);
                    expect(backup!.accounts).toBeDefined();
                    expect(Array.isArray(backup!.accounts)).toBe(true);
                    expect(backup!.sessions).toBeDefined();
                    expect(Array.isArray(backup!.sessions)).toBe(true);

                    // Clean up
                    await User.findByIdAndDelete(createdUser._id);
                }
            ),
            { numRuns: 50 }
        );
    });

    it('should preserve user update functionality', async () => {
        // **Feature: external-sdk-transformation, Property 1: Functional Preservation During Extraction**
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    initialName: fc.string({ minLength: 2, maxLength: 50 }),
                    updatedName: fc.string({ minLength: 2, maxLength: 50 }),
                    email: fc.emailAddress(),
                    role: fc.constantFrom(UserRole.USER, UserRole.ADMIN),
                }),
                async (userData) => {
                    // Create a user
                    const createdUser = await createUser({
                        name: userData.initialName,
                        email: userData.email,
                        role: userData.role,
                    });

                    // Update the user
                    const updatedUser = await updateUser(createdUser._id, {
                        name: userData.updatedName,
                    });

                    // Verify update worked
                    expect(updatedUser).toBeDefined();
                    expect(updatedUser!.name).toBe(userData.updatedName);
                    expect(updatedUser!.email).toBe(userData.email.toLowerCase());
                    expect(updatedUser!.role).toBe(userData.role);

                    // Clean up
                    await User.findByIdAndDelete(createdUser._id);
                }
            ),
            { numRuns: 50 }
        );
    });
});