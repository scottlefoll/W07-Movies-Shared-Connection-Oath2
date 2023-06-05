const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

// Configure the OAuth 2.0 strategy
passport.use(
  'oauth2',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenURL: 'https://accounts.google.com/o/oauth2/token', // Update with the actual token URL
      clientID: '41653702827-4o4iaemg9qm1bco4ega68t8ororo411n.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'https://cse341-spring23-w07-mongoose-shared.onrender.com/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log('oauth2');
        try {

          // Make a request to Google's API to get the user profile
          const userProfileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          console.log('accessToken', accessToken);
          console.log('refreshToken', refreshToken);
          if (!userProfileResponse.ok) {
            throw new Error('Failed to retrieve user profile');
          }

          const userProfile = await userProfileResponse.json();
          console.log('userProfile', userProfile);

          // Once you have the user profile, create a user object with the retrieved information
          const user = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            // Add any other relevant user information you want to store
          };
          console.log('user', user);

          // Call the `done` function with the authenticated user
          done(null, user);
        } catch (error) {
          // If an error occurs during authentication or user profile retrieval, pass the error to `done`
          done(error);
        }
      }
    )
  );

module.exports = passport;