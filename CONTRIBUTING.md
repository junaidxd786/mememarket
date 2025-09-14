# 🤝 Contributing to r/MemeMarket

Thank you for your interest in contributing to r/MemeMarket! This document provides guidelines and information for contributors.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Reddit Developer Account (for testing)

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/mememarket.git
cd mememarket

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

## 📋 Contribution Guidelines

### Code Style
- **TypeScript**: Strict typing required
- **ESLint**: Follow provided linting rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Use semantic commit messages

### Branch Naming
```
feature/add-new-prediction-type
bugfix/fix-market-calculation
docs/update-readme
refactor/cleanup-market-engine
```

### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
2. **Make Changes**: Implement your feature or fix
3. **Run Tests**: Ensure all tests pass
4. **Update Documentation**: Update README/docs if needed
5. **Commit Changes**: Use conventional commit format
6. **Push Branch**: `git push origin feature/amazing-feature`
7. **Create PR**: Open pull request with detailed description

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

## 🛠️ Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 🎮 Feature Development

### Adding New Prediction Types
1. Update `src/types/index.ts` with new prediction type
2. Add to `src/utils/constants.ts` PREDICTION_TYPES
3. Implement logic in `src/services/MarketEngine.ts`
4. Update UI components for new type
5. Add tests for new functionality

### Market Engine Modifications
- All market calculations in `MarketEngine.ts`
- Real-time updates every 30 seconds
- Volatility and trend calculations
- Price normalization and bounds checking

### UI Component Guidelines
- Use TypeScript for all components
- Implement responsive design (mobile-first)
- Follow existing design patterns
- Add proper loading states
- Include error boundaries

## 🧪 Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Component logic (where applicable)

### Integration Tests
- API service interactions
- Component integration
- User workflows

### E2E Tests
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness

## 📚 Documentation

### Code Documentation
- Use JSDoc comments for complex functions
- Document component props and state
- Explain business logic decisions
- Include usage examples

### README Updates
- Update feature descriptions
- Add new screenshots/videos
- Update setup instructions
- Document breaking changes

## 🚨 Issue Reporting

### Bug Reports
Please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Screenshots (if applicable)

### Feature Requests
Please include:
- Use case description
- Proposed implementation
- Benefits and impact
- Mockups or examples (if applicable)

## 🎯 Code Review Process

### Review Checklist
- [ ] Code follows TypeScript best practices
- [ ] Proper error handling implemented
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] Performance considerations addressed
- [ ] Security implications reviewed
- [ ] Mobile responsiveness verified

### Review Comments
- Be constructive and specific
- Suggest improvements, don't just point out issues
- Reference existing patterns in codebase
- Consider user impact of changes

## 🌟 Recognition

Contributors will be:
- Listed in README contributors section
- Mentioned in release notes
- Eligible for Reddit Developer swag
- Considered for future collaboration opportunities

## 📞 Getting Help

- **Discord**: Join our community Discord
- **GitHub Issues**: For bugs and feature requests
- **Reddit**: r/MemeMarket subreddit
- **Email**: mememarket@reddit.dev

## 📜 Code of Conduct

This project follows Reddit's Community Guidelines and Developer Terms of Service. All contributors must:

- Be respectful and inclusive
- Follow ethical development practices
- Respect user privacy and data
- Comply with Devvit platform rules
- Contribute positively to the community

---

Thank you for contributing to r/MemeMarket! 🎮🚀
