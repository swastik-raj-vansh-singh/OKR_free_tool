# 🎯 OKR Autopilot

**Free AI-Powered OKR Tool** that creates alignment and weekly accountability across your team with zero overhead.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Powered by Lamatic](https://img.shields.io/badge/Powered%20by-Lamatic-DC2626?style=flat-square)](https://lamatic.ai/)

---

## ✨ Features

### 🤖 AI-Powered OKR Generation
- **Automatic company research** - Just enter your website URL
- **Intelligent OKR creation** - AI analyzes your business context and generates strategic objectives
- **Strategic narrative editing** - Refine your strategy and regenerate OKRs on-the-fly
- **Role-based customization** - Personalized OKRs for different team roles

### 👥 Team Collaboration
- **Smart team invitations** - Send personalized invite emails with draft OKRs
- **Personal messages** - Add custom notes to each team member
- **Automated OKR alignment** - Team member OKRs automatically align with leadership goals
- **Progress tracking** - Visual dashboard to monitor team progress
- **Scheduled reminders** - Automatic weekly emails to keep everyone accountable

### 📊 Export & Share
Export your OKRs in multiple formats:
- **Markdown** - Perfect for documentation
- **CSV** - Import into spreadsheets
- **JSON** - Developer-friendly format
- **PDF** - Coming soon

### 🎨 Beautiful UI/UX
- **5 stunning themes** - Red Energy, Ocean Blue, Forest Green, Sunset Orange, Lavender Purple
- **Smooth animations** - Professional transitions and loading states
- **Custom SVG icons** - Clean, modern design throughout
- **Responsive design** - Works perfectly on all devices
- **Dark mode** - Easy on the eyes

### 📚 Educational Resources
- **Comprehensive help section** - Learn OKR best practices
- **Interactive tutorials** - Step-by-step guidance
- **Real examples** - See what good OKRs look like
- **Common pitfalls** - Avoid mistakes before you make them

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Lamatic account** (free at [lamatic.ai](https://lamatic.ai/))

### Installation

```bash
# Clone the repository
git clone https://github.com/swastik-raj-vansh-singh/OKR-the-FreeTool.git

# Navigate to project directory
cd OKR-the-FreeTool

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Lamatic API credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library with Server Components |
| **TypeScript** | Type safety and better DX |
| **Tailwind CSS 4** | Utility-first styling with oklch colors |
| **Radix UI** | Accessible component primitives |
| **Lamatic AI** | AI workflow orchestration platform |
| **Supabase** | Database and authentication |
| **Vercel** | Deployment and hosting |

---

## 📂 Project Structure

```
OKR-the-FreeTool/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/
│   ├── okr/                 # OKR-specific components
│   │   ├── okr-wizard.tsx   # Main wizard component
│   │   ├── screen-1-kickoff.tsx      # OKR generation screen
│   │   ├── screen-2-edit-invite.tsx  # Team invitation screen
│   │   ├── screen-3-workspace.tsx    # Progress tracking
│   │   ├── screen-4-dashboard.tsx    # Analytics dashboard
│   │   ├── app-header.tsx   # Navigation with themes
│   │   └── loading-with-facts.tsx    # Loading animations
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── lamatic-api.ts       # Lamatic workflow integration
│   ├── okr-context.tsx      # Global state management
│   └── types.ts             # TypeScript definitions
└── public/                  # Static assets
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Lamatic Configuration
NEXT_PUBLIC_LAMATIC_ENDPOINT=https://sandbox566-freetoolsokrautopilot809.lamatic.dev/graphql
NEXT_PUBLIC_LAMATIC_API_KEY=your_api_key_here
NEXT_PUBLIC_LAMATIC_PROJECT_ID=your_project_id_here

# Workflow IDs
NEXT_PUBLIC_WORKFLOW_RESEARCH=8f4c3c15-6ee5-4ca6-b773-926205ded262
NEXT_PUBLIC_WORKFLOW_GENERATE=01e84485-b896-437d-91ce-2665329acad1
NEXT_PUBLIC_WORKFLOW_REGENERATE=f976102d-479b-4421-a45b-00c45fd8c3c6
NEXT_PUBLIC_WORKFLOW_SAVE=c2c6798f-da4c-4b86-a0c4-b9f19e957ec0
NEXT_PUBLIC_WORKFLOW_INVITE=76982f99-ff9b-43e3-b9c5-0fafcab083b5
NEXT_PUBLIC_WORKFLOW_SEND_EMAIL=f3291ee2-e273-477f-8d57-f8862a523a4f
```

---

## 🎯 How It Works

### 1️⃣ **Company Research**
Enter your company website URL. The AI scrapes and analyzes:
- Company mission and values
- Products and services
- Industry context
- Key features and differentiators

### 2️⃣ **OKR Generation**
AI creates strategic objectives and key results:
- Aligned with your company mission
- Measurable and time-bound
- Role-specific customization
- Editable strategic narrative

### 3️⃣ **Team Collaboration**
Invite team members with:
- Personalized OKR suggestions
- Alignment to leadership goals
- Custom personal messages
- One-click workspace access

### 4️⃣ **Progress Tracking**
Monitor team performance:
- Real-time progress updates
- Visual analytics dashboard
- Automated weekly reminders
- Appreciation and encouragement emails

---

## 🎨 Themes

Choose from 5 beautiful color schemes:

| Theme | Primary Color | Best For |
|-------|--------------|----------|
| **Red Energy** | `#DC2626` | Bold, action-oriented teams |
| **Ocean Blue** | `#0EA5E9` | Calm, professional environments |
| **Forest Green** | `#10B981` | Growth-focused organizations |
| **Sunset Orange** | `#F97316` | Creative, innovative teams |
| **Lavender Purple** | `#A855F7` | Modern, tech-forward companies |

All themes use **oklch color space** for perceptually uniform colors and smooth transitions.

---

## 📧 Email Workflows

### Invitation Emails
Beautiful HTML emails with:
- Personalized OKR previews
- One-click workspace access
- Leader's personal message
- Responsive design

### Progress Reminders
Conditional emails based on progress:
- ✅ **70%+ progress** - Appreciation message
- ⚠️ **40-69% progress** - Gentle encouragement
- ❌ **<40% progress** - Motivational push

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/swastik-raj-vansh-singh/OKR-the-FreeTool)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Lamatic** - AI workflow orchestration platform
- **Vercel** - Hosting and deployment
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon library
- **Google & LinkedIn** - OKR methodology inspiration

---

## 📞 Support

- **Documentation**: [Coming soon]
- **Issues**: [GitHub Issues](https://github.com/swastik-raj-vansh-singh/OKR-the-FreeTool/issues)
- **Email**: swastikrajvanshsingh0@gmail.com
- **Twitter**: [@swastiksingh](https://twitter.com/swastiksingh)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=swastik-raj-vansh-singh/OKR-the-FreeTool&type=Date)](https://star-history.com/#swastik-raj-vansh-singh/OKR-the-FreeTool&Date)

---

<div align="center">

### Made with ❤️ by Swastik Raj Vansh Singh

**[⭐ Star this repo](https://github.com/swastik-raj-vansh-singh/OKR-the-FreeTool)** if you find it useful!

</div>
