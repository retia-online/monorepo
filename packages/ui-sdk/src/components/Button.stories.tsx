import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
    title: 'Components/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'outline', 'danger'],
            description: 'Visual style variant of the button',
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'Size of the button',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Whether the button should take full width',
        },
        loading: {
            control: 'boolean',
            description: 'Show loading spinner',
        },
        disabled: {
            control: 'boolean',
            description: 'Disable the button',
        },
        onClick: { action: 'clicked' },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary Button',
    },
};

// Secondary button
export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary Button',
    },
};

// Outline button
export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline Button',
    },
};

// Danger button
export const Danger: Story = {
    args: {
        variant: 'danger',
        children: 'Danger Button',
    },
};

// Small size
export const Small: Story = {
    args: {
        size: 'sm',
        children: 'Small Button',
    },
};

// Medium size (default)
export const Medium: Story = {
    args: {
        size: 'md',
        children: 'Medium Button',
    },
};

// Large size
export const Large: Story = {
    args: {
        size: 'lg',
        children: 'Large Button',
    },
};

// Loading state
export const Loading: Story = {
    args: {
        loading: true,
        children: 'Loading...',
    },
};

// Disabled state
export const Disabled: Story = {
    args: {
        disabled: true,
        children: 'Disabled Button',
    },
};

// Full width
export const FullWidth: Story = {
    args: {
        fullWidth: true,
        children: 'Full Width Button',
    },
    parameters: {
        layout: 'padded',
    },
};

// All variants showcase
export const AllVariants: Story = {
    render: () => (
        <div className="space-y-4">
            <div className="space-x-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
            </div>
            <div className="space-x-2">
                <Button variant="primary" disabled>
                    Disabled
                </Button>
                <Button variant="primary" loading>
                    Loading
                </Button>
            </div>
            <div className="space-x-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
            </div>
        </div>
    ),
    parameters: {
        layout: 'padded',
    },
};