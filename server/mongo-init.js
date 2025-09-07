// MongoDB initialization script for DevSwap.live
db = db.getSiblingDB('devswap');

// Create collections with indexes for better performance
db.createCollection('users');
db.createCollection('sessions');
db.createCollection('lessonplans');
db.createCollection('otps');

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "skills.name": 1 });
db.users.createIndex({ "createdAt": 1 });

// Create indexes for sessions collection
db.sessions.createIndex({ "participants": 1 });
db.sessions.createIndex({ "status": 1 });
db.sessions.createIndex({ "createdAt": 1 });

// Create indexes for lesson plans collection
db.lessonplans.createIndex({ "skill": 1 });
db.lessonplans.createIndex({ "level": 1 });
db.lessonplans.createIndex({ "createdAt": 1 });

// Create indexes for OTPs collection
db.otps.createIndex({ "email": 1 });
db.otps.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

print('DevSwap.live database initialized successfully!');
