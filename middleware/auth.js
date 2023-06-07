const { google } = require('googleapis');
const express = require('express');
const session = require('express-session');
const app = express();
const routes = require('express').Router();
const passport = require('passport');
// const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: OAuth2Strategy } = require('passport-oauth2');

// Set up session middleware
app.use(
    session({
      secret: 'rumplestiltskin',
      resave: false,
      saveUninitialized: true,
    })
  );

// Set up OAuth 2.0 credentials
const credentials = {
    client_id: '41653702827-4o4iaemg9qm1bco4ega68t8ororo411n.apps.googleusercontent.com',
    client_secret: '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',
    redirect_uris: 'https://cse341-spring23-mongoose-shared.onrender.com/callback',
};

  // Create an OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[0]
 );

// Generate the URL for the consent screen
const scopes = [
    'https://www.googleapis.com/auth/mongodb.write', // Scope for write access to movies
    'https://www.googleapis.com/auth/mongodb.delete',    // Add your other required scopes here
  ];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['mongodb.write', 'mongodb.delete']
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
        tokenURL: 'https://accounts.google.com/o/oauth2/token',
        clientID: '41653702827-4o4iaemg9qm1bco4ega68t8ororo411n.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'https://cse341-spring23-mongoose-shared.onrender.com/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        // Your authentication logic here
      }
    )
  );

  // Serialize and deserialize user objects
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });


// Redirect users to the consent screen
app.get('/login', (req, res, next) => {
    res.redirect(authUrl);
});

// Handle the callback from the consent screen
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
      // Exchange the authorization code for an access token
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Store the access token and scopes in the session or your preferred storage mechanism
      req.session.accessToken = tokens.access_token;
      req.session.scopes = scopes;

      // Redirect the user to a protected route or the home page
      res.redirect('/protected');
    } catch (error) {
      console.error('Error retrieving access token:', error);
      res.status(500).send('Error retrieving access token');
    }
  });

  function authenticate(strategy) {
    return (req, res, next) => {
      passport.authenticate(strategy, (err, user) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.redirect('/login');
        }
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          next(); // Invoke next() here
        });
      })(req, res, next); // Add (req, res, next) here
    };
  }

module.exports = {
    oauth2Client,
    authenticate,
    scopes,
    app,
};


