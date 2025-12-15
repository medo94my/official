import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@portfolio.com' },
    update: {},
    create: {
      email: 'admin@portfolio.com',
      password: hashedPassword,
      name: 'Admin',
    },
  })
  console.log('✓ Created admin user:', user.email)

  // Create hero section
  const hero = await prisma.hero.upsert({
    where: { id: 'default-hero' },
    update: {},
    create: {
      id: 'default-hero',
      headline: "Hi, I'm Your Name",
      subheadline: 'Full Stack Developer & Designer',
      ctaText: 'View My Work',
      ctaUrl: '#portfolio',
    },
  })
  console.log('✓ Created hero section')

  // Create about section
  const about = await prisma.about.create({
    data: {
      name: 'Your Name',
      title: 'Full Stack Developer',
      bio: 'I am a passionate developer with expertise in modern web technologies. I love building beautiful and functional applications.',
      email: 'contact@example.com',
      github: 'https://github.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername',
      twitter: 'https://twitter.com/yourusername',
    },
  })
  console.log('✓ Created about section')

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      title: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform with cart, checkout, and payment integration.',
      type: 'Solo',
      tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      featured: true,
      order: 0,
      githubUrl: 'https://github.com/yourusername/project1',
      liveUrl: 'https://project1.example.com',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates.',
      type: 'Team',
      tags: ['Next.js', 'TypeScript', 'MongoDB', 'Socket.io'],
      featured: false,
      order: 1,
      githubUrl: 'https://github.com/yourusername/project2',
    },
  })

  console.log('✓ Created sample projects')

  // Create skills
  const skills = [
    { name: 'React', category: 'Frontend', level: 90, icon: '⚛️', order: 0 },
    { name: 'Next.js', category: 'Frontend', level: 85, icon: '▲', order: 1 },
    { name: 'TypeScript', category: 'Frontend', level: 85, icon: '📘', order: 2 },
    { name: 'Node.js', category: 'Backend', level: 88, icon: '🟢', order: 3 },
    { name: 'PostgreSQL', category: 'Backend', level: 80, icon: '🐘', order: 4 },
    { name: 'Docker', category: 'Tools', level: 75, icon: '🐳', order: 5 },
  ]

  for (const skill of skills) {
    await prisma.skill.create({ data: skill })
  }
  console.log('✓ Created skills')

  // Create services
  const services = [
    {
      title: 'Web Development',
      description: 'Building modern, responsive web applications with the latest technologies.',
      icon: '💻',
      order: 0,
    },
    {
      title: 'UI/UX Design',
      description: 'Creating beautiful and intuitive user interfaces and experiences.',
      icon: '🎨',
      order: 1,
    },
    {
      title: 'API Development',
      description: 'Designing and developing robust RESTful and GraphQL APIs.',
      icon: '🔌',
      order: 2,
    },
  ]

  for (const service of services) {
    await prisma.service.create({ data: service })
  }
  console.log('✓ Created services')

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
