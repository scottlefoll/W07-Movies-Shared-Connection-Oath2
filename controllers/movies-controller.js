const { Movie, Genre, User, Director } = require('../models/movie');
// genre and director models are imported in the movie model


// GET /db
async function getDBList(req, res) {
    console.log('getDBList called');
    try {
      const result = await Movie.collection.conn.db.admin().listDatabases();
      return result;
    } catch (err) {
        console.error(err);
        throw err;
    } 
  }

// GET /movies
async function getMovies(req, res) {
    console.log('getMovies called');
    try {
      const result = await Movie.find({});
      if (result.length === 0) {
        throw { statusCode: 404, message: 'No movies found' };
      }
      return result;
    } catch (err) {
      console.error(err);
      if (err.statusCode !== 404) {
        res.status(500).json({ message: 'Internal server error' });
      }
      throw err;
    }
  }

// GET /movies/:id  ('gameofthrones_2011')
async function getMovieById(req, res, id) {
    console.log('getMovieById called');
    console.log('searching for id:', id);
    try {
      const result = await Movie.findOne({ _id: id });
      if (!result || result.length === 0) {
        res.status(404).json({ message: 'No movie found for id: ' + id });
      }
      return result;
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
      throw err;
    }
}

// GET /title/:title (ie. 'game of thrones', case insensitive)
async function getMovieByTitle(req, res, title) {
    console.log('getMovieByTitle called');
    console.log('title:', title);
    try {
      const result = await Movie.findOne({ Title: { $regex: new RegExp(`^${title}$`, 'i') } });
      if (!result || result.length === 0) {
        res.status(404).send('No movie found matching title: ' + title);
      }
      return result;
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal server error' });
      throw err;
    }
  }

// GET /partial/:title (ie. 'game', case insensitive)
async function getMoviesByPartialTitle(req, res, title) {
    console.log('getMoviesByPartialTitle called');
    try {
      const result = await Movie.find({ Title: { $regex: title, $options: 'i' } }).sort({ Title: 1 });
      if (!result || result.length === 0) {
        res.status(404).send('No movies found matching partial title: ' + title);
      }
      return result;
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal server error' });
      throw err;
    }
  }

    // GET /director/:name (ie. 'john cameron', case insensitive)
  async function getMoviesByDirector(req, res, name) {
    console.log('getContactsByDirector called');
    console.log('name', name);
    try {
      const result = await Movie.find({ Director: { $regex: name, $options: 'i' } }).sort({ Director: 1 });
      if (!result || result.length === 0) {
        res.status(404).send('No movies found with Director name matching: ' + name);
      } else {
        return result;
      }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
        throw err;
    }
}

async function createMovie(req, res) {
    console.log('createMovie called');
    console.log('req.body:', req.body);
    console.log('req.body.title:', req.body[0].Title);
    console.log('req.body.year:', req.body[0].Year);
    let _id2;

    try {
      let Title = req.body[0].Title;
      let Year = req.body[0].Year;
      let Rated = req.body[0].Rated;
      let Released = req.body[0].Released;
      let Runtime = req.body[0].Runtime;
      let Genre = req.body[0].Genre;
      let Director = req.body[0].Director;
      let Writer = req.body[0].Writer;
      let Actors = req.body[0].Actors;
      let Plot = req.body[0].Plot;
      let Language = req.body[0].Language;
      let Country = req.body[0].Country;
      let Awards = req.body[0].Awards;
      let Poster = req.body[0].Poster;
      let Metascore = req.body[0].Metascore;
      let imdbRating = req.body[0].imdbRating;
      let imdbVotes = req.body[0].imdbVotes;
      let imdbID = req.body[0].imdbID;
      let Type = req.body[0].Type;

      // create a unique ID
      _id2 = `${Title}_${Year}`.replace(/\s/g, '').toLowerCase();

      console.log('33 create id2:', _id2);
      console.log('33 create title:', Title);
      console.log('33 create year:', Year);

      // Create the movie object using the Movie model in Mongoose
      const newMovie = new Movie({
        _id: _id2,
        Title,
        Year,
        Rated,
        Released,
        Runtime,
        Genre,
        Director,
        Writer,
        Actors,
        Plot,
        Language,
        Country,
        Awards,
        Poster,
        Metascore,
        imdbRating,
        imdbVotes,
        imdbID,
        Type,
      });

      console.log('newMovie:', newMovie);
      // Save the movie object to the database
      const createdMovie = await newMovie.save();

      return res.status(201).json({
        statusCode: 201,
        message: 'Movie created successfully',
        createdMovieId: createdMovie._id.toString(),
      });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Duplicate key violation. Movie creation failed',
          id: req.body._id,
          keyValue: err.keyValue,
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: 'Movie creation failed',
          id: req.body._id,
        });
      }
    }
  }


