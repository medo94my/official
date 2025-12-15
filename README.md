# Modern Portfolio with Dynamic CMS

A modern, feature-rich portfolio website with a powerful CMS dashboard, AI-powered content creation, and stunning 3D animations.

## Features

- ✨ **Modern Design**: Sleek, professional portfolio with 3D effects and smooth animations
- 🎙️ **AI Voice Input**: Use Whisper AI to dictate project descriptions (no more typing!)
- 🎨 **Dynamic CMS**: Manage all content through an intuitive dashboard
- 🔐 **Secure Authentication**: Protected admin area with NextAuth
- 📱 **Fully Responsive**: Looks great on all devices
- 🚀 **Built with Next.js 14**: Fast, modern, and SEO-friendly
- 🎭 **3D Animations**: React Three Fiber for stunning visual effects
- 💾 **PostgreSQL Database**: Robust data management with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **3D Graphics**: React Three Fiber, Three.js, Drei
- **Animations**: Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI Whisper API for voice-to-text

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (for voice features)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/portfolio_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed the database** with sample data:
   ```bash
   npx tsx lib/seed.ts
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** to `http://localhost:3000`

## Default Login

- **Email**: `admin@portfolio.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials immediately after first login!

## Usage

### Managing Content

1. Login at `/admin/login`
2. Access the dashboard at `/admin/dashboard`
3. Manage your:
   - **Projects**: Add, edit, delete portfolio projects
   - **Skills**: Showcase your technical skills with progress bars
   - **Services**: Describe what you offer
   - **About**: Update your bio and social links
   - **Hero**: Customize the homepage hero section

### Using Voice Input

1. Click the "Start Recording" button on any form with voice support
2. Speak naturally about your project or skill
3. Click "Stop Recording"
4. The AI will transcribe AND enhance your content automatically!

### Viewing Your Portfolio

- Visit the homepage at `/` to see your live portfolio
- All changes in the CMS are reflected immediately

## Deployment

### Recommended: Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database Hosting

For production, use a hosted PostgreSQL service:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [Neon](https://neon.tech)

## Customization

### Colors

Edit `tailwind.config.ts` to change the color scheme:

```ts
colors: {
  primary: '#f0ad4e', // Your brand color
  dark: '#272626',    // Dark background
}
```

### 3D Effects

Customize the 3D sphere in `components/Hero3D.tsx`:

```tsx
<MeshDistortMaterial
  color="#f0ad4e"  // Change color
  distort={0.4}     // Adjust distortion
  speed={2}         // Animation speed
/>
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── admin/            # CMS dashboard
│   ├── page.tsx          # Public portfolio
│   └── layout.tsx        # Root layout
├── components/           # React components
├── lib/                  # Utilities and configs
├── prisma/              # Database schema
└── public/              # Static assets
```

## Troubleshooting

### Database Connection Issues

If you get database errors:
1. Ensure PostgreSQL is running
2. Check your `DATABASE_URL` in `.env.local`
3. Run `npx prisma db push` to sync the schema

### Whisper API Errors

If voice features don't work:
1. Verify your OpenAI API key is correct
2. Check you have credits in your OpenAI account
3. Ensure audio recording is enabled in your browser

### Build Errors

If the build fails:
1. Delete `.next` folder and `node_modules`
2. Run `npm install` again
3. Run `npm run build`

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License - feel free to use this for your own portfolio!

---

Built with ❤️ using Next.js, React Three Fiber, and OpenAI
