# Quick Start Guide 🚀

Your portfolio has been completely modernized! Here's how to get started in 3 simple steps:

## ✅ Database is Already Set Up!

I've already configured the database with SQLite and loaded all your existing portfolio data. You're ready to go!

## 🎯 Step 1: Start the Development Server

```bash
npm run dev
```

## 🔑 Step 2: Login to Your Dashboard

1. Open http://localhost:3000/admin/login
2. Login with:
   - **Email**: `medoroyalrma@gmail.com`
   - **Password**: `admin123`
3. **IMPORTANT**: Change your password immediately!

## 🎨 Step 3: Customize Your Portfolio

Navigate through the dashboard:

- **Projects**: View/edit your existing projects (already migrated!)
- **Skills**: Manage your skills (Frontend, Backend, Database, etc.)
- **Services**: Update what you offer
- **About**: Edit your bio and social links
- **Hero**: Customize the homepage headline

## 🎙️ Using AI Voice Input

On the Projects and Services forms, you'll see a microphone button:

1. Click "Start Recording"
2. Speak naturally about your project
3. Click "Stop Recording"
4. Watch as AI transcribes AND enhances your content!

**Note**: Voice features require an OpenAI API key. Add it to `.env.local`:
```env
OPENAI_API_KEY="your-key-here"
```

Get a key from: https://platform.openai.com/api-keys

## 📊 What's Already Been Migrated

✅ Your 3 projects (Martify, GUESS game, Blog)
✅ Your skills (HTML, CSS, JS, Python, PHP, etc.)
✅ Your services
✅ Your bio and contact info
✅ All your social links (GitHub, LinkedIn, Twitter)

## 🌐 View Your Portfolio

Open http://localhost:3000 to see your live portfolio with:
- 3D animated hero section
- All your existing projects
- Your skills organized by category
- Modern animations throughout

## 🚀 Deploy to Production

When you're ready to go live:

1. **Get a PostgreSQL database** (free options):
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Supabase](https://supabase.com)
   - [Neon](https://neon.tech)

2. **Update `.env.local`**:
   ```env
   DATABASE_URL="your-postgres-connection-string"
   ```

3. **Update Prisma schema**:
   Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`

4. **Push schema and migrate**:
   ```bash
   npx prisma db push
   npx tsx lib/migrate-old-data.ts
   ```

5. **Deploy to Vercel**:
   - Push to GitHub (already done ✓)
   - Connect repo on [vercel.com](https://vercel.com)
   - Add environment variables
   - Deploy!

## 🔧 Troubleshooting

### Port already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Database issues
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
npx tsx lib/migrate-old-data.ts
```

### Need to reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Learn More

- **Full README**: See `README.md` for detailed documentation
- **Prisma Studio**: Run `npx prisma studio` to view database in GUI
- **API Endpoints**: All at `/api/*` (projects, skills, services, etc.)

## 💡 Tips

1. **Update content regularly** through the dashboard - no code editing needed!
2. **Use voice input** to save time describing projects
3. **Mark projects as featured** to highlight them
4. **Customize colors** in `tailwind.config.ts`
5. **Add project images** by uploading to a service like Imgur and using the URL

## 🎉 You're All Set!

Your portfolio is now:
- ✅ Modern and professional
- ✅ Easy to update via dashboard
- ✅ AI-powered content creation
- ✅ 3D animated and beautiful
- ✅ Ready to deploy

Just run `npm run dev` and start customizing! 🚀
