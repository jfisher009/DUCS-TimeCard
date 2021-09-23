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

module.exports = router;
