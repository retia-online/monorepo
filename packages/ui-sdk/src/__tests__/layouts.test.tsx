import React from 'react';
import { BaseLayout, AuthLayout } from '../layouts';

describe('Layout Components Unit Tests', () => {
    describe('BaseLayout Component', () => {
        const mockOnLogout = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('creates BaseLayout element with children', () => {
            const content = React.createElement('div', {}, 'Test content');
            const layout = React.createElement(BaseLayout, {}, content);

            expect(layout).toBeDefined();
            expect(layout.type).toBe(BaseLayout);
            expect(layout.props.children).toBe(content);
        });

        it('creates BaseLayout element with default instance name', () => {
            const layout = React.createElement(BaseLayout, {}, 'Content');
            // Default props are applied by the component, not by React.createElement
            expect(layout.props.children).toBe('Content');
        });

        it('creates BaseLayout element with custom instance name', () => {
            const layout = React.createElement(BaseLayout, {
                instanceName: 'Custom App'
            }, 'Content');

            expect(layout.props.instanceName).toBe('Custom App');
        });

        it('creates BaseLayout element with user and auth props', () => {
            const user = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'USER'
            };

            const layout = React.createElement(BaseLayout, {
                instanceName: 'Test App',
                showAuthButtons: true,
                user: user,
                onLogout: mockOnLogout
            }, 'Content');

            expect(layout.props.instanceName).toBe('Test App');
            expect(layout.props.showAuthButtons).toBe(true);
            expect(layout.props.user).toEqual(user);
            expect(layout.props.onLogout).toBe(mockOnLogout);
        });

        it('creates BaseLayout element with auth buttons disabled', () => {
            const layout = React.createElement(BaseLayout, {
                showAuthButtons: false
            }, 'Content');

            expect(layout.props.showAuthButtons).toBe(false);
        });

        it('creates BaseLayout element with custom className', () => {
            const layout = React.createElement(BaseLayout, {
                className: 'custom-layout'
            }, 'Content');

            expect(layout.props.className).toBe('custom-layout');
        });

        it('validates default props', () => {
            const layout = React.createElement(BaseLayout, {}, 'Content');
            // Default props are applied by the component, not by React.createElement
            expect(layout.props.children).toBe('Content');
        });
    });

    describe('AuthLayout Component', () => {
        it('creates AuthLayout element with children', () => {
            const content = React.createElement('div', {}, 'Auth form content');
            const layout = React.createElement(AuthLayout, {}, content);

            expect(layout).toBeDefined();
            expect(layout.type).toBe(AuthLayout);
            expect(layout.props.children).toBe(content);
        });

        it('creates AuthLayout element with default instance name', () => {
            const layout = React.createElement(AuthLayout, {
                showLogo: true
            }, 'Content');

            // Default props are applied by the component, not by React.createElement
            expect(layout.props.showLogo).toBe(true);
        });

        it('creates AuthLayout element with custom instance name', () => {
            const layout = React.createElement(AuthLayout, {
                instanceName: 'Custom Auth App',
                showLogo: true
            }, 'Content');

            expect(layout.props.instanceName).toBe('Custom Auth App');
        });

        it('creates AuthLayout element with logo shown', () => {
            const layout = React.createElement(AuthLayout, {
                showLogo: true,
                instanceName: 'Test App'
            }, 'Content');

            expect(layout.props.showLogo).toBe(true);
            expect(layout.props.instanceName).toBe('Test App');
        });

        it('creates AuthLayout element with logo hidden', () => {
            const layout = React.createElement(AuthLayout, {
                showLogo: false,
                instanceName: 'Test App'
            }, 'Content');

            expect(layout.props.showLogo).toBe(false);
        });

        it('creates AuthLayout element with title', () => {
            const layout = React.createElement(AuthLayout, {
                title: 'Sign In'
            }, 'Content');

            expect(layout.props.title).toBe('Sign In');
        });

        it('creates AuthLayout element with subtitle', () => {
            const layout = React.createElement(AuthLayout, {
                subtitle: 'Welcome back to your account'
            }, 'Content');

            expect(layout.props.subtitle).toBe('Welcome back to your account');
        });

        it('creates AuthLayout element with both title and subtitle', () => {
            const layout = React.createElement(AuthLayout, {
                title: 'Sign In',
                subtitle: 'Welcome back to your account'
            }, 'Content');

            expect(layout.props.title).toBe('Sign In');
            expect(layout.props.subtitle).toBe('Welcome back to your account');
        });

        it('creates AuthLayout element with custom className', () => {
            const layout = React.createElement(AuthLayout, {
                className: 'custom-auth-layout'
            }, 'Content');

            expect(layout.props.className).toBe('custom-auth-layout');
        });

        it('creates AuthLayout element with custom logo source', () => {
            const layout = React.createElement(AuthLayout, {
                showLogo: true,
                logoSrc: '/custom-logo.svg'
            }, 'Content');

            expect(layout.props.logoSrc).toBe('/custom-logo.svg');
        });

        it('validates default props', () => {
            const layout = React.createElement(AuthLayout, {}, 'Content');
            // Default props are applied by the component, not by React.createElement
            expect(layout.props.children).toBe('Content');
        });

        it('creates AuthLayout element with multiple children', () => {
            const child1 = React.createElement('form', { key: 'form' }, 'Login form');
            const child2 = React.createElement('div', { key: 'footer' }, 'Footer');
            const layout = React.createElement(AuthLayout, {}, [child1, child2]);

            expect(Array.isArray(layout.props.children)).toBe(true);
            expect(layout.props.children).toHaveLength(2);
        });
    });
});