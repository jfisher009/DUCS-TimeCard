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
// 9/14/2021 Modified MySql queries to be resistant to SQL injections by J Fisher

const bodyParser = require("body-parser");
const router = require("express").Router();
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
  sqlINSERT += 'SELECT newTable.iduser, newTable.idproject, CAST("' + req.body.wsDate + " " + req.body.startTime + '" AS DATE), ' + 'CAST("' + req.body.wsDate + " " + req.body.finishTime + '" AS DATETIME), "' + req.body.code + '", "' + other + '", "' + req.body.desc + '"\n' // parameters not replaced because a check is not being run against these parameters
  sqlINSERT += 'FROM ( '
  sqlINSERT += 'SELECT u.iduser, p.idproject FROM `User` u\n'
  sqlINSERT += 'INNER JOIN Project p ON p.projectCode = ?\n' //replace parameter here with ? because it is used to pull data out of the DB
  sqlINSERT += 'WHERE u.email = ? ) newTable;' //replace parameter here with ? because it is used to pull data out of the DB

  conn.query(sqlINSERT, [req.body.project, req.body.owner], (err,rows) =>{
    if(err){
      res.status(400).send({msg: "Error saving work session"})
    }
    else{
      res.status(201).send({msg: "Session saved"})
    }
  })
});

module.exports = router;
