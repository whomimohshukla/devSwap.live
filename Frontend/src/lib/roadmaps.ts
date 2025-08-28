export type RoadmapStep = {
  id: string;
  title: string;
  description?: string;
  resources?: { label: string; href: string }[];
};

export type RoadmapStage = {
  id: string;
  title: string;
  summary?: string;
  steps: RoadmapStep[];
};

export type Roadmap = {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  tags: string[];
  stages: RoadmapStage[];
};

export const roadmaps: Roadmap[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer Roadmap',
    level: 'beginner',
    description: 'HTML, CSS, JavaScript fundamentals, then frameworks and tooling.',
    tags: ['HTML', 'CSS', 'JavaScript', 'React'],
    stages: [
      {
        id: 'foundations',
        title: 'Foundations',
        summary: 'Core web building blocks and browser concepts.',
        steps: [
          { id: 'html', title: 'HTML Basics', resources: [{ label: 'Learn → HTML', href: '/learn/html' }] },
          { id: 'css', title: 'CSS Basics', resources: [{ label: 'Learn → CSS', href: '/learn/css' }] },
          { id: 'js', title: 'JavaScript Essentials', resources: [{ label: 'Learn → JavaScript', href: '/learn/javascript' }] },
        ],
      },
      {
        id: 'framework',
        title: 'Framework',
        summary: 'Pick one ecosystem to go deeper with.',
        steps: [
          { id: 'react', title: 'React Basics', resources: [{ label: 'Learn → React', href: '/learn/react' }] },
          { id: 'router', title: 'Routing', resources: [{ label: 'React Router', href: '/learn/react' }] },
          { id: 'state', title: 'State Management', resources: [{ label: 'Context/Reducer', href: '/learn/react' }] },
        ],
      },
      {
        id: 'tooling',
        title: 'Tooling & Quality',
        summary: 'Build tools, linting, formatting, and testing.',
        steps: [
          { id: 'bundler', title: 'Vite / Webpack' },
          { id: 'lint', title: 'ESLint & Prettier' },
          { id: 'test', title: 'Testing (Jest/RTL)' },
        ],
      },
      {
        id: 'project',
        title: 'Project & Deployment',
        summary: 'Build a small app and deploy it.',
        steps: [
          { id: 'crud', title: 'Build a CRUD App' },
          { id: 'deploy', title: 'Deploy (Netlify/Vercel)' },
        ],
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Developer Roadmap',
    level: 'beginner',
    description: 'Node.js, Express, databases, auth, and deployment.',
    tags: ['Node.js', 'Express', 'MongoDB', 'Auth'],
    stages: [
      {
        id: 'node-basics',
        title: 'Node.js Basics',
        steps: [
          { id: 'runtime', title: 'Runtime & NPM', resources: [{ label: 'Learn → Node.js', href: '/learn/nodejs' }] },
          { id: 'modules', title: 'CommonJS/ESM' },
        ],
      },
      {
        id: 'express',
        title: 'Express & REST',
        steps: [
          { id: 'routes', title: 'Routes & Controllers', resources: [{ label: 'Learn → Express', href: '/learn/express' }] },
          { id: 'middleware', title: 'Middleware' },
        ],
      },
      {
        id: 'db',
        title: 'Database',
        steps: [
          { id: 'mongo', title: 'MongoDB & Mongoose', resources: [{ label: 'Learn → MongoDB', href: '/learn/mongodb' }] },
          { id: 'modeling', title: 'Schema Modeling' },
        ],
      },
      {
        id: 'auth',
        title: 'Authentication',
        steps: [
          { id: 'jwt', title: 'JWT & Sessions' },
          { id: 'oauth', title: 'OAuth (Google/GitHub)' },
        ],
      },
      {
        id: 'deploy',
        title: 'Deployment & Ops',
        steps: [
          { id: 'hosting', title: 'Hosting' },
          { id: 'env', title: 'Env & Secrets' },
        ],
      },
    ],
  },
  {
    id: 'fullstack',
    title: 'MERN Full-Stack Roadmap',
    level: 'intermediate',
    description: 'Build end-to-end apps with MongoDB, Express, React, and Node.',
    tags: ['MERN', 'Full-Stack'],
    stages: [
      { id: 'fe', title: 'Frontend', steps: [ { id: 'react', title: 'React Basics', resources: [{ label: 'Learn → React', href: '/learn/react' }] } ] },
      { id: 'be', title: 'Backend', steps: [ { id: 'express', title: 'Express CRUD', resources: [{ label: 'Learn → Express', href: '/learn/express' }] } ] },
      { id: 'db', title: 'Database', steps: [ { id: 'mongo', title: 'MongoDB & Mongoose', resources: [{ label: 'Learn → MongoDB', href: '/learn/mongodb' }] } ] },
      { id: 'integration', title: 'Integration', steps: [ { id: 'api', title: 'Connect FE ↔ BE' } ] },
      { id: 'deploy', title: 'Deployment', steps: [ { id: 'vercel', title: 'Deploy Client & Server' } ] },
    ],
  },
];
