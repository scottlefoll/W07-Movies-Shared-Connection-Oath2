const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const authMiddleware = require('./middleware/auth');
const session = require('express-session');
const passport = require('passport');

// Enable CORS
app.use(cors());

// Initialize passport and session middleware
app.use(session({
    secret: 'rumpelstiltskin',
    resave: false,
    saveUninitialized: false
}));
app.use(authMiddleware.initialize());
app.use(authMiddleware.session());

// Protect your routes with the OAuth 2.0 middleware
app.use('/api/movies', authMiddleware.authenticate('oauth2'));
app.use(bodyParser.json());
// const router = express.Router();
// router.use('/', require('./swagger'));
app.use(express.json());
require('dotenv').config();

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const coll = process.env.DB_COLLECTION;
const routes = require('./routes/movies-routes');

app.use('/api/movies', routes);
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

// Require the connect function from your db.js module and store it in a constant called connect
const { connect } = require('./db/db.js');

// Use an immediately-invoked function expression (IIFE) to connect to the database, then start the server
(async () => {
    try {
      // Call the connect function and store the returned connection object in app.locals.db
      const db = await connect(uri, dbName);
        app.locals.db = db;
        app.locals.uri = uri;
        app.use('/', routes);
        app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
      });
    } catch (err) {
      console.error('Error starting server:', err);
    }
  })();

