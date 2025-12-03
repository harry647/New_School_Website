// ==================================================
// clubs-config.js – Configuration Management for Clubs
// ==================================================

export const CLUBS_CONFIG = {
  // API Settings
  api: {
    baseUrl: '/api/clubs',
    timeout: 10000, // 10 seconds
    retries: 3,
    cache: {
      enabled: true,
      ttl: 5 * 60 * 1000 // 5 minutes
    }
  },

  // Upload Settings
  upload: {
    maxFiles: 20,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      media: ['video/mp4', 'video/mov', 'audio/mp3', 'audio/wav']
    },
    uploadPath: 'uploads/clubs'
  },

  // UI Settings
  ui: {
    itemsPerPage: 12,
    animationDuration: 400,
    theme: {
      primaryColor: '#0175C2',
      secondaryColor: '#0b2d5e',
      accentColor: '#ffd700'
    }
  },

  // Validation Rules
  validation: {
    name: {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s'-]+$/
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      kenyaPattern: /^(\+254|0)[71]\d{8}$/
    },
    reason: {
      maxLength: 500
    }
  },

  // Feature Flags
  features: {
    enableJoinApplications: true,
    enableFileUploads: true,
    enableEventRegistration: true,
    enableSearch: true,
    enableFiltering: true,
    enableGallery: true
  },

  // Error Messages
  messages: {
    errors: {
      network: 'Network error. Please check your connection and try again.',
      server: 'Server error. Please try again later.',
      validation: 'Please check your input and try again.',
      auth: 'You must be logged in to access this feature.',
      duplicate: 'You already have a pending application for this club.',
      upload: {
        noFiles: 'Please select files to upload.',
        invalidType: 'Invalid file type. Please check allowed formats.',
        tooLarge: 'File is too large. Please check size limits.',
        failed: 'Upload failed. Please try again.'
      }
    },
    success: {
      join: 'Application submitted successfully! We\'ll contact you soon.',
      upload: 'Files uploaded successfully.',
      load: 'Data loaded successfully.'
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableClientLogging: false,
    logToConsole: true,
    logToFile: true
  },

  // Performance Settings
  performance: {
    debounceSearch: 300, // ms
    lazyLoadThreshold: 100, // px
    cacheImages: true,
    preloadCritical: true
  }
};

// Helper functions
export const getConfig = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], CLUBS_CONFIG);
};

export const isFeatureEnabled = (feature) => {
  return getConfig(`features.${feature}`) === true;
};

export const getValidationRule = (field) => {
  return getConfig(`validation.${field}`);
};

export const getMessage = (type, key) => {
  return getConfig(`messages.${type}.${key}`);
};

export default CLUBS_CONFIG;