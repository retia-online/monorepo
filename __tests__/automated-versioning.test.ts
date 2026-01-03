/**
 * Property-based tests for automated versioning functionality
 * **Feature: external-sdk-transformation, Property 8: Automated Version Increment**
 * **Validates: Requirements 5.2**
 */

import fc from 'fast-check';

// Mock semantic-release functionality for testing
interface CommitMessage {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breaking?: boolean;
}

interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
}

// Utility functions for version management
function parseVersion(version: string): VersionInfo {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

function formatVersion(version: VersionInfo): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function parseCommitMessage(message: string): CommitMessage {
  const lines = message.split('\n');
  const firstLine = lines[0];
  const conventionalCommitRegex = /^(\w+)(?:\(([^)]*)\))?(!?): (.*)$/;
  const match = firstLine.match(conventionalCommitRegex);
  
  if (!match) {
    return { type: 'unknown', subject: message };
  }
  
  const [, type, scope, exclamation, subject] = match;
  const breaking = exclamation === '!' || message.includes('BREAKING CHANGE');
  
  return {
    type,
    scope: scope || undefined,
    subject,
    breaking
  };
}

function calculateNextVersion(currentVersion: VersionInfo, commit: CommitMessage): VersionInfo {
  const nextVersion = { ...currentVersion };
  
  if (commit.breaking) {
    nextVersion.major += 1;
    nextVersion.minor = 0;
    nextVersion.patch = 0;
  } else if (commit.type === 'feat') {
    nextVersion.minor += 1;
    nextVersion.patch = 0;
  } else if (commit.type === 'fix') {
    nextVersion.patch += 1;
  }
  // For other types (docs, style, refactor, test, chore), no version increment
  
  return nextVersion;
}

