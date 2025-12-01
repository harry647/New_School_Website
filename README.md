"# New_School_Website"

project/
│
├─ server.js
├─ routes/
│   ├─ auth.js          # login/logout/register
│   ├─ portal.js        # e-learning, clubs, notifications
│   └─ api.js           # REST endpoints
│
├─ middleware/
│   ├─ authMiddleware.js  # check login, roles
│   ├─ errorHandler.js    # centralized error handling
│   └─ logger.js          # request logging
│
├─ validators/
│   ├─ authValidator.js   # login/register input validation
│   └─ portalValidator.js
│
├─ static/               # HTML pages
├─ css/
├─ js/
├─ assets/
└─ data/
 
