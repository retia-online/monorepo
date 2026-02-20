import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from './LoginForm';

const meta = {
    title: 'Auth Components/LoginForm',
    component: LoginForm,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        enabledProviders: {
            control: 'check',
            options: ['email', 'google', 'facebook'],
            description: 'Enabled authentication providers',
        },
        showRegisterLink: {
            control: 'boolean',
            description: 'Show register link at bottom',
        },
        loading: {
            control: 'boolean',
            description: 'Show loading state',
        },
        error: {
            control: 'text',
            description: 'Error message to display',
        },
        onSubmit: { action: 'submitted' },
        onOAuthSignIn: { action: 'oauth-signin' },
    },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Email only login
export const EmailOnly: Story = {
    args: {
        enabledProviders: ['email'],
        showRegisterLink: true,
        onSubmit: async (email, password) => {
            console.log('Login attempt:', { email, password });
        },
        onOAuthSignIn: async (provider) => {
            console.log('OAuth signin:', provider);
        },
    },
};

// With OAuth providers
export const WithOAuth: Story = {
    args: {
        enabledProviders: ['email', 'google', 'facebook'],
        showRegisterLink: true,
        onSubmit: async (email, password) => {
            console.log('Login attempt:', { email, password });
        },
        onOAuthSignIn: async (provider) => {
            console.log('OAuth signin:', provider);
        },
    },
};

// OAuth only
export const OAuthOnly: Story = {
    args: {
        enabledProviders: ['google', 'facebook'],
        showRegisterLink: true,
        onSubmit: async (email, password) => {
            console.log('Login attempt:', { email, password });
        },
        onOAuthSignIn: async (provider) => {
            console.log('OAuth signin:', provider);
        },
    },
};

// With error
export const WithError: Story = {
    args: {
        enabledProviders: ['email', 'google'],
        showRegisterLink: true,
        error: 'Email o contraseña incorrectos',
        onSubmit: async (email, password) => {
            console.log('Login attempt:', { email, password });
        },
        onOAuthSignIn: async (provider) => {
            console.log('OAuth signin:', provider);
        },
    },
};

// Loading state
export const Loading: Story = {
    args: {
        enabledProviders: ['email', 'google'],
        showRegisterLink: true,
        loading: true,
        onSubmit: async (email, password) => {
            console.log('Login attempt:', { email, password });
        },
        onOAuthSignIn: async (provider) => {
            console.log('OAuth signin:', provider);
        },
    },
};

// No register link
export const NoRegisterLink: Story = {
    args: {
        enabledProviders: ['email'],
        showRegisterLink: false,
        onSubmit: async (email, password) => {
            console.log('Login attempt:', { email, password });
        },
        onOAuthSignIn: async (provider) => {
            console.log('OAuth signin:', provider);
        },
    },
};