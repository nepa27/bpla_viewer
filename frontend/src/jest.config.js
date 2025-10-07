const config = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  //setUpFilesAfterEnv: ['<rootDir>/internal/jest.setup.js'],
  moduleFileExtensions: ['js', 'jsx'],
};

export default config