require("dotenv").config();
let fs = require('fs');
let Spotify = require('node-spotify-api');
let keys = module.require('./keys.js');
let spotify = new Spotify(keys.spotify);
let request = require('request');
let moment = require('moment');
let command = process.argv[2];
let callerName;


concertThis = function() {
    let artist = process.argv[3];

    // runs a request to bandintown api
    request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp", function (error, response) {
        console.log('error:', error); // Print the error if one occurred
        data = JSON.parse(response.body);
        callerName = 'concert';
        parseData(data, callerName);
    });
}


spotifyThis = function(callerName, songName) {
    // if spotifyThis is being called by doWhatItSays
    if (callerName === 'doWhatItSays'){
        songName = songName;
    }else if (callerName === undefined){
        songName = process.argv[3];

        if (process.argv[3] === undefined){ 
            songName = "The Sign"; 
        }
    }
    
    // runs the spotify search method to make an api call
    spotify
        .search({ type: 'track', query: songName })
        .then(function(response) {
            let data = response;
            callerName = 'track';
            parseData(data, callerName);
        })
        .catch(function(err) {
            console.log(err);
        });
}


movieThis = function() {
    let movieName = process.argv[3];
        if(!movieName){
            movieName = "Mr. Nobody";
        }else {
            // runs a request to the OMDB API with the movie specified
            request("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy", function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    let data = response.body;
                    callerName = 'movie';
                    parseData(data, callerName);
                }
            });          
        }
}


doWhatItSaysThis = function() {
    fs.readFile("random.txt", "utf8", function(error, data) {
        // error handling 
        if (error) {
            return console.log(error);
        }
        
        callerName = 'doWhatItSays';
        parseData(data, callerName)

    });
}


switch(true) {
    case command === 'concert-this':
        concertThis();
        break;
    case command === 'spotify-this-song':
        spotifyThis();
        break;
    case command === 'movie-this':
        movieThis();
        break;
    case command === 'do-what-it-says':
        doWhatItSaysThis();
        break;
    default: 
        "no command given"
} 


parseData = function (data, callerName) {
    if (callerName === 'concert'){
        data.forEach(function(element) {
            let date = element.datetime;
            date = moment(date, 'YYYY-MM-DD').format('MM/DD/YYYY');

            console.log('--------------------------------------');
            console.log(`Venue: ${element.venue.name}`);
            console.log(`Location: ${element.venue.city}, ${element.venue.region}`);
            console.log(date);
        });
    }else if (callerName === 'track'){
        for (var i=0; i < data.tracks.items.length; i++) {
            console.log('--------------------------------------');
            console.log(`Artist: ${data.tracks.items[i].artists[0].name}`);
            console.log(`Song Name: ${data.tracks.items[i].name}`);
            console.log(`Preview URL: ${data.tracks.items[i].preview_url}`);
            console.log(`Album: ${data.tracks.items[i].album.name}`);
        }
    }else if (callerName === 'movie') {
        data = JSON.parse(data);

        let title = data.Title;
        let year = data.Year;
        let imdbRating = data.imdbRating;
        let rottenTomatoesRating = data.Ratings[1].Value;
        let country = data.Country;
        let language = data.Language;
        let plot = data.Plot;
        let actors = data.Actors;

        console.log(`------------------------------------
            \r\n
            \rTitle: ${title},
            \rYear: ${year}, 
            \rIMDB Rating: ${imdbRating}, 
            \rRotten Tomatoes Rating: ${rottenTomatoesRating}
            \rProduced In: ${country}
            \rLanguage: ${language}
            \rPlot: ${plot}
            \rActors: ${actors}
            \r\n\r\n`
        );
    }else if (callerName === 'doWhatItSays') {
        // splits data by commas (to make it more readable)
        var dataArr = data.split(",");
        songName = dataArr[1];
        callerName = 'doWhatItSays';
        spotifyThis(callerName, songName)
    }
}