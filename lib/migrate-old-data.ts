import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

/**
 * Migration script to populate database with data from old portfolio
 * Based on the content from old-portfolio/index.html
 */

async function main() {
  console.log('Migrating data from old portfolio...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'medoroyalrma@gmail.com' },
    update: {},
    create: {
      email: 'medoroyalrma@gmail.com',
      password: hashedPassword,
      name: 'Ahmed Tawfik',
    },
  })
  console.log('✓ Created admin user:', user.email)

  // Create hero section
  const hero = await prisma.hero.upsert({
    where: { id: 'default-hero' },
    update: {},
    create: {
      id: 'default-hero',
      headline: "Hello, I am Ahmed Tawfik Ali",
      subheadline: 'Code Trainer & Software Developer',
      ctaText: 'SEE PORTFOLIO',
      ctaUrl: '#portfolio',
    },
  })
  console.log('✓ Created hero section')

  // Create about section
  const about = await prisma.about.create({
    data: {
      name: 'Ahmed Tawfik',
      title: 'Code Trainer & Software Developer',
      bio: 'I am experienced in website designing using up to date technology and experienced in backend technology such as python flask and python django and vanilla javascript',
      email: 'medoroyalrma@email.com',
      phone: '+601111884535',
      location: '6/4 jalan camar · Kota Damansara, 47810',
      github: 'https://github.com/medo94my',
      linkedin: 'https://www.linkedin.com/in/ahmad-tawfiq-8ba147126/',
      twitter: 'https://twitter.com/medo94_my',
    },
  })
  console.log('✓ Created about section')

  // Create projects from old portfolio
  const projects = [
    {
      title: 'E-commerce - Martify Grocery',
      description: 'This was my FYP using PHP. This is an online grocery shop to be able to buy from major shops online and deliver it to home',
      type: 'Solo',
      tags: ['PHP', 'MySQL', 'E-commerce', 'Heroku'],
      featured: true,
      order: 0,
      githubUrl: 'https://github.com/medo94my/undertesting',
      liveUrl: 'http://martifyapp.herokuapp.com/',
    },
    {
      title: 'GUESS Number Game',
      description: 'This is a guess number game working the same idea as master mind. It asks user to guess the generated number to get points',
      type: 'Team',
      tags: ['JavaScript', 'Game Development', 'Heroku'],
      featured: false,
      order: 1,
      githubUrl: 'https://github.com/medo94my/game-dev',
      liveUrl: 'https://mastermind-me.herokuapp.com/',
    },
    {
      title: 'Blog with Reward System',
      description: 'This project is a replica of stackoverflow but aiming toward gamers to discuss about newly launched games',
      type: 'Team',
      tags: ['PHP', 'MySQL', 'Forum', 'Gamification'],
      featured: false,
      order: 2,
      githubUrl: 'https://github.com/medo94my/wasi-furom',
    },
  ]

  for (const project of projects) {
    await prisma.project.create({ data: project })
  }
  console.log('✓ Created projects')

  // Create skills from old portfolio
  const skills = [
    // Frontend
    { name: 'HTML', category: 'Frontend', level: 95, icon: '📄', order: 0 },
    { name: 'CSS3', category: 'Frontend', level: 90, icon: '🎨', order: 1 },
    { name: 'JavaScript', category: 'Frontend', level: 85, icon: '⚡', order: 2 },

    // Backend
    { name: 'Python', category: 'Backend', level: 90, icon: '🐍', order: 3 },
    { name: 'PHP', category: 'Backend', level: 85, icon: '🐘', order: 4 },
    { name: 'C#', category: 'Backend', level: 75, icon: '#️⃣', order: 5 },

    // Frameworks
    { name: 'Flask', category: 'Frameworks', level: 85, icon: '🌶️', order: 6 },
    { name: 'Django', category: 'Frameworks', level: 85, icon: '🦄', order: 7 },
    { name: 'Laravel', category: 'Frameworks', level: 80, icon: '🔧', order: 8 },

    // Database
    { name: 'MySQL', category: 'Database', level: 85, icon: '🗄️', order: 9 },
    { name: 'MongoDB', category: 'Database', level: 80, icon: '🍃', order: 10 },
  ]

  for (const skill of skills) {
    await prisma.skill.create({ data: skill })
  }
  console.log('✓ Created skills')

  // Create services from old portfolio
  const services = [
    {
      title: 'Technology Planning',
      description: 'Planning the most suitable technology that is needed for the desired application',
      icon: '🎯',
      order: 0,
    },
    {
      title: 'UI/UX Design',
      description: 'Begin to design the interface and implement the required styles',
      icon: '🎨',
      order: 1,
    },
    {
      title: 'Application Development',
      description: 'Develop the application according to the plan has been selected before',
      icon: '💻',
      order: 2,
    },
  ]

  for (const service of services) {
    await prisma.service.create({ data: service })
  }
  console.log('✓ Created services')

  console.log('✅ Migration completed successfully!')
  console.log('\n📝 Default credentials:')
  console.log('   Email: medoroyalrma@gmail.com')
  console.log('   Password: admin123')
  console.log('\n⚠️  Please change your password after first login!')
}

main()
  .catch((e) => {
    console.error('Error migrating data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
