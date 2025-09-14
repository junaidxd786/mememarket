# 📈 r/MemeMarket - Reddit's Viral Prediction Exchange

> **Fun and Games with Devvit Web Hackathon Submission**
>
> *A real-time prediction market where users bet fake "MemeCoins" on which Reddit posts will go viral next*

![r/MemeMarket Banner](https://img.shields.io/badge/Reddit-Hackathon-orange) ![Devvit Web](https://img.shields.io/badge/Devvit-Web-blue) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)

## 🎮 Game Overview

**r/MemeMarket** transforms Reddit into a thrilling prediction marketplace where users bet virtual MemeCoins on which posts will become the next viral sensations. Combining the excitement of stock trading with Reddit's meme culture, players browse trending posts, analyze engagement metrics, and place strategic bets on future viral success.

### 🎯 Core Concept
- **Browse** trending Reddit posts with real-time market data
- **Bet** MemeCoins on posts reaching specific engagement milestones
- **Watch** prices fluctuate based on actual Reddit activity
- **Win** coins from successful predictions and climb leaderboards
- **Unlock** achievements and level up your trading skills

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Reddit Developer Account
- Devvit CLI (for deployment)

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd mememarket

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Devvit Web Deployment

```bash
# Install Devvit CLI
npm install -g @devvit/cli

# Login to Reddit
devvit login

# Deploy to Reddit
npm run devvit:deploy

# Create test subreddit (replace with your subreddit)
devvit install <your-test-subreddit>
```

## 🎲 How to Play

### 1. **Explore the Market**
- Browse trending posts from across Reddit
- View real-time price charts and market indicators
- Analyze engagement metrics (upvotes, comments, subreddit)

### 2. **Place Your Bets**
- Choose prediction type: Upvotes, Comments, or Viral status
- Set target values and bet amounts
- Calculate odds based on current market conditions
- Confirm your prediction

### 3. **Track Performance**
- Monitor your portfolio in real-time
- View prediction history and win/loss ratios
- Watch market sectors rotate daily
- Unlock achievements and level up

### 4. **Climb Leaderboards**
- Compete with other traders globally
- Complete weekly challenges
- Show off your trading skills
- Win bragging rights and exclusive badges

## 🎨 Game Features

### ✨ Core Mechanics
- **Real-time Market Updates**: Prices update every 30 seconds based on Reddit activity
- **Dynamic Sector Rotation**: Daily focus on different meme categories (Cats, Politics, Gaming, etc.)
- **IPO System**: Users can submit their own posts for trading
- **Market Events**: Random crashes and booms for added excitement
- **Achievement System**: 10+ unlockable achievements with rarity levels

### 🎯 Prediction Types
- **⬆️ Upvotes**: Predict final upvote count
- **💬 Comments**: Predict comment engagement
- **🚀 Viral**: Predict if post reaches viral threshold

### 🏆 Leaderboards & Challenges
- Global rankings by portfolio value
- Win rate competitions
- Weekly trading challenges
- Achievement showcases

## 🛠️ Technical Implementation

### Architecture
```
src/
├── components/          # React components
│   ├── Market/         # Trading interface
│   ├── Game/          # Portfolio, Leaderboards, Achievements
│   └── Reddit/        # Reddit integration components
├── services/           # Business logic
│   ├── MarketEngine.ts # Price calculations & predictions
│   ├── RedditAPI.ts   # Reddit data integration
│   └── WebSocketService.ts # Real-time updates
├── hooks/             # Custom React hooks
├── utils/             # Helper functions & constants
└── types/             # TypeScript definitions
```

### Tech Stack
- **Frontend**: React 18.2.0 + TypeScript 5.2.2
- **UI Framework**: Tailwind CSS 3.3.0
- **Animations**: Framer Motion 10.16.0
- **Charts**: Chart.js 4.4.0 + React-ChartJS-2
- **Game Engine**: Phaser.js 3.70.0
- **Build Tool**: Vite 4.5.0
- **Deployment**: Devvit Web Platform

### Key Features
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-time Updates**: WebSocket integration for live market data
- **Performance Optimized**: Lazy loading, code splitting, and caching
- **Accessibility**: Screen reader support and keyboard navigation
- **Progressive Web App**: Installable and offline-capable

## 🎭 Reddit Integration

### Devvit Web Features Used
- **Interactive Posts**: Rich post interactions with betting UI
- **Real-time Data**: Live Reddit API integration
- **User Authentication**: Reddit account integration
- **Community Features**: Subreddit-specific market data
- **Cross-platform**: Works on web, mobile web, and Reddit apps

### API Endpoints
- `/api/trending` - Fetch trending posts
- `/api/market-data` - Get real-time market data
- `/api/predictions` - Place and track predictions
- `/api/portfolio` - User portfolio management
- `/api/leaderboard` - Global rankings

## 📊 Hackathon Requirements Met

### ✅ **Category Fit: UGC + Daily Content**
- **UGC**: User-submitted posts become IPOs for trading
- **Daily**: Fresh market sectors, rotating content, daily challenges
- **Hybrid**: Perfect balance of user-generated and algorithmic content

### ✅ **Delightful UX**
- Smooth animations and micro-interactions
- Intuitive trading interface
- Real-time feedback and notifications
- Mobile-optimized experience

### ✅ **Polish & Quality**
- Professional UI with glassmorphism effects
- Comprehensive error handling
- Loading states and empty states
- Performance optimized for 60fps

### ✅ **Reddit-y Appeal**
- Meme culture integration
- Community-driven content
- Viral sharing mechanics
- Reddit humor and aesthetics

## 🚀 Deployment & Demo

### Live Demo
**Demo Subreddit**: [r/MemeMarketDemo](https://reddit.com/r/MemeMarketDemo)
**App Link**: [developers.reddit.com/apps/mememarket](https://developers.reddit.com/apps/mememarket)

### Demo Video
📹 **1-minute walkthrough**: [Demo Video Link](https://youtube.com/watch?v=demo-link)

*Demo script:*
1. **Introduction** (0:00-0:10): "Welcome to r/MemeMarket, Reddit's viral prediction exchange!"
2. **Market Exploration** (0:10-0:25): "Browse trending posts and view real-time market data"
3. **Placing Bets** (0:25-0:40): "Place strategic bets on post success"
4. **Portfolio Tracking** (0:40-0:50): "Monitor your portfolio and achievements"
5. **Community Features** (0:50-1:00): "Compete on leaderboards and unlock achievements"

## 👥 Team & Credits

### Developer
- **Lead Developer**: [Your Reddit Username]
- **Role**: Full-stack game development, market engine design
- **Experience**: React, TypeScript, game development, financial systems

### Assets & Resources
- **Icons**: Lucide React, custom SVG illustrations
- **Sounds**: Free sound effects (placeholder)
- **Fonts**: Inter font family (Google Fonts)
- **Colors**: Reddit brand colors with custom gradients

## 📈 Future Enhancements

### Phase 2 Features
- **Advanced Trading**: Options, futures, and derivative contracts
- **Social Features**: Trading guilds, mentorship programs
- **Premium Content**: Exclusive market insights and tools
- **Mobile App**: Native iOS/Android companion apps

### Monetization Potential
- **Reddit Payments**: Premium features, cosmetic items
- **Market Fees**: Small transaction fees for advanced features
- **Advertising**: Sponsored market sectors and challenges
- **Merchandise**: Official r/MemeMarket merchandise

## 📝 License & Legal

### Devvit Rules Compliance
- ✅ No gambling mechanics (virtual currency only)
- ✅ Age-appropriate content and themes
- ✅ Community guidelines adherence
- ✅ Fair play and anti-cheat measures
- ✅ Data privacy and user consent

### Open Source
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork the repository
# Clone your fork
git clone https://github.com/your-username/mememarket.git

# Create feature branch
git checkout -b feature/amazing-enhancement

# Make changes and test
npm run dev

# Submit pull request
```

## 📞 Support & Contact

- **Discord Community**: [Join our Discord](https://discord.gg/mememarket)
- **Reddit**: [r/MemeMarket](https://reddit.com/r/MemeMarket)
- **Email**: mememarket@reddit.dev
- **Issues**: [GitHub Issues](https://github.com/your-username/mememarket/issues)

## 🏆 Hackathon Goals

### Primary Objectives
- **Win UGC Category**: Maximize user-generated content through IPO system
- **Daily Engagement**: Daily sector rotation and recurring challenges
- **Viral Potential**: Shareable predictions and market events
- **Community Building**: Leaderboards, achievements, and social features

### Success Metrics
- **User Engagement**: Daily active users and session duration
- **Prediction Accuracy**: Community win rates and market efficiency
- **Social Sharing**: Viral coefficient and subreddit growth
- **Technical Performance**: Load times, crash rates, and user satisfaction

---

**Built with ❤️ for Reddit's Devvit Web Hackathon 2025**

*Transforming Reddit into the world's most engaging prediction market, one meme at a time!* 🚀📈

---

## 🔗 Links

- [Live Demo](https://reddit.com/r/MemeMarketDemo)
- [Devvit App](https://developers.reddit.com/apps/mememarket)
- [Demo Video](https://youtube.com/watch?v=demo-link)
- [GitHub Repository](https://github.com/your-username/mememarket)
- [Project Documentation](https://mememarket.dev/docs)
