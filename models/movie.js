const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    _id: String,
    Title: String,
    Year: String,
    Rated: String,
    Released: String,
    Runtime: String,
    Genre: String,
    Director: String,
    Writer: String,
    Actors: String,
    Plot: String,
    Language: String,
    Country: String,
    Awards: String,
    Poster: String,
    Metascore: String,
    imdbRating: String,
    imdbVotes: String,
    imdbID: String,
    Type: String,
    Response: String,
  });

const genreSchema = new mongoose.Schema({
    _id: String,
    type: String,
    description: String,
  });

  const userSchema = new mongoose.Schema({
    _id: Number,
    type: String,
    description: String,
  });

  const directorSchema = new mongoose.Schema({
    _id: String,
    firstName: String,
    lastName: String,
    dateOfBirth: String,
    birthplace: String,
    dateOfDeath: String,
  });


  const Movie = mongoose.model('Movie', movieSchema);
  const Genre = mongoose.model('Genre', genreSchema);
  const User = mongoose.model('User', userSchema);
  const Director = mongoose.model('Director', directorSchema);

  module.exports = { Movie, Genre, Director };
