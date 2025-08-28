export type LearnLesson = {
  slug: string;
  title: string;
  estMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  summary: string;
  sections: { heading: string; body: string }[];
  example?: { html?: string; css?: string; js?: string };
  quiz?: { question: string; options: string[]; answerIndex: number; explanation: string }[];
};

export type LearnTopic = {
  id: string;
  title: string;
  description: string;
  lessons: LearnLesson[];
};

export const learnTopics: LearnTopic[] = [
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Learn modern JavaScript with bite-sized lessons, interactive examples, and quizzes.',
    lessons: [
      {
        slug: 'intro',
        title: 'Introduction to JavaScript',
        estMinutes: 8,
        level: 'beginner',
        summary: 'What JavaScript is, where it runs, and how to include it in web pages.',
        sections: [
          { heading: 'What is JavaScript?', body: 'JavaScript is a programming language that powers interactivity on the web. It runs in the browser and on servers (Node.js).'},
          { heading: 'Embedding JS', body: 'You can include JS inline with <script> tags or link external .js files. Modern apps use bundlers and frameworks, but the basics are the same.'}
        ],
        example: {
          html: '<div id="app">Click the button</div>\n<button id="btn">Click me</button>',
          js: 'document.getElementById("btn")!.addEventListener("click", () => {\n  const app = document.getElementById("app");\n  if (app) app.textContent = "Hello from JS!";\n});',
        },
        quiz: [
          { question: 'JavaScript runs in…', options: ['Only browsers', 'Only servers', 'Browsers and servers'], answerIndex: 2, explanation: 'JS runs in browsers and in Node.js on servers.' }
        ]
      },
      {
        slug: 'variables',
        title: 'Variables and Types',
        estMinutes: 12,
        level: 'beginner',
        summary: 'let, const, var, and primitive types.',
        sections: [
          { heading: 'let vs const', body: 'Use const by default; use let for reassignable bindings. Avoid var in modern code.'},
          { heading: 'Types', body: 'Common primitives: string, number, boolean, null, undefined, symbol, bigint.'}
        ],
        example: {
          js: 'const name = "Ada";\nlet age = 28;\nage += 1;\nconsole.log(`${name} is ${age}`);',
        },
        quiz: [
          { question: 'Which is block-scoped?', options: ['var', 'let', 'function'], answerIndex: 1, explanation: 'let (and const) are block-scoped; var is function-scoped.' }
        ]
      },
      {
        slug: 'functions',
        title: 'Functions and Arrow Functions',
        estMinutes: 10,
        level: 'beginner',
        summary: 'Declaring functions and using arrow functions.',
        sections: [
          { heading: 'Function Declarations', body: 'function add(a, b) { return a + b }'},
          { heading: 'Arrow Functions', body: 'const add = (a, b) => a + b; Arrow functions capture this from the surrounding scope.'},
          { heading: 'Default/Rest Params', body: 'Use defaults (x = 1) and rest (...args) to handle flexible arguments.'},
          { heading: 'Pure vs Impure', body: 'Favor pure functions for predictability and testability.'}
        ],
        example: {
          js: 'const greet = (name = "World") => `Hello, ${name}!`;\nconst sum = (...nums) => nums.reduce((a,b) => a+b, 0);\nconsole.log(greet());\nconsole.log(sum(1,2,3));',
        },
        quiz: [
          { question: 'Arrow functions bind their own this by default?', options: ['Yes', 'No'], answerIndex: 1, explanation: 'They do not bind their own this; they use lexical this.' }
        ]
      },
      {
        slug: 'arrays-objects',
        title: 'Arrays and Objects',
        estMinutes: 14,
        level: 'beginner',
        summary: 'Manipulate data with array methods and object patterns.',
        sections: [
          { heading: 'Array Methods', body: 'map, filter, reduce, find, some, every are essential data transforms.' },
          { heading: 'Spread/Rest', body: 'Use ... to copy/merge arrays and objects immutably.' },
          { heading: 'Destructuring', body: 'Extract values via const {x} = obj; const [a,b] = arr;' }
        ],
        example: {
          js: 'const users = [{id:1, name:"A"},{id:2, name:"B"}];\nconst names = users.map(u=>u.name);\nconst withC = [...users, {id:3, name:"C"}];\nconst byId = withC.find(u=>u.id===2);\nconsole.log(names, byId);'
        },
        quiz: [
          { question: 'Which method accumulates into a single value?', options: ['map', 'reduce', 'filter'], answerIndex: 1, explanation: 'reduce folds the array to a single value.' }
        ]
      },
      {
        slug: 'control-flow',
        title: 'Control Flow',
        estMinutes: 9,
        level: 'beginner',
        summary: 'if/else, switch, loops, and early returns.',
        sections: [
          { heading: 'Loops', body: 'for, while, for..of are common loops. Prefer array methods when transforming.' },
          { heading: 'Early Return', body: 'Return early to reduce nesting and improve readability.' }
        ]
      },
      {
        slug: 'promises-async-await',
        title: 'Promises and Async/Await',
        estMinutes: 15,
        level: 'beginner',
        summary: 'Handle asynchronous code using Promises and async/await.',
        sections: [
          { heading: 'Promises', body: 'A Promise represents a future value (pending, fulfilled, rejected).' },
          { heading: 'Async/Await', body: 'Write asynchronous code that looks synchronous.' },
          { heading: 'Error Handling', body: 'Use try/catch around await; add .catch for promise chains.' }
        ],
        example: {
          js: 'const delay = (ms) => new Promise(res => setTimeout(res, ms));\nasync function run(){\n  await delay(300);\n  return "done";\n}\nrun().then(console.log).catch(console.error);'
        }
      },
      {
        slug: 'fetch-api',
        title: 'Fetch API',
        estMinutes: 10,
        level: 'beginner',
        summary: 'Request data from HTTP APIs.',
        sections: [
          { heading: 'GET JSON', body: 'Use fetch(url).then(r=>r.json()) to parse JSON responses.' },
          { heading: 'Errors', body: 'Check response.ok and handle non-2xx statuses.' }
        ],
        example: {
          js: 'async function getUsers(){\n  const res = await fetch("https://jsonplaceholder.typicode.com/users");\n  if(!res.ok) throw new Error("Request failed");\n  const data = await res.json();\n  console.log(data.map(u=>u.name));\n}\ngetUsers();'
        }
      }
    ],
  },
  {
    id: 'react',
    title: 'React',
    description: 'Build interactive UIs with components, hooks, and state management.',
    lessons: [
      {
        slug: 'intro-react',
        title: 'Introduction to React',
        estMinutes: 10,
        level: 'beginner',
        summary: 'React basics: components and JSX.',
        sections: [
          { heading: 'Components', body: 'Components let you split the UI into independent, reusable pieces.' },
          { heading: 'JSX', body: 'JSX is a syntax extension that looks like HTML and compiles to React.createElement.' },
        ],
        example: { js: "function Hello(){return React.createElement('div', null, 'Hello React');}\nconsole.log(Hello());" },
        quiz: [
          { question: 'JSX compiles to…', options: ['HTML', 'React.createElement calls', 'CSS'], answerIndex: 1, explanation: 'JSX compiles to React.createElement calls.' }
        ],
      },
      {
        slug: 'hooks-state',
        title: 'Hooks and State',
        estMinutes: 12,
        level: 'beginner',
        summary: 'useState, useEffect basics.',
        sections: [
          { heading: 'useState', body: 'Manage component state with useState(initialValue).' },
          { heading: 'useEffect', body: 'Synchronize with external systems and effects.' },
        ],
      },
      {
        slug: 'props-and-events',
        title: 'Props and Events',
        estMinutes: 10,
        level: 'beginner',
        summary: 'Pass data via props and handle user events.',
        sections: [
          { heading: 'Props', body: 'Props configure components; keep them minimal and explicit.' },
          { heading: 'Events', body: 'onClick, onChange, and synthetic events in React.' }
        ],
      },
      {
        slug: 'lists-and-keys',
        title: 'Lists and Keys',
        estMinutes: 8,
        level: 'beginner',
        summary: 'Render arrays with stable keys.',
        sections: [
          { heading: 'Keys', body: 'Use stable unique keys (not index) to prevent reordering bugs.' }
        ],
      },
      {
        slug: 'forms',
        title: 'Forms and Controlled Inputs',
        estMinutes: 12,
        level: 'beginner',
        summary: 'Controlled vs uncontrolled inputs and form handling.',
        sections: [
          { heading: 'Controlled', body: 'Bind input value to state; update onChange.' }
        ]
      }
    ],
  },
  {
    id: 'nodejs',
    title: 'Node.js',
    description: 'Server-side JavaScript with Node.js and npm.',
    lessons: [
      {
        slug: 'node-basics',
        title: 'Node Basics',
        estMinutes: 9,
        level: 'beginner',
        summary: 'Runtime, modules, and npm.',
        sections: [
          { heading: 'CommonJS/ESM', body: 'Use import/export (ESM) or require/module.exports (CJS) depending on setup.' },
        ],
      },
      {
        slug: 'http-server',
        title: 'HTTP Server',
        estMinutes: 8,
        level: 'beginner',
        summary: 'Create a simple HTTP server.',
        sections: [
          { heading: 'http module', body: 'Use the built-in http module to handle requests.' },
        ],
      },
      {
        slug: 'filesystem',
        title: 'File System (fs)',
        estMinutes: 9,
        level: 'beginner',
        summary: 'Read and write files with fs/promises.',
        sections: [
          { heading: 'fs/promises', body: 'Prefer promise-based API with async/await.' }
        ],
      },
      {
        slug: 'express-intro',
        title: 'Express Intro',
        estMinutes: 10,
        level: 'beginner',
        summary: 'Create a server with Express and routes.',
        sections: [
          { heading: 'Middleware', body: 'Use middleware for parsing, logging, auth, and errors.' }
        ],
      }
    ],
  },
  {
    id: 'html',
    title: 'HTML',
    description: 'Structure web content using semantic HTML.',
    lessons: [
      { slug: 'elements', title: 'Elements and Structure', estMinutes: 7, level: 'beginner', summary: 'Headings, paragraphs, lists.', sections: [ { heading: 'Semantics', body: 'Prefer semantic tags like header, main, footer.' } ] },
      { slug: 'forms', title: 'Forms', estMinutes: 10, level: 'beginner', summary: 'Inputs, labels, and accessibility.', sections: [ { heading: 'Labels', body: 'Always connect labels to inputs for accessibility.' } ] },
    ],
  },
  {
    id: 'css',
    title: 'CSS',
    description: 'Style and layout with modern CSS.',
    lessons: [
      { slug: 'selectors', title: 'Selectors', estMinutes: 8, level: 'beginner', summary: 'Select elements to style.', sections: [ { heading: 'Specificity', body: 'Learn how specificity affects which rules apply.' } ] },
      { slug: 'flexbox', title: 'Flexbox', estMinutes: 12, level: 'beginner', summary: 'Lay out elements in one dimension.', sections: [ { heading: 'Main/Cross Axis', body: 'Understand justify-content and align-items.' } ] },
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description: 'Typed JavaScript for safer codebases.',
    lessons: [
      { slug: 'ts-basics', title: 'Basics', estMinutes: 9, level: 'beginner', summary: 'Types, interfaces, unions.', sections: [ { heading: 'Type Inference', body: 'TypeScript can infer many types automatically.' } ] },
      { slug: 'ts-react', title: 'React + TS', estMinutes: 11, level: 'beginner', summary: 'Typing props and hooks.', sections: [ { heading: 'Props', body: 'Define component props with interfaces or types.' } ] },
    ],
  },
  {
    id: 'express',
    title: 'Express',
    description: 'Fast, unopinionated web framework for Node.js.',
    lessons: [
      { slug: 'routing', title: 'Routing', estMinutes: 8, level: 'beginner', summary: 'Define routes and middleware.', sections: [ { heading: 'Middleware', body: 'Compose request processing with middleware.' } ] },
      { slug: 'rest-api', title: 'REST API', estMinutes: 12, level: 'beginner', summary: 'CRUD endpoints and validation.', sections: [ { heading: 'Controllers', body: 'Separate concerns using controllers/services.' } ] },
    ],
  },
  {
    id: 'nextjs',
    title: 'Next.js',
    description: 'React framework for production apps with routing, SSR/SSG.',
    lessons: [
      { slug: 'pages-routing', title: 'Routing Basics', estMinutes: 9, level: 'beginner', summary: 'App Router and file-based routes.', sections: [ { heading: 'Layouts', body: 'Share UI with nested layouts.' } ] },
      { slug: 'data-fetching', title: 'Data Fetching', estMinutes: 11, level: 'beginner', summary: 'fetch, caching, and revalidation.', sections: [ { heading: 'Server Components', body: 'Leverage RSC for data-heavy UI.' } ] },
    ],
  },
  {
    id: 'mongodb',
    title: 'MongoDB',
    description: 'Document database for flexible schemas.',
    lessons: [
      { slug: 'collections', title: 'Collections and Documents', estMinutes: 8, level: 'beginner', summary: 'Design documents and indexes.', sections: [ { heading: 'Indexes', body: 'Speed up queries with indexes.' } ] },
      { slug: 'crud', title: 'CRUD with Mongoose', estMinutes: 12, level: 'beginner', summary: 'Models and CRUD operations.', sections: [ { heading: 'Schema', body: 'Define schema and validation.' } ] },
    ],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Developer',
    description: 'End-to-end skills: React, Node, Express, MongoDB, Auth, and DevOps basics.',
    lessons: [
      { slug: 'architecture', title: 'App Architecture', estMinutes: 10, level: 'beginner', summary: 'Front to back overview.', sections: [ { heading: 'Separation of Concerns', body: 'Client, API, DB responsibilities.' } ] },
      { slug: 'auth', title: 'Authentication', estMinutes: 12, level: 'beginner', summary: 'JWT/OAuth flows.', sections: [ { heading: 'Sessions vs Tokens', body: 'Trade-offs and best practices.' }, { heading: 'Password Storage', body: 'Always hash with a strong algorithm (bcrypt/argon2) and use salts.' } ] },
      { slug: 'crud-project', title: 'CRUD Project Outline', estMinutes: 15, level: 'beginner', summary: 'Plan a MERN CRUD app (tasks/users).', sections: [ { heading: 'Entities', body: 'Define Task and User with relationships.' }, { heading: 'Routes', body: 'Design REST routes for CRUD and auth.' }, { heading: 'UI', body: 'List, filter, create, edit, delete.' } ] },
    ],
  },
];
