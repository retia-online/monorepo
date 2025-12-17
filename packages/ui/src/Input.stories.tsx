import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { useState } from 'react';

const meta = {
    title: 'Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        label: {
            control: 'text',
            description: 'Label text for the input',
        },
        error: {
            control: 'text',
            description: 'Error message to display',
        },
        helperText: {
            control: 'text',
            description: 'Helper text below the input',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Whether the input should take full width',
        },
        type: {
            control: 'select',
            options: ['text', 'email', 'password', 'number', 'tel', 'url'],
            description: 'Input type',
        },
        disabled: {
            control: 'boolean',
            description: 'Disable the input',
        },
        required: {
            control: 'boolean',
            description: 'Mark input as required',
        },
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic input
export const Basic: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

// With label
export const WithLabel: Story = {
    args: {
        label: 'Email Address',
        type: 'email',
        placeholder: 'you@example.com',
    },
};

// With helper text
export const WithHelperText: Story = {
    args: {
        label: 'Username',
        placeholder: 'johndoe',
        helperText: 'Choose a unique username',
    },
};

// With error
export const WithError: Story = {
    args: {
        label: 'Email',
        type: 'email',
        value: 'invalid-email',
        error: 'Please enter a valid email address',
    },
};

// Password input
export const Password: Story = {
    args: {
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
        helperText: 'Minimum 8 characters',
    },
};

// Disabled
export const Disabled: Story = {
    args: {
        label: 'Disabled Input',
        value: 'Cannot edit this',
        disabled: true,
    },
};

// Required
export const Required: Story = {
    args: {
        label: 'Required Field',
        required: true,
        placeholder: 'This field is required',
    },
};

// Full width
export const FullWidth: Story = {
    args: {
        label: 'Full Width Input',
        fullWidth: true,
        placeholder: 'Takes full width',
    },
    parameters: {
        layout: 'padded',
    },
};

// Controlled input with state
export const Controlled: Story = {
    render: () => {
        const [value, setValue] = useState('');
        return (
            <div className="w-80">
                <Input
                    label="Controlled Input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Type something..."
                    helperText={`You typed: ${value.length} characters`}
                />
            </div>
        );
    },
};

// Form example
export const FormExample: Story = {
    render: () => (
        <form className="space-y-4 w-96">
            <Input label="Full Name" type="text" placeholder="John Doe" required />
            <Input label="Email" type="email" placeholder="john@example.com" required />
            <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                helperText="Minimum 8 characters"
                required
            />
            <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
        </form>
    ),
    parameters: {
        layout: 'padded',
    },
};

// Different states
export const AllStates: Story = {
    render: () => (
        <div className="space-y-4 w-96">
            <Input label="Normal" placeholder="Normal state" />
            <Input label="With Value" value="Some value" />
            <Input label="With Helper" helperText="This is helper text" placeholder="Type here" />
            <Input label="With Error" error="This field has an error" value="Invalid" />
            <Input label="Disabled" disabled value="Disabled field" />
            <Input label="Required" required placeholder="Required field" />
        </div>
    ),
    parameters: {
        layout: 'padded',
    },
};