describe('Automated Version Increment Property Tests', () => {
  describe('Property 8: Automated Version Increment', () => {
    it('should increment major version for breaking changes', () => {
      // **Feature: external-sdk-transformation, Property 8: Automated Version Increment**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes(')') && !s.includes(' ')), { nil: undefined }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (currentVersion, scope, subject) => {
          const breakingCommitMessage = `feat${scope ? `(${scope})` : ''}!: ${subject}`;
          const commit = parseCommitMessage(breakingCommitMessage);
          const nextVersion = calculateNextVersion(currentVersion, commit);
          
          // For any breaking change, major version should increment and minor/patch should reset
          expect(nextVersion.major).toBe(currentVersion.major + 1);
          expect(nextVersion.minor).toBe(0);
          expect(nextVersion.patch).toBe(0);
        }
      ), { numRuns: 100 });
    });

    it('should increment minor version for feature commits', () => {
      // **Feature: external-sdk-transformation, Property 8: Automated Version Increment**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes(')') && !s.includes(' ')), { nil: undefined }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (currentVersion, scope, subject) => {
          const featCommitMessage = `feat${scope ? `(${scope})` : ''}: ${subject}`;
          const commit = parseCommitMessage(featCommitMessage);
          const nextVersion = calculateNextVersion(currentVersion, commit);
          
          // For any feature commit (non-breaking), minor version should increment and patch should reset
          expect(nextVersion.major).toBe(currentVersion.major);
          expect(nextVersion.minor).toBe(currentVersion.minor + 1);
          expect(nextVersion.patch).toBe(0);
        }
      ), { numRuns: 100 });
    });

    it('should increment patch version for fix commits', () => {
      // **Feature: external-sdk-transformation, Property 8: Automated Version Increment**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes(')') && !s.includes(' ')), { nil: undefined }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (currentVersion, scope, subject) => {
          const fixCommitMessage = `fix${scope ? `(${scope})` : ''}: ${subject}`;
          const commit = parseCommitMessage(fixCommitMessage);
          const nextVersion = calculateNextVersion(currentVersion, commit);
          
          // For any fix commit, only patch version should increment
          expect(nextVersion.major).toBe(currentVersion.major);
          expect(nextVersion.minor).toBe(currentVersion.minor);
          expect(nextVersion.patch).toBe(currentVersion.patch + 1);
        }
      ), { numRuns: 100 });
    });

    it('should not increment version for non-release commit types', () => {
      // **Feature: external-sdk-transformation, Property 8: Automated Version Increment**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.constantFrom('docs', 'style', 'refactor', 'test', 'chore'),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (currentVersion, commitType, scope, subject) => {
          const nonReleaseCommitMessage = `${commitType}${scope ? `(${scope})` : ''}: ${subject}`;
          const commit = parseCommitMessage(nonReleaseCommitMessage);
          const nextVersion = calculateNextVersion(currentVersion, commit);
          
          // For any non-release commit type, version should remain unchanged
          expect(nextVersion.major).toBe(currentVersion.major);
          expect(nextVersion.minor).toBe(currentVersion.minor);
          expect(nextVersion.patch).toBe(currentVersion.patch);
        }
      ), { numRuns: 100 });
    });

    it('should maintain semantic versioning format after any increment', () => {
      // **Feature: external-sdk-transformation, Property 8: Automated Version Increment**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.constantFrom('feat', 'fix', 'feat!', 'docs', 'style', 'refactor', 'test', 'chore'),
        fc.string({ minLength: 1, maxLength: 100 }),
        (currentVersion, commitType, subject) => {
          const commitMessage = `${commitType}: ${subject}`;
          const commit = parseCommitMessage(commitMessage);
          const nextVersion = calculateNextVersion(currentVersion, commit);
          const versionString = formatVersion(nextVersion);
          
          // For any version increment, the result should follow semantic versioning format
          const semverRegex = /^\d+\.\d+\.\d+$/;
          expect(versionString).toMatch(semverRegex);
          
          // Version components should be non-negative integers
          expect(nextVersion.major).toBeGreaterThanOrEqual(0);
          expect(nextVersion.minor).toBeGreaterThanOrEqual(0);
          expect(nextVersion.patch).toBeGreaterThanOrEqual(0);
          
          // Version should be parseable back to the same components
          const parsedBack = parseVersion(versionString);
          expect(parsedBack).toEqual(nextVersion);
        }
      ), { numRuns: 100 });
    });

    it('should handle breaking change indicators correctly', () => {
      // **Feature: external-sdk-transformation, Property 8: Automated Version Increment**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.constantFrom('feat', 'fix', 'refactor'),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (currentVersion, commitType, subject) => {
          // Test both breaking change indicators
          const breakingCommitMessage1 = `${commitType}!: ${subject}`;
          const breakingCommitMessage2 = `${commitType}: ${subject}\n\nBREAKING CHANGE: ${subject}`;
          
          const commit1 = parseCommitMessage(breakingCommitMessage1);
          const commit2 = parseCommitMessage(breakingCommitMessage2);
          
          const nextVersion1 = calculateNextVersion(currentVersion, commit1);
          const nextVersion2 = calculateNextVersion(currentVersion, commit2);
          
          // For any commit with breaking change indicators, major version should increment
          expect(nextVersion1.major).toBe(currentVersion.major + 1);
          expect(nextVersion1.minor).toBe(0);
          expect(nextVersion1.patch).toBe(0);
          
          expect(nextVersion2.major).toBe(currentVersion.major + 1);
          expect(nextVersion2.minor).toBe(0);
          expect(nextVersion2.patch).toBe(0);
        }
      ), { numRuns: 100 });
    });

    it('should preserve version ordering after increments', () => {
      // **Feature: external-sdk-transformation, Property 8: Automated Version Increment**
      fc.assert(fc.property(
        fc.record({
          major: fc.integer({ min: 0, max: 99 }),
          minor: fc.integer({ min: 0, max: 99 }),
          patch: fc.integer({ min: 0, max: 99 })
        }),
        fc.constantFrom('feat', 'fix', 'feat!'),
        fc.string({ minLength: 1, maxLength: 100 }),
        (currentVersion, commitType, subject) => {
          const commitMessage = `${commitType}: ${subject}`;
          const commit = parseCommitMessage(commitMessage);
          const nextVersion = calculateNextVersion(currentVersion, commit);
          
          // For any version increment, the new version should be greater than the current version
          const currentVersionNumber = currentVersion.major * 10000 + currentVersion.minor * 100 + currentVersion.patch;
          const nextVersionNumber = nextVersion.major * 10000 + nextVersion.minor * 100 + nextVersion.patch;
          
          if (commit.type === 'feat' || commit.type === 'fix' || commit.breaking) {
            expect(nextVersionNumber).toBeGreaterThan(currentVersionNumber);
          } else {
            expect(nextVersionNumber).toBe(currentVersionNumber);
          }
        }
      ), { numRuns: 100 });
    });
  });

  describe('Commit Message Parsing', () => {
    it('should correctly parse conventional commit messages', () => {
      fc.assert(fc.property(
        fc.constantFrom('feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes(')') && !s.includes(' ')), { nil: undefined }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (type, scope, subject) => {
          const commitMessage = `${type}${scope ? `(${scope})` : ''}: ${subject}`;
          const parsed = parseCommitMessage(commitMessage);
          
          expect(parsed.type).toBe(type);
          expect(parsed.scope).toBe(scope);
          expect(parsed.subject).toBe(subject);
        }
      ), { numRuns: 100 });
    });
  });
});