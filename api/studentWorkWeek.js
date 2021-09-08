// File: studentWorkWeek.js
// Author: J. Fisher   Date: 2/10/2021
// Copyright 2021 by Julian Fisher
//
// This file defines the api route to return all of a student's
// worksessions for a given week.
// API
//  Resource                    Req Verb  Description                    Status Code
//  /project?u=UU&w=WW&p=PP     Get    Retrieve all worksessions         200 (ok)
//                                                                       206 (no worksessions found)
//
// Modification:  
// 02/15/2021 - Changed return structure


// DEPRECATED ROUTE - USES MONGODB AND STUDENT DATA IS STORED IN SESSION
const numberOfDays = 7;
const router = require("express").Router();
//const Session = require("../models/session-time");
//const User = require("../models/user");
//const Project = require("../models/project")

router.get("/",async function(req, res){
    let email = req.query.u;
    let projectCode = req.query.p;
    let startDate = req.query.w;

    startDate = new Date(Date.parse(startDate));
    let endDate = new Date(startDate.toString());
    endDate.setDate(endDate.getDate() + numberOfDays);

    //find sessions
    let sessions = await Session.find({owner: email, date: {$lte: endDate, $gte: startDate}, project: projectCode});
    //find user to get first name and last name
    let student = await User.findOne({email: email});
    let stuName = student.fname + " " + student.lname;
    //find project to get project name
    let project = await Project.findOne({projCode: projectCode});

    if(sessions.length != 0){
        res.status(200);
        res.send({status: 200, name: stuName, projectName: project.name, sessions: sessions});
    }
    else{
        res.status(206);
        res.send({status: 206, name: stuName, projectName: project.name, msg: "No projects found"});
    }
});

module.exports = router;