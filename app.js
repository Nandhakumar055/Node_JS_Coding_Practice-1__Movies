const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dataBasePath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let database = null;

const initializationServerAndDB = async () => {
  try {
    database = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`Database Error: ${err.message}`);
    process.exit(1);
  }
};
initializationServerAndDB();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getMovieNameQuery = `SELECT
        movie_name
    FROM
        movie;`;

  const moviesArray = await database.all(getMovieNameQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `
    INSERT INTO
        movie (director_id,movie_name,lead_actor)
    VALUES
        (
        ${directorId}, 
        '${movieName}', 
        '${leadActor}');`;

  const dbResponse = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
      SELECT
          *
      FROM
          movie
      WHERE
        movie_id = ${movieId};`;
  const movieRes = await database.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movieRes));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieUpdateDetails = request.body;
  const { directorId, movieName, leadActor } = movieUpdateDetails;
  const upgradeMovieQuery = `
    UPDATE
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id =${movieId};`;

  const upgrade = await database.run(upgradeMovieQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsQuery = `
    SELECT
        *
    FROM
        director;`;
  const directorArray = await database.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
        movie_name
    FROM
        movie
    WHERE
        director_id = ${directorId};`;

  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
