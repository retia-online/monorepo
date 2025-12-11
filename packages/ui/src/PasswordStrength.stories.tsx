import type { Meta, StoryObj } from '@storybook/react';
import { PasswordStrength } from './PasswordStrength';
import { useState } from 'react';

const meta = {
    title: 'Components/PasswordStrength',
    component: PasswordStrength,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof PasswordStrength>;

export default meta;
type Story = StoryObj<typeof meta>;

// Weak password
export const WeakPassword: Story = {
    args: {
        password: 'abc',
        requirements: [
            { text: 'Mínimo 8 caracteres', met: false },
            { text: 'Al menos una letra mayúscula', met: false },
            { text: 'Al menos una letra minúscula', met: true },
            { text: 'Al menos un número', met: false },
            { text: 'Al menos un carácter especial', met: false },
        ],
    },
};

// Medium password
export const MediumPassword: Story = {
    args: {
        password: 'Password1',
        requirements: [
            { text: 'Mínimo 8 caracteres', met: true },
            { text: 'Al menos una letra mayúscula', met: true },
            { text: 'Al menos una letra minúscula', met: true },
            { text: 'Al menos un número', met: true },
            { text: 'Al menos un carácter especial', met: false },
        ],
    },
};

// Strong password
export const StrongPassword: Story = {
    args: {
        password: 'Password1!',
        requirements: [
            { text: 'Mínimo 8 caracteres', met: true },
            { text: 'Al menos una letra mayúscula', met: true },
            { text: 'Al menos una letra minúscula', met: true },
            { text: 'Al menos un número', met: true },
            { text: 'Al menos un carácter especial', met: true },
        ],
    },
};

// Simple requirements (development)
export const SimpleRequirements: Story = {
    args: {
        password: 'pass123',
        requirements: [
            { text: 'Mínimo 6 caracteres', met: true },
        ],
    },
};

// Interactive example
export const Interactive: Story = {
    render: () => {
        const [password, setPassword] = useState('');

        const requirements = [
            { text: 'Mínimo 8 caracteres', met: password.length >= 8 },
            { text: 'Al menos una letra mayúscula', met: /[A-Z]/.test(password) },
            { text: 'Al menos una letra minúscula', met: /[a-z]/.test(password) },
            { text: 'Al menos un número', met: /[0-9]/.test(password) },
            { text: 'Al menos un carácter especial', met: /[^A-Za-z0-9]/.test(password) },
        ];

        return (
            <div className="w-96">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                    placeholder="Type a password..."
                />
                <PasswordStrength password={password} requirements={requirements} />
            </div>
        );
    },
};

// With input field
export const WithInputField: Story = {
    render: () => {
        const [password, setPassword] = useState('');

        const requirements = [
            { text: 'Mínimo 8 caracteres', met: password.length >= 8 },
            { text: 'Al menos una letra mayúscula', met: /[A-Z]/.test(password) },
            { text: 'Al menos una letra minúscula', met: /[a-z]/.test(password) },
            { text: 'Al menos un número', met: /[0-9]/.test(password) },
            { text: 'Al menos un carácter especial', met: /[^A-Za-z0-9]/.test(password) },
        ];

        const allMet = requirements.every(req => req.met);

        return (
            <div className="w-96 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Create Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Enter password..."
                    />
                    <PasswordStrength password={password} requirements={requirements} />
                </div>

                {allMet && (
                    <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                        ✓ Password meets all requirements!
                    </div>
                )}
            </div>
        );
    },
};
