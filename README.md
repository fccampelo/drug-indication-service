# Drug Indication Service

[![CI](https://github.com/your-username/drug-indication-service/workflows/CI/badge.svg)](https://github.com/your-username/drug-indication-service/actions)
[![CD](https://github.com/your-username/drug-indication-service/workflows/CD/badge.svg)](https://github.com/your-username/drug-indication-service/actions)
[![codecov](https://codecov.io/gh/your-username/drug-indication-service/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/drug-indication-service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

API for mapping drug indications to ICD-10 codes.

## 📋 Features

- **JWT Authentication** with user roles
- **Complete CRUD** for drug indications
- **ICD-10 mapping** support
- **Advanced search** with filters
- **Robust data validation**
- **Interactive Swagger documentation**
- **Complete unit and E2E tests**
- **Docker** for development

## 🚀 Technologies

- **Node.js** + **TypeScript**
- **Express.js** with security middleware
- **MongoDB** + **Mongoose**
- **Redis** for high-performance caching
- **JWT** for authentication
- **Jest** for testing
- **Swagger** for documentation
- **Docker** + **Docker Compose**

## 📦 Installation

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### Local Setup

```bash
# Clone repository
git clone <repository-url>
cd drug-indication-service

# Install dependencies
npm install

# Configure environment variables
cp env.example .env
# Edit .env with your configurations

# Start MongoDB and Redis with Docker
docker-compose up -d mongo redis

# Run migrations/seeds
npm run seed:dupixent

# Start development server
npm run dev
```

### Docker Setup

```bash
# Start all services (including Redis)
docker-compose up -d

# Run data seed
docker-compose exec api npm run seed:dupixent
```

## 🗄️ Database Structure

### Collection: `drugIndications`

```typescript
interface IDrugIndication {
  drug: string;                    // Drug name
  sourceUrl: string;               // Source URL
  extractedSection: string;        // Extracted section from label
  indication: string;              // Indication name
  description: string;             // Detailed description
  synonyms?: string[];             // Indication synonyms
  icd10Codes: string[];           // Mapped ICD-10 codes
  ageRange: string;               // Age range
  limitations?: string;           // Usage limitations
  mappingStatus: 'mapped' | 'unmapped' | 'pending' | 'review';
  mappingNotes?: string;          // Mapping notes
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes

- **Unique**: `{ drug: 1, indication: 1 }` - Prevents duplicates
- **Search**: `{ drug: 1 }`, `{ icd10Codes: 1 }`, `{ mappingStatus: 1 }`

## 🔌 API Endpoints

### Authentication

```http
POST /api/v1/auth/register    # Register user
POST /api/v1/auth/login       # Login
POST /api/v1/auth/refresh     # Refresh token
```

### Drug Indications (Complete CRUD)

#### Create Indication
```http
POST /api/v1/drug-indications
Authorization: Bearer <token>
Content-Type: application/json

{
  "drug": "Dupixent",
  "sourceUrl": "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dupixent",
  "extractedSection": "INDICATIONS AND USAGE section...",
  "indication": "Atopic Dermatitis",
  "description": "Treatment of moderate-to-severe atopic dermatitis",
  "synonyms": ["Eczema", "Dermatitis"],
  "icd10Codes": ["L20.9"],
  "ageRange": "≥6 months",
  "limitations": "Use with or without topical corticosteroids",
  "mappingStatus": "mapped",
  "mappingNotes": "Direct mapping confirmed"
}
```

#### List Indications (with filters and pagination)
```http
GET /api/v1/drug-indications?page=1&limit=10&drug=Dupixent&mappingStatus=mapped
```

#### Search by ID
```http
GET /api/v1/drug-indications/:id
```

#### Search by Drug
```http
GET /api/v1/drug-indications/drugs/Dupixent
```

#### Search by ICD-10 Code
```http
GET /api/v1/drug-indications/icd10/L20.9
```

#### Text Search
```http
GET /api/v1/drug-indications/search?q=atopic
```

#### Statistics
```http
GET /api/v1/drug-indications/stats
```

#### Update Indication
```http
PUT /api/v1/drug-indications/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "mappingStatus": "review"
}
```

#### Delete Indication
```http
DELETE /api/v1/drug-indications/:id
Authorization: Bearer <token>
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e
```

### Tests with Coverage
```bash
npm run test:coverage
```

### Specific Tests
```bash
# Only drug indication tests
npm test -- --testPathPattern=drug-indication

# Only service unit tests
npm test -- --testPathPattern=drug-indication.service.test.ts
```

## 📊 Sample Data (Dupixent)

The project includes a seed script with 7 Dupixent indications:

```bash
# Run seed
npm run seed:dupixent

# Or via bash script
./scripts/setup-dupixent-database.sh
```

### Included Indications:
1. **Atopic Dermatitis** (L20.9)
2. **Asthma** (J45.909)
3. **Chronic Rhinosinusitis with Nasal Polyps** (J32.4)
4. **Eosinophilic Esophagitis** (K20.0)
5. **Prurigo Nodularis** (L28.1)
6. **Chronic Obstructive Pulmonary Disease** (J44.9)
7. **Chronic Spontaneous Urticaria** (L50.1)

## 🔍 Validations

### Required Fields
- `drug`: 2-100 characters
- `sourceUrl`: Valid URL
- `extractedSection`: minimum 10 characters
- `indication`: 2-200 characters
- `description`: minimum 10 characters
- `icd10Codes`: array with at least 1 valid code
- `ageRange`: 2-50 characters

### ICD-10 Format
- Pattern: `^[A-Z]\d{2}(\.\d{1,2})?$`
- Valid examples: `L20.9`, `J45.909`, `K20`

### Mapping Status
- `mapped`: Confirmed mapping
- `unmapped`: No mapping
- `pending`: Awaiting review
- `review`: Needs review

## 📚 Documentation

### Swagger UI
Access interactive documentation at:
```
http://localhost:3000/api-docs
```

### Health Check
```http
GET /health
```

## 🐳 Docker

### Development
```bash
# Start only MongoDB
docker-compose up -d mongo

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production
```bash
# Build image
docker build -t drug-indication-service .

# Run container
docker run -p 3000:3000 --env-file .env drug-indication-service
```

## 🔧 Available Scripts

```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run all tests
npm run test:watch   # Tests in watch mode
npm run lint         # Check code with ESLint
npm run lint:fix     # Fix lint issues
npm run seed:dupixent # Run Dupixent seed
```

## 🌍 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb://admin:password123@localhost:27017/drug-indication-service?authSource=admin

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=3600

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, open an issue on GitHub or contact:
- Email: support@drug-indication-service.com
- GitHub Issues: [Link to issues]

## 🔄 Redis Cache System

### Cache Features

The system implements intelligent caching with Redis to optimize performance:

#### **Cache Strategy**
- **Cache-Aside Pattern**: Search cache first, if not found search database
- **Automatic Invalidation**: Removes cache when data is updated/deleted
- **Configurable TTL**: Cache data lifetime (default: 1 hour)

#### **Cached Data**
- ✅ **Search by ID**: `drug_indication:id:{id}`
- ✅ **Search by Drug**: `drug_indication:drug:{drugName}`
- ✅ **Search by ICD-10**: `drug_indication:icd10:{code}`
- ✅ **Text Search**: `drug_indication:search:{query}`
- ✅ **Filtered Lists**: `drug_indication:list:{filters}`
- ✅ **Statistics**: `drug_indication:stats`

#### **Invalidation Rules**
```typescript
// When CREATING new indication
- Invalidates: ALL caches (stats, lists, etc.)

// When UPDATING indication
- Invalidates: Specific cache by ID
- Invalidates: Cache by drug
- Invalidates: ALL related caches

// When DELETING indication
- Invalidates: Specific cache by ID
- Invalidates: Cache by drug  
- Invalidates: ALL related caches
```

#### **Redis Configuration**
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=3600  # 1 hour in seconds
```

#### **Performance Benefits**
- 🚀 **Latency reduction**: Responses up to 10x faster
- 📊 **Lower database load**: Reduces MongoDB queries
- 🔄 **Scalability**: Supports more concurrent users
- 💾 **Efficiency**: Smart cache with automatic invalidation

#### **Cache Monitoring**
```http
# Health check includes Redis status
GET /health

Response:
{
  "success": true,
  "services": {
    "redis": true,
    "database": "connected"
  }
}
```

#### **Cache Usage Example**
```typescript
// 1st Request - Search database + store in cache
GET /api/v1/drug-indications/drugs/Dupixent
// Time: ~50ms

// 2nd Request - Return from cache
GET /api/v1/drug-indications/drugs/Dupixent  
// Time: ~5ms (10x faster!)

// After update - Cache automatically invalidated
PUT /api/v1/drug-indications/123
// Cache removed, next search will be from database again
```