// PUT /update/:id
async function updateMovie(req, res, id) {
    // if the firstName or lastName fields are updated, then the _id should be updated.
    // in order to update the _id, I need to delete the existing contact and create a new one,
    // since _id is immutable (Should I actually do this?)

    console.log('updateMovie called');
    try {
      const movieId = req.params.id;
      console.log('movieId:', movieId);

      // Dynamically build the update object based on the fields present in the request body
      const updateFields = req.body[0];
      delete updateFields['_id'];

      console.log('updateFields:', updateFields);

      // Start a session for the atomic transaction
      const session = await Movie.startSession();
      // Use a transaction to ensure atomicity
      session.startTransaction();

      try {
        // Find the movie with the specified ID and update it with the update object
        const result = await Movie.findOneAndUpdate({ _id: movieId }, updateFields, { new: true });
        console.log('result:', result);

        if (result) {
            // Check if the update contained the Title and/or Year fields, and if so, update the _id
            if (updateFields.Title || updateFields.Year) {
                await changeMovieId(movieId, res);
            }

            // Commit the transaction
            await session.commitTransaction();
            res.status(200).send({ message: `Movie ${movieId} updated successfully`, updatedMovie: result });
        } else {
            await session.abortTransaction();
            res.status(404).send({ message: `Movie ${movieId} not found` });
        }
      } catch (err) {
            console.error(err);
            throw err;
            res.status(500).send({ message: `Movie ${movieId} update failed` });
      } finally {
            session.endSession();
      }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `Movie ${movieId} update failed` });
    }
  }

    //  This function is for the internal use of the updateContact() function
    //  It creates a new _id if the firstName or lastName fields are changed
  async function changeMovieId(_id, res) {
    console.log('changeMovieId called');
    try {
        // Find the old movie record by the _id parameter
        const oldMovie = await Movie.findOne({ _id });
        console.log('oldMovie:', oldMovie);

        // Generate a new _id based on the Title and Year fields
        const newMovieId = `${oldMovie.Title.toLowerCase().replace(/\s/g, '')}_${oldMovie.Year}`;
        console.log('newMovieId:', newMovieId);
        // Check if the new _id is the same as the old one or already exists
        if (newMovieId === _id || (await Movie.findOne({ _id: newMovieId }))) {
            return;
        }
        // create a new movie object with the updated _id based on the Title and Year fields
        const newMovie = {
                _id: oldMovie.Title.toLowerCase().replace(' ', '') + '_' + oldMovie.Year,
                Title: oldMovie.Title,
                Year: oldMovie.Year,
                Rated: oldMovie.Rated,
                Released: oldMovie.Released,
                Runtime: oldMovie.Runtime,
                Genre: oldMovie.Genre,
                Director: oldMovie.Director,
                Writer: oldMovie.Writer,
                Actors: oldMovie.Actors,
                Plot: oldMovie.Plot,
                Language: oldMovie.Language,
                Country: oldMovie.Country,
                Awards: oldMovie.Awards,
                Poster: oldMovie.Poster,
                Metascore: oldMovie.Metascore,
                imdbRating: oldMovie.imdbRating,
                imdbVotes: oldMovie.imdbVotes,
                imdbID: oldMovie.imdbID,
                Type: oldMovie.Type,
            };

            console.log('newMovie:', newMovie);
            // Create a new instance of the Movie model
            const newMovieInstance = new Movie(newMovie);
            // Save the new movie instance to the database
            const createdMovie = await newMovieInstance.save();

            console.log('createdMovie:', createdMovie);

            if (createdMovie) {
                // Delete the old movie record
                await Movie.deleteOne({ _id });
                console.log('Movie deleted successfully after update - old movie id: ' + _id);
                return createdMovie;
            }
    } catch (err) {
            console.error(err);
            if (err.code === 11000) {
                return res.status(400).json({
                    statusCode: 400,
                    message: 'Record creation failed. Duplicate key detected.',
                });
            } else {
                return res.status(500).json({
                    statusCode: 500,
                    message: 'Record creation failed. An internal server error occurred.',
            });
        }
    }
}

// DELETE /delete/:id
async function deleteMovie(req, res, id) {
    console.log('deleteMovie called');
    try {
      const movieId = id;
      const result = await Movie.deleteOne({ _id: movieId });
      if (result.deletedCount > 0) {
        return res.send({ message: `Movie ${movieId} deleted successfully` });
      } else {
        return res.status(404).send({ message: `Movie ${movieId} not found` });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal server error' });
      throw err;
    }
  }


  module.exports = {
    getDBList,
    getMovies,
    getMovieById,
    getMovieByTitle,
    getMoviesByPartialTitle,
    getMoviesByDirector,
    createMovie,
    updateMovie,
    deleteMovie,
  };

  console.log('movies-controller.js is loaded!');

