module.exports = {
    roots: ['<rootDir>/__test__'], // Points to the correct folder
    testMatch: ['**/*.test.ts'], // Match all .test.ts files
    testEnvironment: 'node', // Use Node.js environment
    transform: {
      '^.+\\.tsx?$': 'ts-jest', // Use ts-jest for TypeScript files
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // Recognize these file extensions
  };
  