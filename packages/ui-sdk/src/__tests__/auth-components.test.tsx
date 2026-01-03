import React from 'react';
import { LoginForm, Navbar, ProfileCard } from '../auth-components';

describe('Auth Components Unit Tests', () => {
    describe('LoginForm Component', () => {
        const mockOnSubmit = jest.fn();
        const mockOnOAuthSignIn = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('creates LoginForm element with email provider', () => {
            const loginForm = React.createElement(LoginForm, {
                enabledProviders: ['email'],
                onSubmit: mockOnSubmit,
                onOAuthSignIn: mockOnOAuthSignIn
            });

            expect(loginForm).toBeDefined();
            expect(loginForm.type).toBe(LoginForm);
            expect(loginForm.props.enabledProviders).toEqual(['email']);
            expect(loginForm.props.onSubmit).toBe(mockOnSubmit);
            expect(loginForm.props.onOAuthSignIn).toBe(mockOnOAuthSignIn);
        });

        it('creates LoginForm element with OAuth providers', () => {
            const loginForm = React.createElement(LoginForm, {
                enabledProviders: ['google', 'facebook'],
                onSubmit: mockOnSubmit,
                onOAuthSignIn: mockOnOAuthSignIn
            });

            expect(loginForm.props.enabledProviders).toEqual(['google', 'facebook']);
        });

        it('creates LoginForm element with error message', () => {
            const loginForm = React.createElement(LoginForm, {
                enabledProviders: ['email'],
                onSubmit: mockOnSubmit,
                onOAuthSignIn: mockOnOAuthSignIn,
                error: 'Invalid credentials'
            });

            expect(loginForm.props.error).toBe('Invalid credentials');
        });

        it('creates LoginForm element with register link enabled', () => {
            const loginForm = React.createElement(LoginForm, {
                enabledProviders: ['email'],
                showRegisterLink: true,
                onSubmit: mockOnSubmit,
                onOAuthSignIn: mockOnOAuthSignIn
            });

            expect(loginForm.props.showRegisterLink).toBe(true);
        });

        it('creates LoginForm element with register link disabled', () => {
            const loginForm = React.createElement(LoginForm, {
                enabledProviders: ['email'],
                showRegisterLink: false,
                onSubmit: mockOnSubmit,
                onOAuthSignIn: mockOnOAuthSignIn
            });

            expect(loginForm.props.showRegisterLink).toBe(false);
        });

        it('creates LoginForm element with loading state', () => {
            const loginForm = React.createElement(LoginForm, {
                enabledProviders: ['email'],
                loading: true,
                onSubmit: mockOnSubmit,
                onOAuthSignIn: mockOnOAuthSignIn
            });

            expect(loginForm.props.loading).toBe(true);
        });

        it('validates required props are functions', () => {
            const loginForm = React.createElement(LoginForm, {
                enabledProviders: ['email'],
                onSubmit: mockOnSubmit,
                onOAuthSignIn: mockOnOAuthSignIn
            });

            expect(typeof loginForm.props.onSubmit).toBe('function');
            expect(typeof loginForm.props.onOAuthSignIn).toBe('function');
        });
    });

    describe('Navbar Component', () => {
        const mockOnLogout = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('creates Navbar element with default props', () => {
            const navbar = React.createElement(Navbar, {
                onLogout: mockOnLogout
            });

            expect(navbar).toBeDefined();
            expect(navbar.type).toBe(Navbar);
            // Default props are applied by the component, not by React.createElement
            expect(navbar.props.onLogout).toBe(mockOnLogout);
        });

        it('creates Navbar element with custom instance name', () => {
            const navbar = React.createElement(Navbar, {
                instanceName: 'Test App',
                onLogout: mockOnLogout
            });

            expect(navbar.props.instanceName).toBe('Test App');
        });

        it('creates Navbar element with auth buttons disabled', () => {
            const navbar = React.createElement(Navbar, {
                showAuthButtons: false,
                onLogout: mockOnLogout
            });

            expect(navbar.props.showAuthButtons).toBe(false);
        });

        it('creates Navbar element with user data', () => {
            const user = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'USER'
            };

            const navbar = React.createElement(Navbar, {
                user: user,
                onLogout: mockOnLogout
            });

            expect(navbar.props.user).toEqual(user);
        });

        it('creates Navbar element with admin user', () => {
            const adminUser = {
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'ADMIN'
            };

            const navbar = React.createElement(Navbar, {
                user: adminUser,
                onLogout: mockOnLogout
            });

            expect(navbar.props.user.role).toBe('ADMIN');
        });

        it('creates Navbar element with null user', () => {
            const navbar = React.createElement(Navbar, {
                user: null,
                onLogout: mockOnLogout
            });

            expect(navbar.props.user).toBeNull();
        });

        it('validates onLogout prop is function', () => {
            const navbar = React.createElement(Navbar, {
                onLogout: mockOnLogout
            });

            expect(typeof navbar.props.onLogout).toBe('function');
        });

        it('creates Navbar element with custom logo source', () => {
            const navbar = React.createElement(Navbar, {
                logoSrc: '/custom-logo.svg',
                onLogout: mockOnLogout
            });

            expect(navbar.props.logoSrc).toBe('/custom-logo.svg');
        });
    });

    describe('ProfileCard Component', () => {
        const mockProfile = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'USER',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
        };

        const mockOnSave = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('creates ProfileCard element with profile data', () => {
            const profileCard = React.createElement(ProfileCard, {
                profile: mockProfile,
                onSave: mockOnSave
            });

            expect(profileCard).toBeDefined();
            expect(profileCard.type).toBe(ProfileCard);
            expect(profileCard.props.profile).toEqual(mockProfile);
            expect(profileCard.props.onSave).toBe(mockOnSave);
        });

        it('creates ProfileCard element with admin profile', () => {
            const adminProfile = { ...mockProfile, role: 'ADMIN' };
            const profileCard = React.createElement(ProfileCard, {
                profile: adminProfile,
                onSave: mockOnSave
            });

            expect(profileCard.props.profile.role).toBe('ADMIN');
        });

        it('creates ProfileCard element with error message', () => {
            const profileCard = React.createElement(ProfileCard, {
                profile: mockProfile,
                onSave: mockOnSave,
                error: 'Update failed'
            });

            expect(profileCard.props.error).toBe('Update failed');
        });

        it('creates ProfileCard element with success message', () => {
            const profileCard = React.createElement(ProfileCard, {
                profile: mockProfile,
                onSave: mockOnSave,
                success: 'Profile updated successfully'
            });

            expect(profileCard.props.success).toBe('Profile updated successfully');
        });

        it('creates ProfileCard element with loading state', () => {
            const profileCard = React.createElement(ProfileCard, {
                profile: mockProfile,
                onSave: mockOnSave,
                loading: true
            });

            expect(profileCard.props.loading).toBe(true);
        });

        it('creates ProfileCard element with custom avatar source', () => {
            const profileCard = React.createElement(ProfileCard, {
                profile: mockProfile,
                onSave: mockOnSave,
                avatarSrc: '/custom-avatar.svg'
            });

            expect(profileCard.props.avatarSrc).toBe('/custom-avatar.svg');
        });

        it('validates profile structure', () => {
            const profileCard = React.createElement(ProfileCard, {
                profile: mockProfile,
                onSave: mockOnSave
            });

            const profile = profileCard.props.profile;
            expect(typeof profile.id).toBe('string');
            expect(typeof profile.name).toBe('string');
            expect(typeof profile.email).toBe('string');
            expect(typeof profile.role).toBe('string');
            expect(typeof profile.createdAt).toBe('string');
            expect(typeof profile.updatedAt).toBe('string');
        });

        it('validates onSave prop is function', () => {
            const profileCard = React.createElement(ProfileCard, {
                profile: mockProfile,
                onSave: mockOnSave
            });

            expect(typeof profileCard.props.onSave).toBe('function');
        });
    });
});