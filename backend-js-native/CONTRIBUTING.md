# Contributing to IQ Test Platform

Thank you for your interest in contributing to the IQ Test Platform! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- Redis 7.0 or higher
- npm 9.0.0 or higher
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/iq-test-platform.git
   cd iq-test-platform
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/iq-test-platform.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
cd backend-js-native
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb iq_test_platform

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: Fix existing issues
- **Feature additions**: Add new functionality
- **Documentation**: Improve documentation
- **Testing**: Add or improve tests
- **Performance**: Optimize performance
- **Security**: Improve security
- **Refactoring**: Improve code quality

### Before You Start

1. **Check existing issues**: Look for existing issues or discussions
2. **Create an issue**: For significant changes, create an issue first
3. **Discuss**: Engage in discussion before starting work
4. **Get approval**: Get maintainer approval for major changes

### Development Workflow

1. **Create a branch**: Create a feature branch from `develop`
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**: Implement your changes
3. **Test**: Ensure all tests pass
4. **Commit**: Make clear, descriptive commits
5. **Push**: Push your branch to your fork
6. **Pull Request**: Create a pull request

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] All tests pass
- [ ] Code is properly documented
- [ ] No console.log statements in production code
- [ ] Security considerations are addressed
- [ ] Performance impact is considered

### Pull Request Template

When creating a pull request, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues
Closes #issue-number
```

### Review Process

1. **Automated checks**: CI/CD pipeline runs automatically
2. **Code review**: Maintainers review the code
3. **Testing**: Additional testing if needed
4. **Approval**: Maintainer approval required
5. **Merge**: Changes are merged to develop

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps to reproduce
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node.js version, etc.
- **Screenshots**: If applicable

### Feature Requests

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use case**: Why this feature is needed
- **Proposed solution**: How you think it should work
- **Alternatives**: Other solutions considered

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable and function names
- Write self-documenting code
- Use const/let instead of var
- Use arrow functions where appropriate
- Use async/await instead of callbacks

### Code Style

- 2 spaces for indentation
- Single quotes for strings
- Semicolons at end of statements
- Trailing commas in objects/arrays
- Max line length: 100 characters
- Use Prettier for formatting

### File Organization

- Use descriptive file names
- Group related functionality
- Keep files focused and small
- Use consistent naming conventions
- Organize imports logically

### Comments and Documentation

- Write clear, concise comments
- Document complex logic
- Use JSDoc for functions
- Keep README files updated
- Document API changes

## Testing

### Test Types

- **Unit tests**: Test individual functions/modules
- **Integration tests**: Test component interactions
- **End-to-end tests**: Test complete workflows
- **Performance tests**: Test performance characteristics

### Writing Tests

- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies
- Use test utilities and helpers

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Documentation

### Types of Documentation

- **README**: Project overview and setup
- **API Documentation**: API endpoints and schemas
- **Code Comments**: Inline code documentation
- **Architecture**: System design and architecture
- **Deployment**: Deployment and operations guide

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use consistent formatting
- Include screenshots when helpful
- Link to related documentation

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update version**: Update package.json version
2. **Update changelog**: Update CHANGELOG.md
3. **Create release branch**: Create release branch from develop
4. **Testing**: Run full test suite
5. **Create pull request**: Create PR to main
6. **Review**: Code review and approval
7. **Merge**: Merge to main
8. **Tag**: Create git tag
9. **Deploy**: Deploy to production
10. **Announce**: Announce release

## Getting Help

### Resources

- **Documentation**: Check the README and docs
- **Issues**: Search existing issues
- **Discussions**: Use GitHub discussions
- **Community**: Join our community channels

### Contact

- **Maintainers**: @maintainer-username
- **Email**: maintainers@iqtest.com
- **Discord**: [Join our Discord](https://discord.gg/iqtest)

## Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md**: List of all contributors
- **Release notes**: Mentioned in release notes
- **GitHub**: Listed as contributors
- **Documentation**: Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Thank You

Thank you for contributing to the IQ Test Platform! Your contributions help make this project better for everyone.

---

**Happy Contributing! 🚀**
