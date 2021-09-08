// File wsession.js
// Author: S. Sigman  Date: 11/23/2020
// Copyright 2021 by S. Sigman
// 
// This file defines the API routes for work session
// objects.
// API
//  Resource   Req Verb  Description               Status Code
//  /wsession     POST   Create a new worksession  201 (created)
//                                                 400 (error saving)
//
// Modifications
// 1/25/2021 Adapted from App Dev I project by S. Sigman

const bodyParser = require("body-parser");
const router = require("express").Router();
//const SessionTime = require("../models/session-time");
//const User = require("../models/user");
//const Project = require("../models/project");
const conn = require("../mysqldb");
router.use(bodyParser.json());

router.post('/', (req, res) => {
  let other;
  if(req.body.other = ''){
    other = "NULL"
  }
  else{
    other = req.body.other
  }
  let sqlINSERT = 'INSERT Worksession (Student_User_iduser, Project_idproject, startTime, endTime, `code`, code90Description, `description`) \n'
sqlINSERT += 'SELECT newTable.iduser, newTable.idproject, CAST("' + req.body.wsDate + " " + req.body.startTime + '" AS DATE), ' + 'CAST("' + req.body.wsDate + " " + req.body.finishTime + '" AS DATETIME), "' + req.body.code + '", "' + other + '", "' + req.body.desc + '"\n'

  sqlINSERT += 'FROM ( '
  sqlINSERT += 'SELECT u.iduser, p.idproject FROM `User` u\n'
  sqlINSERT += 'INNER JOIN Project p ON p.projectCode = "' + req.body.project + '"\n'
  sqlINSERT += 'WHERE u.email = "' + req.body.owner + '" ) newTable;'

  console.log(sqlINSERT)
  conn.query(sqlINSERT, (err,rows) =>{
    if(err){
      res.status(400).send({msg: "Error saving work session"})
    }
    else{
      res.status(201).send({msg: "Session saved"})
    }
  })
});

// Deprecated MongoDB route
/*
router.post("/", (req, res) => {
    console.log('Save route called');
    console.log(req.body);
    // get the user id - for sprint 3 get Donald Ducks document
    User.find({email: {$eq: req.body.owner}}, (err, users) => {
        // check to see if the user was found
        if (users[0]) {
          console.log(`Num User Projects: ${users[0].projects.length}`);

          // Search the list of users projects for the project
          let projFound = false;
          let i = 0;
          while (!projFound && i <users[0].projects.length) {
            if(users[0].projects[i].projCode == req.body.project ) {
              projFound = true;
            }
            i++;
          }
          console.log(`Project found: ${projFound}`);

          // assert:  the user was found
          // check that the user is part of the specified project
          if (projFound) {
            // assert: the project was found
            // make a session_time object from the post data
            let sHrMin = req.body.startTime.split(":"); // hh:mm
            let fHrMin = req.body.finishTime.split(":");
            let sessionTime = new SessionTime({
              owner: req.body.owner,
              project: req.body.project,
              date: new Date(req.body.wsDate),
              startHr: sHrMin[0],
              startMin: sHrMin[1],
              finishHr: fHrMin[0],
              finishMin: fHrMin[1],
              code: req.body.code,
              code90Desc: req.body.otherCategory,
              description: req.body.desc
            });
            // save the time session data to the database
            sessionTime.save();
            console.log(`user: ${users[0].lname}, ${users[0].fname} session saved.`);
            res.status(201).json({msg: "Session saved"});
          }
          else {
            // assert: no project found
            console.log(`No project: ${req.body.project} found`);
            res.status(412).json({msg: "No project for user."});
          }
        }
        else {
          // assert: the user was not found
          // send bad user or password error
          console.log("no account found");
          res.status(401).json({msg: "No account found"});
        }
    });
  });
  */
module.exports = router;
