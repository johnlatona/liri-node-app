# LIRI (Language Intepretation and Recognition Interface)

## Overview

LIRI is a Node.js CLI app that replicates the basic functionality of interactive applications with built-in functions like Apple's SIRI and Amazon's Alexa on a basic level using the command line instead of voice. LIRI has four functions built in: 

1) my-tweets
	- Select this option and LIRI will pull the most recent 20 tweets from your twitter account. In this rendition, for privacy reasons, I have the application linked with President Donald Trump's twitter account! 

2) spotify-this
	- Type any song name into the command line after choosing this option and LIRI utilizes the Spotify API to return the name of the song, the album it's contained on, the name of the artist, and a link to a short 30 second preview of the song. 

3) movie-this
	- Type any movie name into the command line after choosing this option and LIRI will use the OMDB API to search for information regarding the movie requested, including movie title, year released, rotten tomatoes rating, country produced, language, main actors, and a plot summary.

4) do-what-it-says
	- this function reads the random.txt document in the application repository and executes the list of commands written. This can be customized to suit any search need and is designed to replicate the functionality of a pre-programmed Alexa Routine. 

LIRI also utilizes a built-in log so the local program administrator can see each time a new session is started and review each time a function runs and what was executed. The log can be easily deleted by typing `node liri.js delete-log` into the command line while in the local repo folder. 

## How to Use

Clone the repo locally and type `npm install` to install all node dependencies locally. Then simply type `node liri.js` into your terminal and have fun! 

## Demo 

![LIRI Demo](https://media.giphy.com/media/4TrPswSYpHbP0IMQfy/giphy.gif)

## Technologies Used

- Javascript
- Node.js

## Dependencies

NPM Packages used: 

- colors ^1.1.2
- inquirer ^5.0.0
- node-spotify-api ^1.0.7 
- request ^2.83.0 
- twitter ^1.7.1 

## Developers

- John LaTona 