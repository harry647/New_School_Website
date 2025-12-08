# CORS and Service Worker Error Solutions

## Quick Fixes (Try in this order)

### 1. **Clear Browser Data**
```bash
# In your browser DevTools (F12):
# 1. Go to Application/Storage tab
# 2. Click "Clear storage"
# 3. Uncheck everything except "Service Workers"
# 4. Click "Clear site data"
```

### 2. **Disable Service Workers Temporarily**
```javascript
// Add this to your HTML before other scripts:
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}
```

### 3. **Check for Browser Extensions**
- Open browser in Incognito/Private mode
- If errors disappear, disable extensions one by one
- Common culprits: ad blockers, privacy extensions, developer tools

## Code Fixes

### 1. **Add CORS Headers to Your Server**
Update your `server.js` to add CORS middleware:

```javascript
// Add this after your imports
import cors from 'cors';

// Enable CORS
app.use(cors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    credentials: true
}));
```

### 2. **Implement Request Interception**
Add error handling for failed requests:

```javascript
// Add to your main JavaScript file
window.addEventListener('unhandledrejection', function(event) {
    console.warn('Unhandled promise rejection:', event.reason);
    
    // Check if it's a CORS error
    if (event.reason && event.reason.message && 
        event.reason.message.includes('CORS')) {
        console.log('CORS error detected - likely from third-party script');
        event.preventDefault(); // Prevent the error from showing
    }
});
```

## Identifying the Source

To find what's making the request:

1. **Open DevTools → Network tab**
2. **Reload the page**
3. **Look for requests to `reasonlabsapi.com`**
4. **Check the "Initiator" column** to see which script made the request

## If It's a Browser Extension

1. Open `chrome://extensions/` (Chrome) or `about:addons` (Firefox)
2. Disable extensions one by one
3. Refresh your site after each disable
4. The extension making the request will be identified when errors stop