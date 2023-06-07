const { User } = require('../models/movie');
const passport = require('passport');
const routes = require('express').Router();
const userController = require('../controllers/user-controller');
const {param, query, validationResult} = require('express-validator');
const moviesController = require('../controllers/movies-controller');
const { scopes, oauth2Client, app, authenticate } = require('../middleware/auth');
const { validateMovieFields, validateMovieParamId } = require('../validators/movieValidator');
const curr_year = new Date().getFullYear();


// Define the required scopes
const requiredScopes = ['https://www.googleapis.com/auth/movies.write', 'https://www.googleapis.com/auth/movies.delete'];

routes.use(passport.initialize())
routes.use(passport.session())

routes.get('/', (req, res) => {
    res.send('Welcome to the MongoDB Movies API! Please enter a valid endpoint to continue (all parameters are case-insensitive): (/db (List of databases), /movies (List of all movies), /movies/:id (single movie by id, i.e. - avatar_2009 ), /title/:title (single movie by title, i.e. - avatar [case insensitive] ), /partial/:title (all movies by partial title, i.e. - avat [case insensitive] ), /director/:name (all movies by director name, i.e. - james cameron [case insensitive]), /create/:id (create movie), /update/:id (update movie), /delete/:id (delete movie)');
});


routes.get('/db', async (req, res, next) => {
    console.log('in /db');
    try {
      const collection = await moviesController.getDBList();
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });

routes.get('/movies', async (req, res, next) => {
    console.log('in /movies route');
    try {
      const collection = await moviesController.getMovies();
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });

// Route with movie ID validation
routes.get('/movies/:id', validateMovieParamId, async (req, res, next) => {
    console.log('in /movies/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
        const collection = await moviesController.getMovieById(req, res, req.params.id);
        res.send(collection);
    } catch (err) {
        next(err);
    }
});

// routes.get('/title/:Title', param('Title').notEmpty().isAlphanumeric().isLength({ max: 50 }), async (req, res, next) => {
routes.get('/title/:Title', [
    param('Title')
        .notEmpty()
        .withMessage('Title is required')
        .isAlphanumeric()
        .withMessage('Title is case insensitive, and must contain only alphanumeric characters')
        .isLength({ min: 2, max: 50 })
        .withMessage('Title must be at least 2 characters and not exceed 50 characters')
    ], async (req, res, next) => {
    console.log('in /movies/:title route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      const collection = await moviesController.getMovieByTitle(req, res, req.params.Title);
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });

// routes.get('/partial/:Title', param('Title').notEmpty().isAlphanumeric().isLength({ max: 50 }), async (req, res, next) => {
routes.get('/partial/:Title', [
    param('Title')
        .notEmpty()
        .withMessage('Partial title is required')
        .isAlphanumeric()
        .withMessage('Partial title is case insensitive, and must contain only alphanumeric characters')
        .isLength({ min: 2, max: 50 })
        .withMessage('Partial title must be at least 2 characters and not exceed 50 characters')
    ], async (req, res, next) => {
  console.log('in /movies/partial/:title route');
  const result = validationResult(req);
  if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
  }
  try {
    const collection = await moviesController.getMoviesByPartialTitle(req, res, req.params.Title);
    res.send(collection);
  } catch (err) {
    next(err);
  }
});


routes.get('/director/:name', [
    param('name')
        .matches(/^[A-Za-z]{2,}$/)
        .withMessage('Director name is case insensitive and may be partial, and must contain only alphabetic characters and have a minimum length of 2')
        .notEmpty()
        .withMessage('Director name is required')
    ], async (req, res, next) => {
            console.log('in /movies/director/:name route');
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }
            try {
                const collection = await moviesController.getMoviesByDirector(req, res, req.params.name);
                res.send(collection);
            } catch (err) {
                next(err);
            }
    });

routes.post('/create',  authenticate('oauth2'), validateMovieFields, async (req, res, next) => {
    console.log('in /movies/create route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    if (req.user && requiredScopes.every(scope => req.session.scopes.includes(scope))) {
        // Make API requests with the access token
        console.log('in /admin protected route');
        try {
            await moviesController.createMovie(req, res, next);
            res.send('Movies - protected create endpoint, Admin only. Create successful. Movie ID: ' + req.params.id);
        } catch (err) {
            res.status(500).send('Create failed. Movie Title: ' + req.body.title);
        }
    } else {
        res.status(401).send('Unauthorized.');
    }
  });

routes.put('/update/:id',  authenticate('oauth2'), validateMovieParamId, validateMovieFields, async (req, res, next) => {
    console.log('in /movies/update/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    if (req.user && requiredScopes.every(scope => req.session.scopes.includes(scope))) {
        // Make API requests with the access token
        console.log('in /admin protected route');
        try {
            await moviesController.updateMovie(req, res, req.params.id);
            res.send('Movies - protected update endpoint, Admin only. Update successful. Movie ID: ' + req.params.id);
        } catch (err) {
            res.status(500).send('Update failed. Movie ID: ' + req.params.id);
        }
    } else {
        res.status(401).send('Unauthorized.');
    }
  });

routes.delete('/delete/:id', authenticate('oauth2'), validateMovieParamId, async (req, res, next) => {
    console.log('in /movies/delete/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    if (req.user && requiredScopes.every(scope => req.session.scopes.includes(scope))) {
        // Make API requests with the access token
        console.log('in /admin protected route');
        try {
            await moviesController.deleteMovie(req, res, req.params.id);
            res.send('Movies - protected delete endpoint, Admin only. Delete successful. Movie ID: ' + req.params.id);
        } catch (err) {
            res.status(500).send('Delete failed. Movie ID: ' + req.params.id);
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

routes.delete('/delete/:id', authenticate('oauth2'), validateMovieParamId, async (req, res, next) => {
    console.log('in /movies/delete/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    if (req.user && requiredScopes.every(scope => req.session.scopes.includes(scope))) {
        // Make API requests with the access token
        console.log('in /admin protected route');
        try {
            await moviesController.deleteMovie(req, res, req.params.id);
            res.send('Movies - protected delete endpoint, Admin only. Delete successful. Movie ID: ' + req.params.id);
        } catch (err) {
            res.status(500).send('Delete failed. Movie ID: ' + req.params.id);
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

routes.get('/admin', authenticate('oauth2'), async (req, res, next) => {
    if (req.user && requiredScopes.every(scope => req.session.scopes.includes(scope))) {
        console.log('in /admin protected route');
        // Make API requests with the access token
        // Your API logic goes here
        res.send('Movies - protected endpoint, Admin only.');
    } else {
        res.status(401).send('Unauthorized');
    }
});

// // Example protected route
// routes.get('/members', authenticate('oauth2'), async (req, res, next) => {
//     if (req.user && req.session.scopes.includes('https://www.googleapis.com/auth/movies.read')) {
//         console.log('in /members protected route');
//         // Make API requests with the access token
//         // Your API logic goes here
//         res.send('Movies - protected endpoint, Members only.');
//     } else {
//         res.status(401).send('Unauthorized');
//     }
// });

// Example protected route
routes.get('/admin', authenticate('oauth2'), async (req, res, next) => {
    if (req.user && requiredScopes.every(scope => req.session.scopes.includes(scope))) {
        console.log('in /admin protected route');
        // Make API requests with the access token
        // Your API logic goes here
        res.send('Movies - protected endpoint, Admin only.');
    } else {
        res.status(401).send('Unauthorized');
    }
});

module.exports = routes;
