<div align="center">
<h1>🚀 RepoIntel - AI-Powered GitHub Repository Analyzer</h1>
<p><strong>Intelligent code analysis, quality metrics, and smart suggestions powered by AI</strong></p>
</div>

## 📋 Overview

**RepoIntel** is a comprehensive GitHub repository analysis tool that leverages AI to provide deep insights into code quality, architecture, security, and maintainability. Perfect for code reviews, student assignment evaluation, repository comparison, and open-source contribution discovery.

### ✨ Key Features

#### 🎯 **Core Analysis**
- **Repository Overview**: Comprehensive metrics including stars, forks, watchers, and activity trends
- **Code Quality Scoring**: Readability, modularity, testability, documentation, and architecture metrics (1-10 scale)
- **AI-Powered Insights**: Strengths and weaknesses analysis using Google Gemini AI
- **Maintainability Dashboard**: Detailed code health, test coverage, and complexity analysis

#### 🔐 **Security & Quality**
- **Security Scanning**: 7-point vulnerability check including dependency audits, authentication, and best practices
- **Health Score**: Weighted metric combining code quality, security, maintenance, documentation, testing, activity, and community
- **Smart Suggestions**: AI-generated code improvement recommendations with code examples
- **Architecture Analysis**: Evaluates system design and structural quality

#### 🔍 **Repository Discovery**
- **Trending Repositories**: Find popular repos by language with 1000+ stars updated in last 7 days
- **Repository Search**: Full GitHub repo search with trending filters
- **Language Selection**: Filter trending repos by programming language

#### 🧮 **Advanced Comparisons**
- **Repository Comparison**: Compare two repos based on **coding techniques** (not popularity)
- **Architecture Comparison**: Best architecture, logic structure, testability metrics
- **Code Quality Winners**: Identify which repo has better code practices

#### 💼 **Issue Management**
- **Smart Issue Filtering**: Filter by programming languages (JavaScript, Python, Java, etc.)
- **Difficulty Classification**: Easy, Medium, Hard issue categorization
- **Multi-filter Support**: Combine language + difficulty + GitHub labels
- **Contribution Discovery**: Find issues you can solve based on your skills

