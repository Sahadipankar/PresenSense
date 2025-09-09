# PresenSense Deployment Guide

## Quick Start

### Development Setup
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy example environment file
   copy .env.example .env.local
   
   # Edit .env.local with your API URL
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Public Page: `http://localhost:5175/`
   - Admin Page: `http://localhost:5175/admin`
   - Admin login: `admin` / `admin123`

## Production Deployment

### Build Process
```bash
# Install dependencies
npm install

# Create production build
npm run build

# Preview production build (optional)
npm run preview
```

### Server Requirements
- **Node.js**: 16+ for build process
- **Static Hosting**: Any static file server
- **API Backend**: Running face recognition server
- **HTTPS**: Required for camera access in production

### Environment Configuration

**Production .env**:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### Deployment Options

#### 1. Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

#### 2. Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 3. GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run build && npm run deploy
```

#### 4. Docker
```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Handle React Router client-side routing
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://your-backend-server:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

## Security Considerations

### Production Checklist
- [ ] HTTPS enabled for camera access
- [ ] API endpoints secured with authentication
- [ ] Admin credentials changed from defaults
- [ ] Content Security Policy configured
- [ ] CORS properly configured on backend
- [ ] Error logging implemented
- [ ] Health checks configured

### Camera Permissions
- **HTTPS Required**: Browsers require HTTPS for camera access
- **User Consent**: Users must grant camera permissions
- **Error Handling**: Graceful fallbacks for denied permissions

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install --save-dev rollup-plugin-analyzer
```

### Caching Strategy
- **Static Assets**: Long-term caching with hash-based names
- **API Responses**: Appropriate cache headers
- **Service Worker**: Optional for offline capability

## Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Check HTTPS requirement
   - Verify camera permissions
   - Test in different browsers

2. **API Connection Failed**
   - Verify VITE_API_BASE_URL
   - Check CORS configuration
   - Confirm backend server status

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version (16+)
   - Verify all dependencies

### Debug Mode
```bash
# Enable debug logging
DEBUG=vite:* npm run dev
```

## Monitoring

### Health Checks
- **Frontend**: Check if app loads
- **Backend API**: Verify `/health` endpoint
- **Camera Access**: Test in target browsers

### Analytics
Consider adding:
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)

## Support

### Browser Support
- **Chrome 80+**: Full support
- **Firefox 78+**: Full support  
- **Safari 14+**: Full support
- **Edge 80+**: Full support

### Mobile Support
- **iOS Safari 14+**: Full support
- **Android Chrome 80+**: Full support
- **Responsive Design**: All screen sizes

---

For additional support, check the README.md or create an issue on the repository.
