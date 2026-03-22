import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from './Navbar';

const meta = {
    title: 'Auth Components/Navbar',
    component: Navbar,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        showAuthButtons: {
            control: 'boolean',
            description: 'Show authentication buttons',
        },
        instanceName: {
            control: 'text',
            description: 'Application instance name',
        },
        onLogout: { action: 'logout' },
    },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Not authenticated
export const NotAuthenticated: Story = {
    args: {
        showAuthButtons: true,
        instanceName: 'Retia',
        user: null,
        onLogout: () => console.log('Logout clicked'),
    },
};

// Authenticated user
export const AuthenticatedUser: Story = {
    args: {
        showAuthButtons: true,
        instanceName: 'Retia',
        user: {
            name: 'Juan Pérez',
            email: 'juan@example.com',
            role: 'USER',
        },
        onLogout: () => console.log('Logout clicked'),
    },
};

// Authenticated admin
export const AuthenticatedAdmin: Story = {
    args: {
        showAuthButtons: true,
        instanceName: 'Retia',
        user: {
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'ADMIN',
        },
        onLogout: () => console.log('Logout clicked'),
    },
};

// No auth buttons
export const NoAuthButtons: Story = {
    args: {
        showAuthButtons: false,
        instanceName: 'Retia',
        user: null,
        onLogout: () => console.log('Logout clicked'),
    },
};

// Custom instance name
export const CustomInstanceName: Story = {
    args: {
        showAuthButtons: true,
        instanceName: 'Mi Aplicación',
        user: {
            name: 'Usuario Test',
            email: 'test@example.com',
            role: 'USER',
        },
        onLogout: () => console.log('Logout clicked'),
    },
};