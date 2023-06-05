const { Movie, Genre, Director } = require('../models/movie');
const curr_year = new Date().getFullYear().toString().slice(-2);
const { param, body, validationResult } = require('express-validator')
const userValidationRules = () => {
  return [
    // username must be an email
    body('username').isEmail(),
    // password must be at least 5 chars long
    body('password').isLength({ min: 5 }),
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

// const validateMovieFields = async (req, res, next) => {
const validateMovieFields = (req, res, next) => {
    console.log('validateMovieFields called');
    const errors = [];

    if (req.body[0].id && req.body[0].id.length > 0) {
        const idParts = req.body[0].id.split('_');
        if (idParts.length !== 2) {
            errors.push('Body movieId must contain a single "_" separating the title and the release year.');
        } else {
            const title = parts[0];
            const year = parts[1];
            if (!title || !year) {
                errors.push('Body movieId must contain a title and a release year.');
            }
            if (!/^[a-z0-9\s!.\-?:;]{2,45}$/.test(title)) {
                errors.push('Body movieId title prefix must contain only lowercase alphanumeric characters (a-z, 0-9) or punctuation (!.?-:;).');
            }
            if (!/^\d{4}$/.test(year)) {
                errors.push('Body movieId year suffix must be a 4-digit number.');
            }
            const currYear = new Date().getFullYear();
            if (parseInt(year) < 1900 || parseInt(year) > currYear) {
                errors.push(`Body movieId year suffix must be between 1900 and ${currYear}.`);
            }
        }
        const Errors = validateMovieParamId(req, res, next, errors);
    }

    if (!req.body[0].Title || !/^[A-Za-z0-9\s-]{2,50}$/.test(req.body[0].Title)) {
        errors.push('Title is required, and must be between 2 and 50 alphanumeric characters or spaces. ');
    }
    if (!req.body[0].Year || parseInt(req.body[0].Year) < 1900 || parseInt(req.body[0].Year) > new Date().getFullYear()) {
        errors.push('ReleaseYear is required, and must be between 1900 and the current year, inclusive.');
    }
    if (!req.body[0].Rated || !/^[A-Za-z0-9\s-]{1,20}$/.test(req.body[0].Rated)) {
        errors.push('Rated is required, and must be between 1 and 20 alphanumeric characters or spaces. ');
    }
    if (!req.body[0].Released || !/^\d{2} [A-Za-z]{3} \d{4}$/.test(req.body[0].Released) || !Date.parse(req.body[0].Released)) {
        errors.push('Released is required, must be between 10 and 20 characters, and must be a date in the form "dd mmm YYYY". ');
    }
    if (!req.body[0].Runtime || !isValidRuntime(req.body[0].Runtime)) {
        errors.push('Runtime is required, and must be between 30 and 500 minutes, inclusive.');
    }
    if (!req.body[0].Genre || !/^[\w\s-,]{2,100}$/.test(req.body[0].Genre)) {
        console.log('req.body.Genre:', req.body.Genre);
        errors.push('Genre is required, must be in the Genres collection, and must be between 2 and 100 alphabetic characters, spaces, or commas. ');
    }
    if (!req.body[0].Director || !/^[A-Za-z\s]{2,50}$/.test(req.body[0].Director)) {
        errors.push('Director is required, must be in the Directors collection, and must be between 2 and 50 alphabetic characters or spaces. ');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    next();
}

// Function to validate movie ID
const validateMovieParamId = (req, res, next) => {
    console.log('validateMovieParamId called');
    const errors = [];

    if (req.params.id && req.params.id.length > 0) {
        const idParts = req.params.id.split('_');

        if (idParts.length !== 2) {
            errors.push('Params movieId must contain a single "_" separating the title and the release year.');
        } else {
            const title = idParts[0];
            const year = idParts[1];
            if (!title || !year) {
                errors.push('Params movieId must contain a title and a release year.');
            }
            if (!/^[a-z0-9\s!.\-?:;]{2,45}$/.test(title)) {
                errors.push('Params movieId title prefix must contain only lowercase alphanumeric characters (a-z, 0-9) or punctuation (!.?-:;).');
            }
            if (!/^\d{4}$/.test(year)) {
                errors.push('Params movieId year suffix must be a 4-digit number.');
            }
            const currYear = new Date().getFullYear();
            if (parseInt(year) < 1900 || parseInt(year) > currYear) {
                errors.push(`Params movieId year suffix must be between 1900 and ${currYear}.`);
            }
        }
    } else {
        errors.push('Params movieId is required.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    next();
}

function isValidRuntime(runtime) {
    const minutes = parseInt(runtime.substring(0, runtime.indexOf(" ")));
    return !isNaN(minutes) && minutes >= 30 && minutes <= 500;
}

// || !(await isValidGenre(req.body[0].Genre))
async function isValidGenre(genre) {
    console.log('isValidGenre called');
    console.log('genre:', genre);
    try {
      const result = await Genre.findOne({ type: genre });
      result.then((data) => {
        console.log('Genre:', data);
      });

      const resultAll = await Genre.findAll();
      resultAll.then((data) => {
        console.log('All Genres:', data);
      });

      if (!result) {
        return false; // Returns false if genre is not found
      } else {
        return true; // Returns true if genre is found
      }
    } catch (error) {
      // Handle error if unable to perform genre validation
      console.error('Error validating genre:', error);
      return false;
    }
  }

// || !(await isValidDirector(req.body[0].Director))
async function isValidDirector(director) {
    console.log('isValidDirector called');
    console.log('director:', director);
    try {
      const result = await Director.findOne({ type: director });
      console.log('Director:', result);

      if (!result) {
        return false; // Returns false if genre is not found
      } else {
        return true; // Returns true if genre is found
      }
    } catch (error) {
      // Handle error if unable to perform genre validation
      console.error('Error validating director:', error);
      return false;
    }
}

// const { userValidationRules, validate } = require('./validator.js')
// app.post('/user', userValidationRules(), validate, (req, res) => {
//   User.create({
//     username: req.body.username,
//     password: req.body.password,
//   }).then(user => res.json(user))
// })

module.exports = {
  userValidationRules,
  validate,
  validateMovieFields,
  validateMovieParamId,
}