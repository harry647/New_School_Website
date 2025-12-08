# Tailwind CSS Production Setup Guide

## Current Issue
You're using `https://cdn.tailwindcss.com` which is **only suitable for development/prototyping**, not production.

## Production Solutions

### Option 1: PostCSS Setup (Recommended)

1. **Install Tailwind CSS**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Configure Tailwind**
   Create/update `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: [
       "./static/**/*.{html,js}",
       "./**/*.{html,js}"
     ],
     theme: {
       extend: {
         fontFamily: {
           'sans': ['Inter', 'system-ui', 'sans-serif'],
           'display': ['Playfair Display', 'serif'],
         },
         colors: {
           'primary': {
             50: '#eff6ff',
             100: '#dbeafe',
             500: '#0175C2',
             600: '#015a99',
             700: '#0b2d5e',
             900: '#0a1e3a',
           },
           'accent': {
             400: '#ffed4e',
             500: '#ffd700',
             600: '#e6c200',
           }
         }
       },
     },
     plugins: [],
   }
   ```

3. **Create CSS File**
   Create `css/tailwind.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* Your custom styles */
   .bg-gradient-primary { 
     background: linear-gradient(135deg, #0b2d5e 0%, #0175C2 100%); 
   }
   ```


4. **Build Process**
   Add to your `package.json` scripts:
   ```json
   {
     "scripts": {
       "build:css": "npx tailwindcss -i ./css/tailwind.css -o ./css/app.css --watch",
       "build:css:prod": "NODE_ENV=production npx tailwindcss -i ./css/tailwind.css -o ./css/app.css --minify"
     }
   }
   ```

5. **Update HTML**
   Replace in all HTML files:
   ```html
   <!-- Remove this: -->
   <script src="https://cdn.tailwindcss.com"></script>
   
   <!-- Add this: -->
   <link rel="stylesheet" href="/css/app.css">
   ```

### Option 2: Tailwind CLI (Simple)

1. **Generate CSS File**
   ```bash
   npx tailwindcss -i ./css/tailwind.css -o ./css/app.css
   ```

2. **Include in HTML**
   ```html
   <link rel="stylesheet" href="/css/app.css">
   ```

### Option 3: CDN Fallback for Development

Add conditional loading:
```html
<script>
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
  }
</script>
```

## Benefits of Production Setup
- ✅ Faster loading times
- ✅ Smaller file sizes (unused CSS purged)
- ✅ Better SEO scores
- ✅ No external dependencies
- ✅ Consistent styling across environments

## Quick Fix for Your Current Site

For immediate improvement, update your HTML files:

1. **Download and include Tailwind locally**
2. **Purge unused CSS classes**
3. **Use the build process**