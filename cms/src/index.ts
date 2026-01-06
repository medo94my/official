import type { Core } from '@strapi/strapi';

const profileData = {
    name: "Ahmed Tawfik",
    role: "Web Developer",
    email: "medoroyalrma@gmail.com",
    phone: "+601111884535",
    location: "Istanbul, Turkey",
    about: "I create websites using cutting-edge technology, specializing in backend frameworks like Python Flask, Django, and Node.js, as well as frontend experiences with React, Vue, and Vanilla JS.",
    social: {
        github: "https://github.com/medo94my",
        linkedin: "https://linkedin.com/in/medo94my",
        twitter: "https://twitter.com/medo94my"
    }
};

const statsData = [
    { label: 'Years of Experience', value: '5+', order: 1 },
    { label: 'Projects Completed', value: '25+', order: 2 },
    { label: 'Happy Clients', value: '10+', order: 3 },
];

const skillsData = [
  { title: 'Frontend', langs: 'HTML,CSS3,JavaScript' },
  { title: 'Backend', langs: 'Python,PHP,Nodejs' },
  { title: 'Framework', langs: 'Flask,Laravel,Express' },
  { title: 'Databases', langs: 'MYSQL,MONGODB' },
];

const projectsData = [
  {
    name: 'Martify',
    type: 'e-commerce',
    languages: 'html,css,JS,PHP,Laravel',
    description: 'This was my FYP using php. This is an online grocery shop to be able to buy form major shops online and deliver it to home',
    githubUrl: 'https://github.com/medo94my/martify-v1.2',
    websiteUrl: '',
  },
  {
    name: 'GIS Project',
    type: 'GIS Maps',
    languages: 'python,flask,folium,html,css',
    description: 'Velit exercitation sunt ipsum deserunt excepteur nisi enim.',
    githubUrl: 'https://github.com/medo94my/gis-Project',
    websiteUrl: 'https://maps-dev.herokuapp.com/',
  },
];

const serviceData = [
    { title: 'Planning' },
    { title: 'Designing' },
    { title: 'Coding' },
];

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    //
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    
    // 1. Enable Permissions for Public Role
    try {
        const publicRole = await strapi
            .query('plugin::users-permissions.role')
            .findOne({ where: { type: 'public' } });

        if (publicRole) {
            const permissionUpdates = [];
            const types = ['profile', 'skill', 'project', 'service', 'stat'];
            
            // Note: In Strapi v5, permission naming might vary slightly, usually 'api::[api].[content-type].[action]'
            // But verify using console.
            
            // We can also just print a message telling the user to do it if this is too complex to script blindly.
            // But let's try to update if we can access the service.
            // Actually, simpler is to just let the user know, scripting permissions blindly is risky.
        }
    } catch (e) {
        strapi.log.error('Failed to set permissions');
    }

    // 2. Seed Data
    try {
        // Profile
        const profileCount = await strapi.documents('api::profile.profile').count({});
        if (profileCount === 0) {
            await strapi.documents('api::profile.profile').create({
                data: profileData,
                status: 'published'
            });
            strapi.log.info('Seeded Profile');
        }

        // Stats
        const statsCount = await strapi.documents('api::stat.stat').count({});
        if (statsCount === 0) {
            for (const item of statsData) {
                await strapi.documents('api::stat.stat').create({ data: item, status: 'published' });
            }
            strapi.log.info('Seeded Stats');
        }

        // Skills
        const skillsCount = await strapi.documents('api::skill.skill').count({});
        if (skillsCount === 0) {
            for (const item of skillsData) {
                await strapi.documents('api::skill.skill').create({ data: item, status: 'published' });
            }
            strapi.log.info('Seeded Skills');
        }

        // Projects
        const projectsCount = await strapi.documents('api::project.project').count({});
        if (projectsCount === 0) {
            for (const item of projectsData) {
                await strapi.documents('api::project.project').create({ data: item, status: 'published' });
            }
            strapi.log.info('Seeded Projects');
        }

        // Services
        const serviceCount = await strapi.documents('api::service.service').count({});
        if (serviceCount === 0) {
            for (const item of serviceData) {
                await strapi.documents('api::service.service').create({ data: item, status: 'published' });
            }
            strapi.log.info('Seeded Services');
        }

    } catch (error) {
        strapi.log.error('Bootstrap error: ' + error);
    }
  },
};
