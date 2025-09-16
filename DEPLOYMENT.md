# Deployment Guide

This guide covers deploying the RTO Queue System to production environments.

## Production Checklist

### 1. Environment Configuration

#### Backend Environment Variables
Create `backend/.env` with production values:

```env
# Database Configuration
PG_USER=your_production_db_user
PG_PASSWORD=your_secure_production_password
PG_HOST=your_production_db_host
PG_DATABASE=rto_queue_system_prod
PG_PORT=5432

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Secret (use a strong, random secret)
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
```

#### Frontend Environment Variables
Create `frontend/.env`:

```env
REACT_APP_API_BASE=https://your-api-domain.com
```

### 2. Database Setup

#### Production Database
```sql
-- Create production database
CREATE DATABASE rto_queue_system_prod;

-- Create production user
CREATE USER rto_prod_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rto_queue_system_prod TO rto_prod_user;

-- Connect to the database
\c rto_queue_system_prod;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rto_prod_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rto_prod_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rto_prod_user;
```

#### Run Schema
```bash
psql -U rto_prod_user -d rto_queue_system_prod -f backend/src/DB/schema.sql
```

### 3. Security Considerations

#### Backend Security
1. **CORS Configuration**: Update CORS to allow only your frontend domain
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **Input Validation**: Ensure all inputs are validated
4. **Error Handling**: Don't expose sensitive error details

#### Database Security
1. **Connection Security**: Use SSL connections
2. **User Permissions**: Use least privilege principle
3. **Backup Strategy**: Implement regular backups
4. **Monitoring**: Set up database monitoring

### 4. Deployment Options

#### Option 1: Traditional VPS/Server

1. **Server Requirements**:
   - Ubuntu 20.04+ or CentOS 8+
   - Node.js 16+
   - PostgreSQL 12+
   - Nginx (for reverse proxy)

2. **Setup Steps**:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PostgreSQL
   sudo apt-get install postgresql postgresql-contrib

   # Install Nginx
   sudo apt-get install nginx

   # Clone and setup project
   git clone <your-repo>
   cd RTO-Automated-Queue-System
   chmod +x setup.sh
   ./setup.sh

   # Build frontend
   cd frontend
   npm run build

   # Setup PM2 for process management
   npm install -g pm2
   cd ../backend
   pm2 start src/index.js --name "rto-backend"
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/frontend/build;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api/ {
           proxy_pass http://localhost:3000/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Option 2: Docker Deployment

1. **Create Dockerfile for Backend**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Create Dockerfile for Frontend**:
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Docker Compose**:
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:13
       environment:
         POSTGRES_DB: rto_queue_system
         POSTGRES_USER: rto_user
         POSTGRES_PASSWORD: secure_password
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./backend/src/DB/schema.sql:/docker-entrypoint-initdb.d/schema.sql
       ports:
         - "5432:5432"

     backend:
       build: ./backend
       environment:
         PG_USER: rto_user
         PG_PASSWORD: secure_password
         PG_HOST: db
         PG_DATABASE: rto_queue_system
         PG_PORT: 5432
       depends_on:
         - db
       ports:
         - "3000:3000"

     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend

   volumes:
     postgres_data:
   ```

#### Option 3: Cloud Deployment

##### Heroku
1. **Backend**:
   ```bash
   # Install Heroku CLI
   # Create Heroku app
   heroku create your-app-name
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:hobby-dev
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   
   # Deploy
   git push heroku main
   ```

2. **Frontend**:
   ```bash
   # Build and deploy to Netlify/Vercel
   cd frontend
   npm run build
   # Upload build folder to hosting service
   ```

##### AWS/GCP/Azure
- Use managed services like RDS for PostgreSQL
- Deploy backend to EC2/App Engine/App Service
- Use S3/Cloud Storage for frontend static files
- Set up load balancers and CDN

### 5. Monitoring and Maintenance

#### Health Checks
Add health check endpoints:

```javascript
// In backend/src/index.js
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

#### Logging
Implement proper logging:

```javascript
// Install winston
npm install winston

// Configure logging
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Backup Strategy
```bash
# Daily database backup
pg_dump -U rto_prod_user -d rto_queue_system_prod > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U rto_prod_user -d rto_queue_system_prod > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### 6. SSL/HTTPS Setup

#### Using Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Performance Optimization

#### Database Optimization
1. **Indexes**: Ensure proper indexes are in place
2. **Connection Pooling**: Use connection pooling
3. **Query Optimization**: Monitor slow queries

#### Frontend Optimization
1. **Code Splitting**: Implement React.lazy()
2. **Caching**: Set up proper caching headers
3. **CDN**: Use CDN for static assets

### 8. Testing in Production

#### Pre-deployment Testing
1. **Load Testing**: Use tools like Artillery or JMeter
2. **Security Testing**: Run security scans
3. **Database Testing**: Test with production-like data

#### Post-deployment Monitoring
1. **Uptime Monitoring**: Use services like UptimeRobot
2. **Error Tracking**: Implement error tracking (Sentry)
3. **Performance Monitoring**: Use APM tools

### 9. Rollback Strategy

#### Database Rollback
```bash
# Restore from backup
psql -U rto_prod_user -d rto_queue_system_prod < backup_20231201.sql
```

#### Application Rollback
```bash
# Using PM2
pm2 stop rto-backend
pm2 start rto-backend --update-env

# Using Docker
docker-compose down
docker-compose up -d --scale backend=0
docker-compose up -d --scale backend=1
```

### 10. Maintenance Schedule

#### Daily
- Monitor system health
- Check error logs
- Verify backups

#### Weekly
- Review performance metrics
- Update dependencies
- Security patches

#### Monthly
- Full system backup
- Performance optimization review
- Security audit

## Troubleshooting Production Issues

### Common Issues

1. **Database Connection Issues**:
   - Check connection string
   - Verify database is running
   - Check firewall settings

2. **Memory Issues**:
   - Monitor memory usage
   - Implement memory limits
   - Use PM2 cluster mode

3. **Performance Issues**:
   - Monitor response times
   - Check database queries
   - Optimize frontend bundle

### Emergency Procedures

1. **System Down**:
   - Check server status
   - Restart services
   - Check logs for errors

2. **Database Issues**:
   - Check PostgreSQL status
   - Restore from backup if needed
   - Contact database administrator

3. **Security Breach**:
   - Isolate affected systems
   - Change all passwords
   - Review access logs
   - Notify stakeholders
