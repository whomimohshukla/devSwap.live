import type { Roadmap } from '../../lib/roadmaps';

// Base built-in roadmaps. You can override or add new roadmaps by
// dropping JSON files next to this file (e.g., data-analyst.json).
// Shape must match the Roadmap type.
const baseRoadmaps: Roadmap[] = [
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
  {
    id: 'data-analyst',
    title: 'Data Analyst Roadmap',
    level: 'beginner',
    description: 'Spreadsheets, SQL, BI tools, and storytelling with data.',
    tags: ['SQL', 'Excel', 'BI'],
    stages: [
      { id: 'fundamentals', title: 'Fundamentals', summary: 'Core tools and data literacy.', steps: [
        { id: 'excel', title: 'Excel/Sheets Basics', description: 'Cells, formulas, charts, pivot tables, and data cleaning.', resources: [
          { label: 'Google Sheets', href: 'https://support.google.com/a/users/answer/9282959' },
          { label: 'Pivot tables', href: 'https://support.google.com/a/users/answer/9308787' },
        ] },
        { id: 'sql', title: 'SQL Basics', description: 'SELECT, WHERE, JOIN, GROUP BY, ORDER BY.', resources: [
          { label: 'SQL Tutorial', href: 'https://www.w3schools.com/sql/' },
          { label: 'Mode SQL', href: 'https://mode.com/sql-tutorial/' },
        ] },
        { id: 'python-da', title: 'Python for Data Analysis', description: 'Pandas, NumPy, Jupyter.', resources: [
          { label: 'Pandas Docs', href: 'https://pandas.pydata.org/docs/' },
          { label: 'NumPy', href: 'https://numpy.org/learn/' },
        ] },
      ] },
      { id: 'bi', title: 'BI Tools', summary: 'Build dashboards and share insights.', steps: [
        { id: 'powerbi', title: 'Power BI / Looker / Tableau', description: 'Data modeling, measures, and visualization best practices.', resources: [
          { label: 'Tableau Learn', href: 'https://www.tableau.com/learn/training' },
          { label: 'Looker Docs', href: 'https://cloud.google.com/looker/docs' },
        ] },
        { id: 'dashboards', title: 'Dashboard Design', description: 'KPIs, layouts, color and accessibility.' },
      ] },
      { id: 'viz', title: 'Visualization', summary: 'Tell compelling stories with data.', steps: [
        { id: 'charts', title: 'Charts & Dashboards', description: 'Bar/line/scatter/heatmap and when to use each.' },
        { id: 'story', title: 'Data Storytelling', description: 'Narratives, audience context, and actionable insights.' },
      ] },
      { id: 'portfolio', title: 'Portfolio', summary: 'Demonstrate real impact.', steps: [
        { id: 'case', title: 'Case Studies', description: 'Before/after metrics, methodology, and outcomes.' },
        { id: 'publish', title: 'Publish Dashboards', description: 'Host on public gallery or personal site.' },
      ] },
    ],
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer Roadmap',
    level: 'intermediate',
    description: 'ETL/ELT, pipelines, warehouses, and orchestration.',
    tags: ['ETL', 'Airflow', 'Spark'],
    stages: [
      { id: 'storage', title: 'Storage & Warehouses', summary: 'Pick a warehouse and learn modeling.', steps: [
        { id: 'warehouse', title: 'Snowflake/BigQuery/Redshift', description: 'Loading, partitioning, clustering, cost control.' },
        { id: 'modeling', title: 'Dimensional Modeling', description: 'Star schemas, slowly changing dimensions.' , resources: [
          { label: 'dbt Learn', href: 'https://docs.getdbt.com/docs/introduction' },
        ] },
      ] },
      { id: 'pipelines', title: 'Pipelines', summary: 'Build reliable batch and streaming flows.', steps: [
        { id: 'airflow', title: 'Airflow/Prefect', description: 'DAGs, retries, scheduling, task dependencies.', resources: [
          { label: 'Airflow Docs', href: 'https://airflow.apache.org/docs/' },
          { label: 'Prefect', href: 'https://docs.prefect.io/' },
        ] },
        { id: 'spark', title: 'Spark Basics', description: 'RDD/DataFrame, partitions, joins, optimization.', resources: [
          { label: 'Spark Docs', href: 'https://spark.apache.org/docs/latest/' },
        ] },
        { id: 'stream', title: 'Streaming', description: 'Kafka fundamentals, at‑least/exactly-once, offsets.', resources: [
          { label: 'Kafka Intro', href: 'https://kafka.apache.org/intro' },
        ] },
      ] },
      { id: 'ops', title: 'Ops', summary: 'Operational excellence for data systems.', steps: [
        { id: 'quality', title: 'Data Quality', description: 'Contracts, validation, lineage.', resources: [
          { label: 'Great Expectations', href: 'https://docs.greatexpectations.io/' },
        ] },
        { id: 'monitor', title: 'Observability', description: 'Metrics, logging, tracing for pipelines.' },
        { id: 'cost', title: 'Cost & Governance', description: 'Budgets, quotas, RBAC, auditing.' },
      ] },
      { id: 'deploy', title: 'Deploy', summary: 'Ship infra as code and CI/CD.', steps: [
        { id: 'iac', title: 'Terraform', description: 'Modules, state, workspaces.', resources: [
          { label: 'Terraform Docs', href: 'https://developer.hashicorp.com/terraform/docs' },
        ] },
        { id: 'ci', title: 'CI/CD', description: 'Automate tests and deployments.' },
      ] },
    ],
  },
  {
    id: 'ai-engineer',
    title: 'AI/ML Engineer Roadmap',
    level: 'intermediate',
    description: 'ML fundamentals, model training, and deploying AI systems.',
    tags: ['ML', 'DL', 'MLOps'],
    stages: [
      { id: 'ml-basics', title: 'ML Basics', summary: 'Foundations to build robust models.', steps: [
        { id: 'py', title: 'Python for ML', description: 'NumPy, Pandas, scikit‑learn, Jupyter.', resources: [
          { label: 'Python.org', href: 'https://docs.python.org/3/tutorial/' },
          { label: 'scikit‑learn', href: 'https://scikit-learn.org/stable/user_guide.html' },
        ] },
        { id: 'math', title: 'Math (LinAlg/Stats)', description: 'Matrix calculus, probability, bias/variance.' },
        { id: 'metrics', title: 'Evaluation Metrics', description: 'Precision/Recall, ROC‑AUC, F1, RMSE/MAE.' },
      ] },
      { id: 'frameworks', title: 'Frameworks', summary: 'Deep learning and modern stacks.', steps: [
        { id: 'tf', title: 'TensorFlow / PyTorch', description: 'Autograd, modules, training loops.', resources: [
          { label: 'PyTorch', href: 'https://pytorch.org/tutorials/' },
          { label: 'TensorFlow', href: 'https://www.tensorflow.org/tutorials' },
        ] },
        { id: 'nlp', title: 'NLP & LLMs', description: 'Tokenization, transformers, fine‑tuning.' },
        { id: 'cv', title: 'Computer Vision', description: 'CNNs, augmentation, detection/segmentation.' },
      ] },
      { id: 'mlops', title: 'MLOps', summary: 'Ship and maintain models in production.', steps: [
        { id: 'serving', title: 'Model Serving', description: 'Batch vs. online, latency, scaling.' },
        { id: 'deploy', title: 'Deploy & Monitor', description: 'Drift detection, feedback loops, rollbacks.' },
        { id: 'tracking', title: 'Experiment Tracking', description: 'Artifacts, lineage, reproducibility.', resources: [
          { label: 'MLflow', href: 'https://mlflow.org/docs/latest/index.html' },
          { label: 'Weights & Biases', href: 'https://docs.wandb.ai/' },
        ] },
      ] },
      { id: 'ethics', title: 'Responsible AI', summary: 'Build fair and compliant systems.', steps: [
        { id: 'fairness', title: 'Fairness & Bias' },
        { id: 'privacy', title: 'Privacy & Security' },
      ] },
    ],
  },
  {
    id: 'mobile-android',
    title: 'Android Developer Roadmap',
    level: 'beginner',
    description: 'Kotlin, Android SDK, Jetpack, and publishing apps.',
    tags: ['Kotlin', 'Android'],
    stages: [
      { id: 'lang', title: 'Language', steps: [
        { id: 'kotlin', title: 'Kotlin Basics', resources: [{ label: 'Kotlin Lang', href: 'https://kotlinlang.org/docs/home.html' }] },
      ] },
      { id: 'sdk', title: 'Android SDK', steps: [
        { id: 'views', title: 'Views/Compose' },
        { id: 'storage', title: 'Storage & Networking' },
      ] },
      { id: 'publish', title: 'Publish', steps: [
        { id: 'play', title: 'Google Play Console' },
      ] },
    ],
  },
  {
    id: 'mobile-ios',
    title: 'iOS Developer Roadmap',
    level: 'beginner',
    description: 'Swift, UIKit/SwiftUI, and App Store publishing.',
    tags: ['Swift', 'iOS'],
    stages: [
      { id: 'lang', title: 'Language', steps: [
        { id: 'swift', title: 'Swift Basics', resources: [{ label: 'Swift.org', href: 'https://www.swift.org/documentation/' }] },
      ] },
      { id: 'ui', title: 'UI', steps: [
        { id: 'swiftui', title: 'SwiftUI / UIKit' },
      ] },
      { id: 'publish', title: 'Publish', steps: [
        { id: 'appstore', title: 'App Store Connect' },
      ] },
    ],
  },
  {
    id: 'react-native',
    title: 'React Native Roadmap',
    level: 'beginner',
    description: 'Build cross‑platform mobile apps using React Native.',
    tags: ['React', 'Mobile'],
    stages: [
      { id: 'setup', title: 'Setup', steps: [
        { id: 'env', title: 'Dev Environment' },
      ] },
      { id: 'core', title: 'Core', steps: [
        { id: 'components', title: 'Components & Navigation' },
        { id: 'native', title: 'Native Modules' },
      ] },
      { id: 'deploy', title: 'Deploy', steps: [
        { id: 'stores', title: 'Publish to Stores' },
      ] },
    ],
  },
  {
    id: 'flutter',
    title: 'Flutter Roadmap',
    level: 'beginner',
    description: 'Dart and Flutter for cross‑platform mobile and desktop.',
    tags: ['Dart', 'Flutter'],
    stages: [
      { id: 'lang', title: 'Language', steps: [ { id: 'dart', title: 'Dart Basics' } ] },
      { id: 'widgets', title: 'Widgets & State', steps: [ { id: 'state', title: 'State Management' } ] },
      { id: 'deploy', title: 'Deploy', steps: [ { id: 'stores', title: 'Store Release' } ] },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps Roadmap',
    level: 'intermediate',
    description: 'CI/CD, containers, infrastructure as code, and monitoring.',
    tags: ['CI/CD', 'Docker', 'Kubernetes'],
    stages: [
      { id: 'ci', title: 'CI/CD', steps: [ { id: 'pipelines', title: 'Pipelines (GitHub Actions/GitLab CI)' } ] },
      { id: 'containers', title: 'Containers', steps: [ { id: 'docker', title: 'Docker & Compose' }, { id: 'k8s', title: 'Kubernetes Basics' } ] },
      { id: 'iac', title: 'IaC', steps: [ { id: 'terraform', title: 'Terraform' } ] },
      { id: 'obs', title: 'Observability', steps: [ { id: 'metrics', title: 'Logs/Metrics/Tracing' } ] },
    ],
  },
  {
    id: 'cloud-aws',
    title: 'AWS Cloud Roadmap',
    level: 'beginner',
    description: 'Core AWS services, networking, serverless, and security.',
    tags: ['AWS', 'Cloud'],
    stages: [
      { id: 'core', title: 'Core Services', steps: [ { id: 'compute', title: 'EC2/Lambda' }, { id: 'storage', title: 'S3' } ] },
      { id: 'db', title: 'Databases', steps: [ { id: 'rds', title: 'RDS/DynamoDB' } ] },
      { id: 'ops', title: 'Ops', steps: [ { id: 'iam', title: 'IAM & Security' } ] },
    ],
  },
  {
    id: 'python',
    title: 'Python Roadmap',
    level: 'beginner',
    description: 'Syntax, standard library, packaging, and frameworks.',
    tags: ['Python'],
    stages: [
      { id: 'basics', title: 'Basics', steps: [ { id: 'syntax', title: 'Syntax', resources: [{ label: 'Python Tutorial', href: 'https://docs.python.org/3/tutorial/' }] } ] },
      { id: 'packages', title: 'Packages', steps: [ { id: 'pip', title: 'Pip & Vennpm' } ] },
      { id: 'web', title: 'Web', steps: [ { id: 'fastapi', title: 'FastAPI/Django' } ] },
    ],
  },
  {
    id: 'java',
    title: 'Java Roadmap',
    level: 'beginner',
    description: 'Core Java, JVM, build tools, and Spring.',
    tags: ['Java', 'Spring'],
    stages: [
      { id: 'core', title: 'Core', steps: [ { id: 'syntax', title: 'Syntax & OOP' } ] },
      { id: 'ecosystem', title: 'Ecosystem', steps: [ { id: 'spring', title: 'Spring Boot' } ] },
    ],
  },
  {
    id: 'javascript-roadmap',
    title: 'JavaScript Roadmap',
    level: 'beginner',
    description: 'Language fundamentals, DOM, async, and tooling.',
    tags: ['JavaScript'],
    stages: [
      { id: 'syntax', title: 'Syntax', steps: [ { id: 'fundamentals', title: 'Basics', resources: [{ label: 'Learn → JavaScript', href: '/learn/javascript' }] } ] },
      { id: 'browser', title: 'Browser', steps: [ { id: 'dom', title: 'DOM & Events' } ] },
      { id: 'async', title: 'Async', steps: [ { id: 'promises', title: 'Promises/Async-Await' } ] },
    ],
  },
  {
    id: 'typescript-roadmap',
    title: 'TypeScript Roadmap',
    level: 'beginner',
    description: 'Types, tooling, and React/Node usage.',
    tags: ['TypeScript'],
    stages: [
      { id: 'types', title: 'Types', steps: [ { id: 'basics', title: 'Basic Types', resources: [{ label: 'Learn → TypeScript', href: '/learn/typescript' }] } ] },
      { id: 'tooling', title: 'Tooling', steps: [ { id: 'tsconfig', title: 'TSConfig' } ] },
    ],
  },
  {
    id: 'go',
    title: 'Go Roadmap',
    level: 'beginner',
    description: 'Go syntax, concurrency, and web frameworks.',
    tags: ['Go'],
    stages: [
      { id: 'basics', title: 'Basics', steps: [ { id: 'syntax', title: 'Syntax & Modules' } ] },
      { id: 'conc', title: 'Concurrency', steps: [ { id: 'goroutines', title: 'Goroutines/Channels' } ] },
    ],
  },
  {
    id: 'rust',
    title: 'Rust Roadmap',
    level: 'intermediate',
    description: 'Ownership, lifetimes, and ecosystem.',
    tags: ['Rust'],
    stages: [
      { id: 'ownership', title: 'Ownership', steps: [ { id: 'borrow', title: 'Borrow Checker' } ] },
      { id: 'ecosystem', title: 'Ecosystem', steps: [ { id: 'cargo', title: 'Cargo/Crates' } ] },
    ],
  },
  {
    id: 'cpp',
    title: 'C++ Roadmap',
    level: 'advanced',
    description: 'Modern C++ (11/14/17/20), memory, and tooling.',
    tags: ['C++'],
    stages: [
      { id: 'core', title: 'Core', steps: [ { id: 'memory', title: 'Memory & RAII' } ] },
      { id: 'modern', title: 'Modern C++', steps: [ { id: 'templates', title: 'Templates/STD' } ] },
    ],
  },
  {
    id: 'kotlin',
    title: 'Kotlin Roadmap',
    level: 'beginner',
    description: 'Kotlin syntax and Android/Server usage.',
    tags: ['Kotlin'],
    stages: [
      { id: 'lang', title: 'Language', steps: [ { id: 'syntax', title: 'Syntax' } ] },
      { id: 'android', title: 'Android', steps: [ { id: 'jetpack', title: 'Jetpack/Compose' } ] },
    ],
  },
  {
    id: 'swift-lang',
    title: 'Swift Roadmap',
    level: 'beginner',
    description: 'Swift syntax and iOS frameworks.',
    tags: ['Swift'],
    stages: [
      { id: 'lang', title: 'Language', steps: [ { id: 'syntax', title: 'Syntax & OOP' } ] },
      { id: 'ios', title: 'iOS', steps: [ { id: 'swiftui', title: 'SwiftUI/UIKit' } ] },
    ],
  },
  {
    id: 'sql-roadmap',
    title: 'SQL Roadmap',
    level: 'beginner',
    description: 'Relational concepts, queries, and optimization.',
    tags: ['SQL'],
    stages: [
      { id: 'basics', title: 'Basics', steps: [ { id: 'select', title: 'SELECT/WHERE/JOIN', resources: [{ label: 'SQL Tutorial', href: 'https://www.w3schools.com/sql/' }] } ] },
      { id: 'indexes', title: 'Indexes', steps: [ { id: 'perf', title: 'Performance Tuning' } ] },
    ],
  },
];

// Load any JSON files placed alongside this file and merge/override by id.
// Example: create data-analyst.json to override the built-in "data-analyst".
const jsonModules = import.meta.glob('./*.json', { eager: true }) as Record<string, any>;

const jsonRoadmaps: Roadmap[] = Object.values(jsonModules)
  .map((mod: any) => (mod?.default ?? mod) as Roadmap)
  .filter(Boolean);

const byId = new Map<string, Roadmap>();
for (const r of baseRoadmaps) byId.set(r.id, r);
for (const r of jsonRoadmaps) byId.set(r.id, r);

export const roadmaps: Roadmap[] = Array.from(byId.values());
