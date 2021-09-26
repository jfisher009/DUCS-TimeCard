// File: server.js 
// Author: S. Sigman  Date: 12/30/2020
//
// server.js contains the code for the DTT Server component
// of the Ducs Time Tracker application.  Responsibilities of
// the server are:
//
//   1. Server the static web pages in the web component of 
//      the system.
//   2. Provide the DTT API for both the web and the mobile
//      components of the system.
//
// Modification Log:
// 1/17/2021 - Added express route to implement the authentication
//             API call. S. Sigman
// 1/25/2021 - Added express route to save a worksession
// 9/26/2021 - Added morgan logging

// import the express server
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const morgan = require('morgan');
const fsr = require('file-stream-rotator');
const cookieParser = require("cookie-parser");

// application constants
const PORT = 3200;

// create the http app
const app = express();

// make morgan token to get authenticated user
app.use(cookieParser());
morgan.token('id', function getId (req) {
    return req.cookies.email;
})

// use morgan logger to log server requests
// create stream to log to file
const logStream = fsr.getStream({filename:'./logs/log', frequency:'daily',verbose:'true'});

// set logging format - must be before adding api routes or setting express static page
const logger = morgan(':date[clf] :remote-addr - :id ":method :url" :status', {stream: logStream});
app.use(logger);


// set up a route to serve static pages from the public folder
app.use(express.static("public"));

// add a router
const router = express.Router();

// create API routes
router.use("/api/auth", require("./api/auth"));
router.use("/api/wsession", require("./api/wsession"));
router.use("/api/project", require("./api/project"));
router.use("/api/studentTotals",require("./api/studentTotals"));
router.use("/api/user", require("./api/user"));
router.use("/api/logout",require("./api/logout"))
 
// use the router in the app
app.use(router);

app.listen(PORT, (err) => {
    if (err){
        logStream.write(`${getCurrentDateTime()} - Server startup failed.\n`);
        logStream.write(err);
        logStream.write('\n');
    }
    else{
        logStream.write(`${getCurrentDateTime()} - Server startup. Listening on port ${PORT}\n`);
    }
});

//handle logging for server shutdown
process.on( 'SIGINT', function() {
    logStream.write(`${getCurrentDateTime()} - Server shut down.\n`);
    process.exit();
});

// function to return the current date and time in common log format
function getCurrentDateTime(){
    //get the current date and start with an empty string
    let currDate = new Date();
    let clfDate = '';
    //map month number to month abreviation
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Nov','Dec']
    let month = months[currDate.getUTCMonth()]

    //add day/month/year to clfDate
    clfDate += currDate.getUTCDate() + '/' + month + '/' + currDate.getUTCFullYear();

    //add leading 0s to hour min sec
    let hour = currDate.getUTCHours().toString();
    let min = currDate.getUTCMinutes().toString();
    let sec = currDate.getUTCSeconds().toString();

    if(hour.length == 1){
        hour = '0' + hour;
    }
    if(min.length == 1){
        min = '0' + min;
    }
    if(sec.length == 1){
        sec = '0' + sec;
    }
    //add time to clfDate
    clfDate += ':' + hour + ':' + min + ':' + sec;

    //add +000 to signify that date/time is in UTC
    clfDate += ' +0000'
    return(clfDate)
}
