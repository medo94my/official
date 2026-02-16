# PostgreSQL Migration Guide

## Overview
This guide documents the migration from SQLite to PostgreSQL for improved performance, scalability, and production readiness.

## What Changed

### 1. Database System
- **Before**: SQLite (file-based database)
- **After**: PostgreSQL 16 (robust, production-ready database)

### 2. Benefits
- ✅ Better concurrent user support
- ✅ Improved data integrity and ACID compliance
- ✅ Advanced querying capabilities
- ✅ Better backup and replication options
- ✅ Production-ready scaling
- ✅ Better performance for complex queries

## Docker Compose Changes

### New PostgreSQL Service
A new `postgres` service has been added with:
- PostgreSQL 16 Alpine (lightweight)
- Persistent data storage via Docker volumes
- Health checks for reliable startup
- Automatic initialization

### Updated CMS Service
The Strapi CMS service now:
- Uses `pg` driver for PostgreSQL
- Connects to the `postgres` service
- Waits for database health before starting

## Configuration Files Updated

### 1. `docker-compose.yaml`
- Added `postgres` service
- Updated `cms` environment variables
- Added `postgres_data` volume
- Added health checks

### 2. `cms/package.json`
- Added `pg` dependency (PostgreSQL driver)

### 3. `cms/.env.example`
- Updated with PostgreSQL configuration
- Includes both PostgreSQL and SQLite examples

## How to Use

### Development with Docker Compose

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Check services are running**:
   ```bash
   docker-compose ps
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f cms
   docker-compose logs -f postgres
   ```

4. **Access Strapi Admin**:
   - Open: http://localhost:1337/admin
   - Create your first admin user

### Local Development (without Docker)

1. **Install PostgreSQL locally** (or use Docker for just the database):
   ```bash
   # Start only PostgreSQL
   docker-compose up -d postgres
   ```

2. **Configure CMS environment**:
   ```bash
   cd cms
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run Strapi in development**:
   ```bash
   npm run develop
   ```

## Database Management

### Connect to PostgreSQL

**Using Docker**:
```bash
docker-compose exec postgres psql -U strapi -d portfolio_db
```

**Using pgAdmin or any PostgreSQL client**:
- Host: localhost
- Port: 5432
- Database: portfolio_db
- Username: strapi
- Password: strapi_password_change_in_production

### Backup Database

```bash
docker-compose exec postgres pg_dump -U strapi portfolio_db > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U strapi portfolio_db < backup_20240101.sql
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volume
docker volume rm webapp_postgres_data

# Start fresh
docker-compose up -d
```

## Migration from SQLite

If you have existing data in SQLite that you want to migrate:

1. **Export data from Strapi admin** (recommended):
   - Go to Strapi admin panel
   - Use the built-in export functionality
   - Save your content types data

2. **Start with PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

3. **Import data**:
   - Use Strapi admin panel to re-import
   - Or use Strapi's data transfer tools

## Production Considerations

### Security
⚠️ **IMPORTANT**: Change these in production:
- `POSTGRES_PASSWORD`
- `DATABASE_PASSWORD`
- All JWT secrets and tokens in CMS environment

### Performance
- Adjust `DATABASE_POOL_MIN` and `DATABASE_POOL_MAX` based on load
- Monitor connection pool usage
- Consider read replicas for high traffic

### Backup Strategy
- Enable automated backups
- Use PostgreSQL's continuous archiving (WAL)
- Regular snapshot backups
- Test restore procedures

### Monitoring
- Monitor PostgreSQL metrics (connections, queries, cache hits)
- Set up alerts for long-running queries
- Monitor disk space for database volume

## Troubleshooting

### CMS won't start
```bash
# Check PostgreSQL is healthy
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# View CMS logs
docker-compose logs cms
```

### Connection refused
- Ensure PostgreSQL service is healthy
- Check network connectivity: `docker network ls`
- Verify environment variables in docker-compose.yaml

### Database initialization issues
```bash
# Remove and recreate
docker-compose down -v
docker-compose up -d
```

## Next Steps

After successful PostgreSQL setup:
1. ✅ Database upgraded to PostgreSQL
2. ⏳ Create Strapi content types
3. ⏳ Build API integration
4. ⏳ Connect frontend to Strapi
5. ⏳ Add React Query for data management
