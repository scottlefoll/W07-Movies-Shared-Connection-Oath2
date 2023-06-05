const { User } = require('../models/movie');
const passport = require('passport');
const routes = require('express').Router();
const userController = require('../controllers/user-controller');
const {param, query, validationResult} = require('express-validator');
const moviesController = require('../controllers/movies-controller');
const authMiddleware = require('../middleware/auth');
const { validateMovieFields, validateMovieParamId } = require('../validators/movieValidator');
const curr_year = new Date().getFullYear();

routes.use(passport.initialize())
routes.use(passport.session())

routes.get('/', (req, res) => {
    res.send('Welcome to the MongoDB Movies API! Please enter a valid endpoint to continue (all parameters are case-insensitive): (/db (List of databases), /movies (List of all movies), /movies/:id (single movie by id, i.e. - avatar_2009 ), /title/:title (single movie by title, i.e. - avatar [case insensitive] ), /partial/:title (all movies by partial title, i.e. - avat [case insensitive] ), /director/:name (all movies by director name, i.e. - james cameron [case insensitive]), /create/:id (create movie), /update/:id (update movie), /delete/:id (delete movie)');
});


routes.get('/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  async (req, res, next) => {
    try {
      // Handle successful authentication
      const existingUser = await User.findOne({ email: req.user.email });
      if (!existingUser) {
        // Create a new user
        const newUser = new User({
          name: req.user.name,
          email: req.user.email,
          // Add any other relevant user information you want to store
        });
        await newUser.save();
      }

      // Establish the session
      req.login(req.user, (err) => {
        if (err) {
          return next(err);
        }

        // Redirect the user to a protected route or the home page
        res.redirect('/create');
      });
    } catch (error) {
      // Handle database error
      next(error);
    }
  }
);

// routes.get('/callback', async (req, res, next) => {
//     try {
//       console.log('in callback');
//       // Handle the authentication callback
//       passport.authenticate('oauth2', async (err, user) => {
//         if (err) {
//           // Handle error during authentication
//           return next(err);
//         }

//         if (!user) {
//           // Handle authentication failure
//           return res.redirect('/login'); // Redirect to the login page or show an error message
//         }

//         try {
//           // Handle successful authentication
//           // Check if the user already exists in your database
//           console.log('in callback: existingUser');
//           const existingUser = await User.findOne({ email: user.email });

//           if (!existingUser) {
//             // Create a new user
//             console.log('in callback: create newUser');
//             const newUser = new User({
//               name: user.name,
//               email: user.email,
//               // Add any other relevant user information you want to store
//             });
//             await newUser.save();
//           }

//           // Establish the session
//           console.log('in callback: start auth session');
//           req.login(user, (err) => {
//             if (err) {
//               return next(err);
//             }

//             // Redirect the user to a protected route or the home page
//             console.log('in callback: redirect to /create');
//             res.redirect('/create');
//           });
//         } catch (error) {
//           // Handle database error
//           return next(error);
//         }
//       })(req, res, next);

//     } catch (error) {
//       // Handle any other errors
//       return next(error);
//     }
//   });

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

routes.post('/create', authMiddleware.authenticate('oauth2'), validateMovieFields, async (req, res, next) => {
// routes.post('/create', validateMovieFields, async (req, res, next) => {
    console.log('in /movies/create route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
        await moviesController.createMovie(req, res);
    } catch (err) {
        next(err);
    }
});

routes.put('/update/:id', authMiddleware.authenticate('oauth2'), validateMovieParamId, validateMovieFields, async (req, res, next) => {
    console.log('in /movies/update/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      await moviesController.updateMovie(req, res, req.params.id);
    } catch (err) {
      next(err);
    }
  });


routes.delete('/delete/:id', authMiddleware.authenticate('oauth2'), validateMovieParamId, async (req, res, next) => {
    console.log('in /movies/delete/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
        await moviesController.deleteMovie(req, res, req.params.id);
    } catch (err) {
        next(err);
    }
    });

module.exports = routes;
