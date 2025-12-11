import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
    title: 'Components/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        className: {
            control: 'text',
            description: 'Additional CSS classes',
        },
    },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card
export const Basic: Story = {
    args: {
        children: (
            <div>
                <h3 className="text-lg font-semibold mb-2">Card Title</h3>
                <p className="text-gray-600">This is a basic card with some content.</p>
            </div>
        ),
    },
};

// Card with form
export const WithForm: Story = {
    args: {
        children: (
            <div>
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="••••••••"
                        />
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                        Sign In
                    </button>
                </form>
            </div>
        ),
    },
};

// Card with image
export const WithImage: Story = {
    args: {
        children: (
            <div>
                <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg -m-6 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Beautiful Card</h3>
                <p className="text-gray-600 mb-4">
                    This card has a gradient header image and looks great!
                </p>
                <button className="text-blue-500 hover:text-blue-600 font-medium">
                    Learn More →
                </button>
            </div>
        ),
    },
};

// Multiple cards
export const MultipleCards: Story = {
    render: () => (
        <div className="grid grid-cols-3 gap-4">
            <Card>
                <h3 className="font-semibold mb-2">Card 1</h3>
                <p className="text-sm text-gray-600">First card content</p>
            </Card>
            <Card>
                <h3 className="font-semibold mb-2">Card 2</h3>
                <p className="text-sm text-gray-600">Second card content</p>
            </Card>
            <Card>
                <h3 className="font-semibold mb-2">Card 3</h3>
                <p className="text-sm text-gray-600">Third card content</p>
            </Card>
        </div>
    ),
    parameters: {
        layout: 'padded',
    },
};

// Card with stats
export const WithStats: Story = {
    args: {
        children: (
            <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Users</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">1,234</p>
                <p className="text-sm text-green-600">↑ 12% from last month</p>
            </div>
        ),
    },
};
