const session = require('express-session');

function configureSession(app) {
    app.use(
        session({
            secret: '12345678',  // Should be a secure key in production
            resave: false,
            saveUninitialized: false,
        })
    );
}

module.exports = { configureSession };