#### 🎨 **User Experience**
- **Interactive Dashboards**: 5 visual analysis dashboards with charts and metrics
- **Dark/Light Mode**: Theme toggle for comfortable viewing
- **AI Chatbot**: Ask repository-specific questions in real-time
- **PDF Export**: Download comprehensive analysis reports
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4.1 |
| **Build Tool** | Vite 6.4.2 |
| **AI Engine** | Google Gemini 3 Flash API |
| **Data Viz** | Recharts 3.8.1 |
| **Icons** | Lucide React |
| **PDF Export** | jsPDF + html2canvas |
| **API** | GitHub REST API v3 |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (with npm)
- **GitHub Token** (optional, for higher rate limits) - [Get token](https://github.com/settings/tokens)
- **Google Gemini API Key** - [Get free key](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/repointel.git
   cd repointel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** - Create `.env.local`:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GITHUB_TOKEN=your_github_token_here  # Optional but recommended
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📊 Features in Detail

### 1️⃣ **Repository Analysis**
- Analyzes repository metadata, languages, README, and GitHub issues
- Generates 5 complexity scores using AI analysis
- Identifies code strengths and improvement areas
- Estimates maintainability and code health

### 2️⃣ **Dashboard Views**

| Dashboard | Purpose |
|-----------|---------|
| **Overview** | Repository stats, language distribution, activity trends |
| **Code Analysis** | Complexity scores, radar charts, improvement guide |
| **Security** | Vulnerability scan, issue severity, recommendations |
| **Health Score** | Overall repo health with weighted metrics |
| **Smart Suggestions** | AI code improvement ideas with examples |
| **Maintainability** | Detailed code health, test coverage, metrics |
| **Issue Tracker** | Filter issues by language, difficulty, and labels |
| **Settings** | Dark/Light theme toggle |

### 3️⃣ **Issue Filtering**
Users can find issues to solve based on:
- **Programming Languages**: JavaScript, Python, Java, C++, Go, Rust, etc.
- **Difficulty Level**: Easy, Medium, Hard
- **GitHub Labels**: Any label from the repository
- **Combinations**: E.g., "Easy JavaScript issues"

### 4️⃣ **Repository Comparison**
Compare two repositories on:
- **Architecture Quality** - System design scores
- **Code Logic** - Modularity and code organization
- **Testability** - How well code can be tested
- **Documentation** - Code comment and documentation quality
- **Overall Code Quality** - Composite score
- **AI Strengths/Weaknesses** - From AI analysis

---

## 🎯 Use Cases

### 👨‍💼 **For Code Reviews**
- Analyze PRs and suggest improvements before merging
- Identify security issues and code quality problems
- Compare approaches between team members

### 🎓 **For Student Assignments**
- Compare student submissions objectively
- Identify coding practices and techniques used
- Provide AI-powered feedback on code quality

### 🔍 **For Open Source Contribution**
- Find issues matching your skill level and language
- Discover trending projects in your tech stack
- Understand codebase quality before contributing

### 📈 **For Project Management**
- Track codebase health over time
- Identify technical debt areas
- Monitor maintainability and complexity trends

---

## 🔄 API Integration

### GitHub API
- **Endpoints Used**: `/repos`, `/repos/.../languages`, `/repos/.../contents`, `/repos/.../readme`, `/repos/.../issues`
- **Rate Limits**: 60 req/hour (unauthenticated), 5000 req/hour (authenticated with token)
- **Error Handling**: Graceful fallback for rate limits and 404 errors

### Google Gemini API
- **Model**: gemini-3-flash-preview
- **Uses**: Repository analysis, smart suggestions, chatbot Q&A
- **Response Format**: Structured JSON with schema validation

---

## 📁 Project Structure

```
src/
├── components/
│   ├── CodeAnalysisDashboard.tsx    # Code quality metrics
│   ├── HealthScoreDashboard.tsx     # Overall health assessment
│   ├── MaintainabilityDashboard.tsx # Detailed maintainability metrics
│   ├── OverviewDashboard.tsx        # Repository overview
│   ├── SecurityDashboard.tsx        # Security scanning results
│   ├── SmartSuggestionsPanel.tsx    # AI code suggestions
│   ├── RepositoryComparison.tsx     # Compare two repos
│   ├── SearchAndTrending.tsx        # Search & discover repos
│   └── Chatbot.tsx                  # AI Q&A
├── services/
│   ├── github.ts                    # GitHub API integration
│   ├── gemini.ts                    # AI analysis & suggestions
│   ├── security.ts                  # Security scanning
│   ├── health.ts                    # Health score calculation
│   ├── pdf.ts                       # PDF export
│   └── search.ts                    # Search & trending
├── lib/
│   └── utils.ts                     # Utility functions
├── App.tsx                          # Main app component
├── main.tsx                         # Entry point
└── index.css                        # Global styles
```

---

## 🎨 UI/UX Features

- ✅ **Dark/Light Mode**: Full theme support with CSS variables
- ✅ **Responsive Design**: Mobile, tablet, desktop layouts
- ✅ **Loading States**: Spinners and progress indicators
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Tooltips**: Hover information for all buttons
- ✅ **Keyboard Navigation**: Full accessibility support
- ✅ **Empty States**: Clear messages when no data available

---

## 🔒 Security

- ✅ **API Key Protection**: Keys in `.env.local`, never committed
- ✅ **No Backend Required**: Client-side only (browser-based)
- ✅ **CORS Friendly**: Works with GitHub public APIs
- ✅ **Safe Error Messages**: No sensitive info in error text
- ✅ **Token Optional**: Works without GitHub token

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Build Size | ~1.7MB (minified) |
| CSS Gzipped | 8.2 kB |
| JS Gzipped | 53.5 kB |
| Load Time | < 2s (typical) |
| Modules | 2594 transformed |

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Deploy to GitHub Pages
```bash
npm run build
# Upload dist/ folder to GitHub Pages
```

---

## 📝 Environment Variables

```env
# Required for AI features
VITE_GEMINI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# Optional (recommended for higher rate limits)
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx

# Optional (for custom domain)
VITE_APP_URL=https://yourdomain.com
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful code analysis
- **GitHub API** for repository data
- **React & Vite** for excellent development experience
- **Tailwind CSS** for beautiful styling
- **Recharts** for stunning visualizations

---

## 📞 Support

- 📧 Email: support@repointel.dev
- 🐛 Report Issues: [GitHub Issues](https://github.com/yourusername/repointel/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/repointel/discussions)

---

<div align="center">
  <strong>Made with ❤️ for developers, by developers</strong><br>
  <sub>Analyzing code. Improving quality. Empowering developers.</sub>
</div>
