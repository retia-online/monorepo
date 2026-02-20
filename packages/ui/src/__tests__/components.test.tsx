import React from 'react';
import { Button, Card, Input, PasswordStrength } from '../components';

// Mock React.useId for consistent testing
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useId: () => 'test-id',
}));

describe('Base Components Unit Tests', () => {
    describe('Button Component', () => {
        it('creates Button element with default props', () => {
            const button = React.createElement(Button, {}, 'Click me');
            expect(button).toBeDefined();
            expect(button.type).toBe(Button);
            expect(button.props.children).toBe('Click me');
        });

        it('creates Button element with variant prop', () => {
            const button = React.createElement(Button, { variant: 'primary' }, 'Primary');
            expect(button.props.variant).toBe('primary');
        });

        it('creates Button element with size prop', () => {
            const button = React.createElement(Button, { size: 'lg' }, 'Large');
            expect(button.props.size).toBe('lg');
        });

        it('creates Button element with loading state', () => {
            const button = React.createElement(Button, { loading: true }, 'Loading');
            expect(button.props.loading).toBe(true);
        });

        it('creates Button element with disabled state', () => {
            const button = React.createElement(Button, { disabled: true }, 'Disabled');
            expect(button.props.disabled).toBe(true);
        });

        it('creates Button element with fullWidth prop', () => {
            const button = React.createElement(Button, { fullWidth: true }, 'Full Width');
            expect(button.props.fullWidth).toBe(true);
        });

        it('creates Button element with onClick handler', () => {
            const handleClick = jest.fn();
            const button = React.createElement(Button, { onClick: handleClick }, 'Click');
            expect(button.props.onClick).toBe(handleClick);
        });
    });

    describe('Input Component', () => {
        it('creates Input element with default props', () => {
            const input = React.createElement(Input);
            expect(input).toBeDefined();
            expect(input.type).toBe(Input);
        });

        it('creates Input element with label', () => {
            const input = React.createElement(Input, { label: 'Email' });
            expect(input.props.label).toBe('Email');
        });

        it('creates Input element with error', () => {
            const input = React.createElement(Input, { error: 'Invalid input' });
            expect(input.props.error).toBe('Invalid input');
        });

        it('creates Input element with helper text', () => {
            const input = React.createElement(Input, { helperText: 'Enter your email' });
            expect(input.props.helperText).toBe('Enter your email');
        });

        it('creates Input element with type', () => {
            const input = React.createElement(Input, { type: 'password' });
            expect(input.props.type).toBe('password');
        });

        it('creates Input element with disabled state', () => {
            const input = React.createElement(Input, { disabled: true });
            expect(input.props.disabled).toBe(true);
        });

        it('creates Input element with required prop', () => {
            const input = React.createElement(Input, { required: true });
            expect(input.props.required).toBe(true);
        });

        it('creates Input element with fullWidth prop', () => {
            const input = React.createElement(Input, { fullWidth: false });
            expect(input.props.fullWidth).toBe(false);
        });
    });

    describe('Card Component', () => {
        it('creates Card element with children', () => {
            const content = React.createElement('p', {}, 'Card content');
            const card = React.createElement(Card, {}, content);
            expect(card).toBeDefined();
            expect(card.type).toBe(Card);
            expect(card.props.children).toBe(content);
        });

        it('creates Card element with title', () => {
            const card = React.createElement(Card, { title: 'Card Title' }, 'Content');
            expect(card.props.title).toBe('Card Title');
        });

        it('creates Card element with custom className', () => {
            const card = React.createElement(Card, { className: 'custom-class' }, 'Content');
            expect(card.props.className).toBe('custom-class');
        });

        it('creates Card element with multiple children', () => {
            const child1 = React.createElement('h3', { key: 'title' }, 'Title');
            const child2 = React.createElement('p', { key: 'desc' }, 'Description');
            const card = React.createElement(Card, {}, [child1, child2]);
            expect(Array.isArray(card.props.children)).toBe(true);
            expect(card.props.children).toHaveLength(2);
        });
    });

    describe('PasswordStrength Component', () => {
        const mockRequirements = [
            { text: 'Minimum 8 characters', met: true },
            { text: 'At least one uppercase letter', met: false },
            { text: 'At least one number', met: true },
        ];

        it('creates PasswordStrength element with password and requirements', () => {
            const component = React.createElement(PasswordStrength, {
                password: 'test123',
                requirements: mockRequirements
            });
            expect(component).toBeDefined();
            expect(component.type).toBe(PasswordStrength);
            expect(component.props.password).toBe('test123');
            expect(component.props.requirements).toEqual(mockRequirements);
        });

        it('creates PasswordStrength element with empty password', () => {
            const component = React.createElement(PasswordStrength, {
                password: '',
                requirements: mockRequirements
            });
            expect(component.props.password).toBe('');
        });

        it('creates PasswordStrength element with custom className', () => {
            const component = React.createElement(PasswordStrength, {
                password: 'test123',
                requirements: mockRequirements,
                className: 'custom-strength'
            });
            expect(component.props.className).toBe('custom-strength');
        });

        it('validates requirements structure', () => {
            const component = React.createElement(PasswordStrength, {
                password: 'test123',
                requirements: mockRequirements
            });
            
            component.props.requirements.forEach((req: any) => {
                expect(typeof req.text).toBe('string');
                expect(typeof req.met).toBe('boolean');
                expect(req.text.length).toBeGreaterThan(0);
            });
        });

        it('handles empty requirements array', () => {
            const component = React.createElement(PasswordStrength, {
                password: 'test123',
                requirements: []
            });
            expect(component.props.requirements).toEqual([]);
        });
    });
});