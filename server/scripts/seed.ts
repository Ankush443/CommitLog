import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Project } from '../src/models/Project';
import { Log } from '../src/models/Log';

dotenv.config();

const sampleProjects = [
  {
    name: 'CommitLog App',
    description: 'Daily journal application for tracking development work',
    color: 'blue',
  },
  {
    name: 'E-commerce Platform',
    description: 'Building a modern online shopping experience',
    color: 'green',
  },
  {
    name: 'Mobile App',
    description: 'React Native mobile application',
    color: 'purple',
  },
  {
    name: 'API Service',
    description: 'RESTful API backend service',
    color: 'orange',
  },
];

const generateSampleLogs = (projectIds: string[]) => {
  const today = new Date();
  const logs = [];

  // Week 1 - Recent logs (last 7 days)
  logs.push({
    date: formatDate(subtractDays(today, 0)),
    title: 'Implemented user authentication flow',
    completed: 'Built login and signup pages with form validation. Integrated JWT token generation and storage. Added protected route middleware for authenticated routes.',
    blockers: 'CORS issues with cookie storage on different domains',
    nextSteps: 'Implement password reset functionality and email verification',
    projectId: projectIds[0],
    repositoryUrl: 'https://github.com/user/commitlog',
    tags: ['authentication', 'security', 'frontend'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 1)),
    title: 'Fixed responsive design issues',
    completed: 'Updated CSS for mobile breakpoints. Adjusted sidebar navigation to collapse on small screens. Fixed table overflow issues on mobile devices.',
    nextSteps: 'Test on various devices and browsers',
    projectId: projectIds[0],
    tags: ['css', 'responsive', 'ui'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 2)),
    title: 'Optimized database queries',
    completed: 'Added indexes to frequently queried fields. Implemented query result caching with Redis. Reduced API response time by 60%.',
    projectId: projectIds[1],
    repositoryUrl: 'https://github.com/user/ecommerce-api',
    tags: ['performance', 'database', 'optimization'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 3)),
    title: 'Built product search functionality',
    completed: 'Implemented full-text search with Elasticsearch. Added filters for category, price range, and ratings. Created search suggestions with autocomplete.',
    blockers: 'Elasticsearch cluster configuration issues in production',
    nextSteps: 'Add search analytics and popular searches tracking',
    projectId: projectIds[1],
    tags: ['search', 'elasticsearch', 'backend'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 4)),
    title: 'Integrated payment gateway',
    completed: 'Set up Stripe integration for payment processing. Implemented checkout flow with order confirmation. Added webhook handlers for payment events.',
    projectId: projectIds[1],
    repositoryUrl: 'https://github.com/user/ecommerce-api',
    tags: ['payments', 'stripe', 'backend'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 5)),
    title: 'Created reusable UI component library',
    completed: 'Built Button, Card, Input, Modal, and Dropdown components. Added Storybook for component documentation. Implemented consistent theming with CSS variables.',
    nextSteps: 'Add more complex components like DataTable and Charts',
    projectId: projectIds[2],
    tags: ['components', 'react', 'ui'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 6)),
    title: 'Implemented offline mode',
    completed: 'Added service worker for offline functionality. Implemented local data caching with IndexedDB. Created sync queue for offline actions.',
    projectId: projectIds[2],
    tags: ['pwa', 'offline', 'mobile'],
  });

  // Week 2 - Previous week
  logs.push({
    date: formatDate(subtractDays(today, 7)),
    title: 'Set up CI/CD pipeline',
    completed: 'Configured GitHub Actions for automated testing and deployment. Set up staging and production environments. Added automated database backups.',
    projectId: projectIds[3],
    repositoryUrl: 'https://github.com/user/api-service',
    tags: ['devops', 'ci-cd', 'automation'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 9)),
    title: 'Implemented rate limiting',
    completed: 'Added Redis-based rate limiting middleware. Configured different limits for authenticated vs anonymous users. Implemented IP-based throttling.',
    blockers: 'Need to decide on appropriate rate limits for different endpoints',
    projectId: projectIds[3],
    tags: ['security', 'api', 'backend'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 10)),
    title: 'Wrote API documentation',
    completed: 'Created comprehensive API docs with Swagger/OpenAPI. Added example requests and responses. Documented authentication and error codes.',
    projectId: projectIds[3],
    tags: ['documentation', 'api'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 12)),
    title: 'Fixed memory leak in background jobs',
    completed: 'Identified memory leak in scheduled task runner. Implemented proper cleanup of event listeners. Reduced memory usage by 40%.',
    projectId: projectIds[3],
    tags: ['bug-fix', 'performance', 'backend'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 14)),
    title: 'Implemented real-time notifications',
    completed: 'Set up WebSocket server with Socket.io. Added real-time notification delivery to connected clients. Implemented notification preferences.',
    nextSteps: 'Add push notifications for mobile devices',
    projectId: projectIds[0],
    tags: ['websocket', 'real-time', 'backend'],
  });

  // Month ago - Some older logs
  logs.push({
    date: formatDate(subtractDays(today, 20)),
    title: 'Database migration to PostgreSQL',
    completed: 'Migrated database from MySQL to PostgreSQL. Updated all queries and models. Verified data integrity after migration.',
    projectId: projectIds[1],
    tags: ['database', 'migration'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 25)),
    title: 'Implemented image upload and processing',
    completed: 'Set up S3 bucket for image storage. Added image resizing and optimization with Sharp. Implemented progress indicators for uploads.',
    projectId: projectIds[1],
    tags: ['uploads', 'images', 'aws'],
  });

  logs.push({
    date: formatDate(subtractDays(today, 30)),
    title: 'Initial project setup',
    completed: 'Created project repository and initial folder structure. Set up TypeScript, ESLint, and Prettier. Configured development and build scripts.',
    projectId: projectIds[0],
    repositoryUrl: 'https://github.com/user/commitlog',
    tags: ['setup', 'configuration'],
  });

  return logs;
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/commitlog';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Log.deleteMany({});
    await Project.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Create projects
    console.log('Creating sample projects...');
    const projects = await Project.insertMany(sampleProjects);
    console.log(`✓ Created ${projects.length} projects\n`);

    // Create logs
    const projectIds = projects.map((p) => p._id.toString());
    const sampleLogs = generateSampleLogs(projectIds);
    
    console.log('Creating sample logs...');
    const logs = await Log.insertMany(sampleLogs);
    console.log(`✓ Created ${logs.length} logs\n`);

    // Summary
    console.log('📊 Seed Summary:');
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Logs: ${logs.length}`);
    console.log(`   Date range: ${logs[logs.length - 1].date} to ${logs[0].date}`);
    console.log('\n✅ Database seeded successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
