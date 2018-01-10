var Twitter = require("twitter");
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs");
var inquirer = require("inquirer");
var colors = require("colors");

var client = new Twitter(keys.twitterKeys);

var spotify = new Spotify(keys.spotifyKeys);

var omdbKey = keys.omdbKey;

var command = process.argv[2];

var searchTerm = process.argv[3];

var isAutomated = false;

if(process.argv[2] === "delete-log") {
	fs.writeFile("log.txt", "", function(err) {
		if(err) {
			console.log(err);
		}

		console.log("\nLog deleted.\n");
	})
}
else {
	fs.appendFile("log.txt", "\n====== New Session Started ======\n", function(err) {
		if(err) {
			return console.log(err);
		}
	});

	var entryNumber = 1;

	function logData(command, responseInfo) {
		fs.appendFile("log.txt", "\n" + entryNumber + ") " + command + "\n" + responseInfo + "\n", function(err) {
			if(err) {
				return console.log(err);
			}
		});
		entryNumber++;
	}
	console.log("");
	console.log("");
	console.log("=======================================".bold.yellow);
	console.log("    _/        _/_/_/  _/_/_/    _/_/_/".bold.white);
	console.log("   _/          _/    _/    _/    _/".bold.white);
	console.log("  _/          _/    _/_/_/      _/ ".bold.white);
	console.log(" _/          _/    _/    _/    _/ ".bold.white);
	console.log("_/_/_/_/  _/_/_/  _/    _/  _/_/_/".bold.white);
	console.log("=======================================".bold.yellow);
	console.log("");
	console.log("");

	function runProgram() {
		inquirer.prompt([
			{
				type: "input",
				message: "\nHello! Welcome to the world's latest CLI Search App!\nI can search for information about your favorite songs, movies, and even display your latest tweets!\n\nMy name is LIRI. What is your name?",
				validate: function(input) {
					if(!input) {
						var errorMsg = "\nYou don't want to tell me your name? I'm hurt. Unfortunately I can't do anything else until you do. Please enter your name.\n"
						return errorMsg.bold;
					}
					else {
						return true;
					}
				},
				name: "name"
			}
		])
		.then(function(nameResponse) {

			var initialMsg = "\nHello, " + nameResponse.name + ". What would you like me to do?";

			var msg;

			function chooseACommand(msg) {
				inquirer.prompt([
					{
						type: "list",
						message: msg,
						choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says", "That's all for now, LIRI!"],
						name: "commandChoice"
					}
				])
				.then(function(commandResponse) {
					var command = commandResponse.commandChoice

					var searchTerm;

					executeLIRI(command, searchTerm);

					function executeLIRI(command, searchTerm) {
						if(command === "That's all for now, LIRI!") {
							var goodbyeMsg = "Ok. Bye, " + nameResponse.name + ". See you soon!";
							console.log("\n" + goodbyeMsg.bold + "\n");
							return;
						}

						if(command === "my-tweets") {
							function runTwitter() {
								if(!searchTerm) {
									var params = {user_id: "25073877", count: 20};
									client.get("statuses/user_timeline", params, function(error, tweets, response) {
										if(!error) {
											var logInfo = [];
											console.log("\nHere are your 20 most recent tweets".bold);

											for (var i = 0; i < tweets.length; i++) {
												console.log("\n" + (i + 1) + ") ==========================================================");
												console.log(tweets[i].created_at);
												console.log(tweets[i].text);

												if(i >= 10) {
													console.log("==============================================================\n");
												}
												else {
													console.log("=============================================================\n");
												}
												logInfo.push({
													"tweet_number": i + 1,
													"posted": tweets[i].created_at,
													"text": tweets[i].text
												});
											}

											var logInfoStr = JSON.stringify(logInfo, null, 2);

											logData(command, logInfoStr);

											msg = "Twitter is fun! What would you like me to do now?";
											clearTimeout(timeout);
											var timeout = setTimeout(function() {
												chooseACommand(msg);
											}, 500);
										}
										else {
											clearTimeout(timeout);
											var timeout = setTimeout(function() {
												chooseACommand(initialMsg);
											}, 1000);
											return console.log(error);
										}
									});
								}
							}

							function runTwitterAuto() {
								if(!searchTerm) {
									var params = {user_id: "25073877", count: 20};
									client.get("statuses/user_timeline", params, function(error, tweets, response) {
										if(!error) {
											var logInfo = [];
											console.log("\nHere are your 20 most recent tweets!".bold);

											for (var i = 0; i < tweets.length; i++) {
												console.log("\n" + (i + 1) + ") ==========================================================");
												console.log(tweets[i].created_at);
												console.log(tweets[i].text);

												if(i >= 10) {
													console.log("==============================================================\n");
												}
												else {
													console.log("=============================================================\n");
												}
												logInfo.push({
													"tweet_number": i + 1,
													"posted": tweets[i].created_at,
													"text": tweets[i].text
												});									
											}

											var logInfoStr = JSON.stringify(logInfo, null, 2);

											logData(command, logInfoStr);
										}
										else {
											clearTimeout(timeout);
											var timeout = setTimeout(function() {
												chooseACommand(initialMsg);
											}, 1000);
											return console.log(error);
										}
									});
								}
							}

							if(!isAutomated) {
								runTwitter();
							}
							else {
								runTwitterAuto();
							}
						}

						if(command === "spotify-this-song") {
							function runSpotify(song) {
								if(!song) {
									song = "The Sign";
								}

								spotify.search({type: "track", query: song, limit: 1}, function(err, data) {
									if(err) {
										console.log("\nHmm...can't seem to find that song.".bold);
										var error = "Error occurred: " + err + "\n";
										clearTimeout(timeout);
										var timeout = setTimeout(function() {
											chooseACommand(initialMsg);
										}, 1000);
										return console.log(error.bold.red);
									}
									else {
										var artist = data.tracks.items[0].album.artists[0].name;
										var album = data.tracks.items[0].album.name;
										var songName = data.tracks.items[0].name;
										var previewUrl = data.tracks.items[0].preview_url;

										console.log("\nHere's the song info you requested from Spotify:".bold);
										console.log("\nArtist: " + artist + "\n");
										console.log("Album: " + album + "\n");
										console.log("Song Name: " + songName + "\n");
										console.log("Link to Preview: " + previewUrl + "\n");

										var logInfo = {
											"artist": artist,
											"album": album,
											"song_name": songName,
											"preview_link": previewUrl
										};

										var logInfoStr = JSON.stringify(logInfo, null, 2);

										logData(command, logInfoStr);

										msg = "I love that song! What would you like me to do now?";
										clearTimeout(timeout);
										var timeout = setTimeout(function() {
											chooseACommand(msg);
										}, 500);
									}
								});
							};

							function runSpotifyAuto(song) {
								if(!song) {
									song = "The Sign";
								}

								spotify.search({type: "track", query: song, limit: 1}, function(err, data) {
									if(err) {
										console.log("\nHmm...can't seem to find that song.".bold);
										var error = "Error occurred: " + err + "\n";
										return console.log(error.bold.red);
									}
									else {
										var artist = data.tracks.items[0].album.artists[0].name;
										var album = data.tracks.items[0].album.name;
										var songName = data.tracks.items[0].name;
										var previewUrl = data.tracks.items[0].preview_url;

										console.log("\nHere's the song info you requested from Spotify:".bold);
										console.log("\nArtist: " + artist + "\n");
										console.log("Album: " + album + "\n");
										console.log("Song Name: " + songName + "\n");
										console.log("Link to Preview: " + previewUrl + "\n");

										var logInfo = {
											"artist": artist,
											"album": album,
											"song_name": songName,
											"preview_link": previewUrl
										};

										var logInfoStr = JSON.stringify(logInfo, null, 2);

										logData(command, logInfoStr);
									}
								});
							};

							if(!searchTerm) {
								inquirer.prompt([
									{
										type: "input",
										message: "\nOk, what song would you like me to search for?",
										name: "songChoice"
									}
								])
								.then(function(songResponse) {
									var songAnswer = songResponse.songChoice;

									runSpotify(songAnswer);
								});						
							}
							else {
								runSpotifyAuto(searchTerm);
							}
						}

						if(command === "movie-this") {
							function runMovie(movie) {
								if(!movie) {
									movie = "Mr. Nobody";
								}

								request("http://www.omdbapi.com/?t=" + movie + "&apikey=" + omdbKey, function(error, response) {
									var bodyObj = JSON.parse(response.body);
									if(!error) {
										var bodyObj = JSON.parse(response.body);
										if(bodyObj.Title == null) {
											console.log("\nHmm...that movie doesn't seem to exist.");
											chooseACommand(initialMsg);
										}
										else {
											var title = bodyObj.Title;
											var yearReleased = bodyObj.Year;
											var imdbRating = bodyObj.Ratings[0].Value;
											var rottenTomatoes = bodyObj.Ratings[1].Value;
											var country = bodyObj.Country;
											var language = bodyObj.Language;
											var actors = bodyObj.Actors;
											var plot = bodyObj.Plot;

											console.log("\nHere's the movie info you requested from OMDB:\n".bold);
											console.log("\nTitle: " + title);
											console.log("\nYear Released: " + yearReleased);
											console.log("\nIMBD Rating: " + imdbRating);
											console.log("\nRotten Tomatoes: " + rottenTomatoes);
											console.log("\nCountry Produced: " + country);
											console.log("\nLanguage(s): " + language);
											console.log("\nActors: " + actors);
											console.log("\nPlot: " + plot + "\n");

											var logInfo = {
												"title": title,
												"year_released": yearReleased,
												"imdb_rating": imdbRating,
												"rotten_tomatoes": rottenTomatoes,
												"country_produced": country,
												"language": language,
												"actors": actors,
												"plot": plot
											};

											var logInfoStr = JSON.stringify(logInfo, null, 2);

											logData(command, logInfoStr);

											msg = "\nGreat movie! What would you like me to do now?";
											clearTimeout(timeout);
											var timeout = setTimeout(function() {
												chooseACommand(msg);
											}, 500);									
										}
									}
									else {
										var err = "Error occurred: " + error + "\n";
										console.log("\nHmm...can't seem to find that movie".bold);
										clearTimeout(timeout);
										var timeout = setTimeout(function() {
												chooseACommand(initialMsg);
										}, 1000);
										return console.log(err.bold.red);
									}
								});
							}

							function runMovieAuto(movie) {
								if(!movie) {
										movie = "Mr. Nobody";
									}

								request("http://www.omdbapi.com/?t=" + movie + "&apikey=" + omdbKey, function(error, response) {
									var bodyObj = JSON.parse(response.body);
									if(!error) {
										var bodyObj = JSON.parse(response.body);
										if(bodyObj.Title == null) {
											console.log("\nHmm...that movie doesn't seem to exist.");
										}
										else {
											var title = bodyObj.Title;
											var yearReleased = bodyObj.Year;
											var imdbRating = bodyObj.Ratings[0].Value;
											var rottenTomatoes = bodyObj.Ratings[1].Value;
											var country = bodyObj.Country;
											var language = bodyObj.Language;
											var actors = bodyObj.Actors;
											var plot = bodyObj.Plot;

											console.log("\nHere's the movie info you requested from OMDB:\n".bold);
											console.log("\nTitle: " + title);
											console.log("\nYear Released: " + yearReleased);
											console.log("\nIMBD Rating: " + imdbRating);
											console.log("\nRotten Tomatoes: " + rottenTomatoes);
											console.log("\nCountry Produced: " + country);
											console.log("\nLanguage(s): " + language);
											console.log("\nActors: " + actors);
											console.log("\nPlot: " + plot + "\n");

											var logInfo = {
												"title": title,
												"year_released": yearReleased,
												"imdb_rating": imdbRating,
												"rotten_tomatoes": rottenTomatoes,
												"country_produced": country,
												"language": language,
												"actors": actors,
												"plot": plot
											};

											var logInfoStr = JSON.stringify(logInfo, null, 2);

											logData(command, logInfoStr);	
										}
									}
									else {
										var err = "Error occurred: " + error + "\n";
										console.log("\nHmm...can't seem to find that movie".bold);
										return console.log(err.bold.red);
									}
								});						
							}

							if(!searchTerm) {
								inquirer.prompt([
									{
										type: "input",
										message: "\nOk, what movie would you like me to search for?",
										name: "movieChoice"
									}
								])
								.then(function(movieResponse) {
									var movieSelect = movieResponse.movieChoice;

									runMovie(movieSelect);
										
								});	
							}
							else {
								runMovieAuto(searchTerm);
							}
						}

						if(command === "do-what-it-says") {
							fs.readFile("random.txt", "utf8", function(error, data) {
								if(error) {
									console.log("Whoops! Can't seem to complete that request.".bold);
									var err = "Error occurred: " + error + "\n";
									chooseACommand(initialMsg);
									return console.log(err.bold.red);
								}

								var dataArr = data.split(",");

								for(var j = 0; j < dataArr.length; j++) {
									var op = dataArr[j];
									if(dataArr[j] === "my-tweets") {
										isAutomated = true;
										executeLIRI(op);
										isAutomated = false;
									}
									else {
										var search = dataArr[j + 1];
										executeLIRI(op, search);
									}
								}
								msg = "Wow, that was a lot of things at once! What would you like me to do now?"
								clearTimeout(timeout);
								var timeout = setTimeout(function() {
									chooseACommand(msg);
								}, 500);
							});
						}
					}
				});
			}
			chooseACommand(initialMsg);
		});	
	}
	var mainTimeout = setTimeout(function() {
		runProgram()
	}, 1000);		
}
	