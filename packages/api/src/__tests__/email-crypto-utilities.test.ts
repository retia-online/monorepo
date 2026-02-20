/**
 * Unit tests for email and crypto utilities
 * Tests email services and crypto utilities
 * Requirements: 1.2
 */

import {
    sendEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPendingApprovalEmail,
    hashPassword,
    comparePassword,
    generateToken,
    generatePasswordResetToken,
    generateInviteToken,
} from '../index';

// Mock nodemailer to avoid actual email sending during tests
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: mockSendMail,
    })),
}));

describe('Email and Crypto Utilities', () => {
    beforeEach(() => {
        mockSendMail.mockClear();
        mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
    });

    describe('Email Services', () => {
        describe('sendEmail', () => {
            it('should send email with correct parameters', async () => {
                const emailOptions = {
                    to: 'test@example.com',
                    subject: 'Test Subject',
                    html: '<h1>Test HTML</h1>',
                };

                const result = await sendEmail(emailOptions);

                expect(mockSendMail).toHaveBeenCalledWith({
                    from: `"Auth System" <${process.env.SMTP_USER}>`,
                    to: emailOptions.to,
                    subject: emailOptions.subject,
                    html: emailOptions.html,
                });
                expect(result.messageId).toBe('test-message-id');
            });
        });

        describe('sendPasswordResetEmail', () => {
            it('should send password reset email with correct content', async () => {
                const email = 'user@example.com';
                const resetToken = 'reset-token-123';

                await sendPasswordResetEmail(email, resetToken);

                expect(mockSendMail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        to: email,
                        subject: 'Password Reset Request',
                        html: expect.stringContaining(resetToken),
                    })
                );

                const callArgs = mockSendMail.mock.calls[0][0];
                expect(callArgs.html).toContain(`${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);
                expect(callArgs.html).toContain('Password Reset Request');
            });
        });

        describe('sendWelcomeEmail', () => {
            it('should send welcome email with correct content', async () => {
                const name = 'John Doe';
                const email = 'john@example.com';

                await sendWelcomeEmail(name, email);

                expect(mockSendMail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        to: email,
                        subject: '🚀 ¡Bienvenido a la plataforma!',
                        html: expect.stringContaining(name),
                    })
                );

                const callArgs = mockSendMail.mock.calls[0][0];
                expect(callArgs.html).toContain(`¡Bienvenido, ${name}!`);
                expect(callArgs.html).toContain('Gracias por registrarte');
            });
        });

        describe('sendPendingApprovalEmail', () => {
            it('should send pending approval email with correct content', async () => {
                const name = 'Jane Doe';
                const email = 'jane@example.com';

                await sendPendingApprovalEmail(name, email);

                expect(mockSendMail).toHaveBeenCalledWith(
                    expect.objectContaining({
                        to: email,
                        subject: '⏳ Tu registro está pendiente de aprobación',
                        html: expect.stringContaining(name),
                    })
                );

                const callArgs = mockSendMail.mock.calls[0][0];
                expect(callArgs.html).toContain(`Hola <strong>${name}</strong>`);
                expect(callArgs.html).toContain('aprobar tu cuenta');
            });
        });
    });

    describe('Crypto Utilities', () => {
        describe('hashPassword', () => {
            it('should hash password correctly', async () => {
                const password = 'testpassword123';
                const hashedPassword = await hashPassword(password);

                expect(hashedPassword).toBeDefined();
                expect(hashedPassword).not.toBe(password);
                expect(hashedPassword.length).toBeGreaterThan(password.length);
                expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
            });

            it('should generate different hashes for same password', async () => {
                const password = 'samepassword';
                const hash1 = await hashPassword(password);
                const hash2 = await hashPassword(password);

                expect(hash1).not.toBe(hash2); // Different salts should produce different hashes
            });
        });

        describe('comparePassword', () => {
            it('should return true for correct password', async () => {
                const password = 'correctpassword';
                const hashedPassword = await hashPassword(password);

                const isValid = await comparePassword(password, hashedPassword);
                expect(isValid).toBe(true);
            });

            it('should return false for incorrect password', async () => {
                const password = 'correctpassword';
                const wrongPassword = 'wrongpassword';
                const hashedPassword = await hashPassword(password);

                const isValid = await comparePassword(wrongPassword, hashedPassword);
                expect(isValid).toBe(false);
            });

            it('should handle empty passwords', async () => {
                const hashedPassword = await hashPassword('somepassword');

                const isValid = await comparePassword('', hashedPassword);
                expect(isValid).toBe(false);
            });
        });

        describe('generateToken', () => {
            it('should generate token with default length', () => {
                const token = generateToken();

                expect(token).toBeDefined();
                expect(typeof token).toBe('string');
                expect(token.length).toBe(64); // 32 bytes * 2 for hex encoding
                expect(/^[a-f0-9]+$/.test(token)).toBe(true); // Only hex characters
            });

            it('should generate token with custom length', () => {
                const customLength = 16;
                const token = generateToken(customLength);

                expect(token.length).toBe(customLength * 2); // hex encoding doubles length
                expect(/^[a-f0-9]+$/.test(token)).toBe(true);
            });

            it('should generate unique tokens', () => {
                const token1 = generateToken();
                const token2 = generateToken();

                expect(token1).not.toBe(token2);
            });
        });

        describe('generatePasswordResetToken', () => {
            it('should generate password reset token with expiration', () => {
                const { token, expires } = generatePasswordResetToken();

                expect(token).toBeDefined();
                expect(typeof token).toBe('string');
                expect(token.length).toBe(64); // 32 bytes * 2 for hex
                expect(/^[a-f0-9]+$/.test(token)).toBe(true);

                expect(expires).toBeInstanceOf(Date);
                expect(expires.getTime()).toBeGreaterThan(Date.now());

                // Should expire in approximately 1 hour
                const expectedExpiry = new Date(Date.now() + 60 * 60 * 1000);
                const timeDiff = Math.abs(expires.getTime() - expectedExpiry.getTime());
                expect(timeDiff).toBeLessThan(1000); // Within 1 second
            });
        });

        describe('generateInviteToken', () => {
            it('should generate invite token with default expiration', () => {
                const { token, expires } = generateInviteToken();

                expect(token).toBeDefined();
                expect(typeof token).toBe('string');
                expect(token.length).toBe(64);
                expect(/^[a-f0-9]+$/.test(token)).toBe(true);

                expect(expires).toBeInstanceOf(Date);
                expect(expires.getTime()).toBeGreaterThan(Date.now());

                // Should expire in approximately 7 days
                const expectedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const timeDiff = Math.abs(expires.getTime() - expectedExpiry.getTime());
                expect(timeDiff).toBeLessThan(60000); // Within 1 minute
            });

            it('should generate invite token with custom expiration', () => {
                const customDays = 3;
                const { token, expires } = generateInviteToken(customDays);

                expect(token).toBeDefined();
                expect(expires).toBeInstanceOf(Date);

                // Should expire in approximately 3 days
                const expectedExpiry = new Date(Date.now() + customDays * 24 * 60 * 60 * 1000);
                const timeDiff = Math.abs(expires.getTime() - expectedExpiry.getTime());
                expect(timeDiff).toBeLessThan(60000); // Within 1 minute
            });
        });
    });
});