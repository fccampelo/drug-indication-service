db = db.getSiblingDB('drug-indication-service');

db.createCollection('users');
db.createCollection('drugindications');

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

db.drugindications.createIndex({ drugName: 1 });
db.drugindications.createIndex({ createdAt: -1 });
db.drugindications.createIndex({ 'indications.icd10Mappings.code': 1 });
db.drugindications.createIndex({ drugName: 1, labelUrl: 1 }, { unique: true });


const adminUser = {
  email: 'admin@drug-indication-service.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // hashed 'admin123'
  roles: ['admin', 'user'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Insert admin user if it doesn't exist
const existingAdmin = db.users.findOne({ email: adminUser.email });
if (!existingAdmin) {
  db.users.insertOne(adminUser);
  print('Default admin user created');
} else {
  print('Admin user already exists');
}

print('MongoDB initialization completed'); 