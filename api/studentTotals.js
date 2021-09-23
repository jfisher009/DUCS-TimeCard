// File studentTotals.js
// Author: J. Fisher  Date: 02/06/2021
// Copyright 2021 by J. Fisher
// 
// This file defines the API route for getting the total 
// number of hours for all students in a given week
// API
//  Resource                Req Verb  Description                    Status Code
//  /project?p=PP&w=WW      Get    Retrieve total hours worked       200 (ok)
//                                 for all students               
//                                                                   404 (work sessions or users not found)
// 
// Modifications
// Added session saving 03/19/2021
// 9/14/2021 Modified MySql queries to be resistant to SQL injections

const numberOfDays = 7;
const conn = require("../mysqldb");
const router = require("express").Router();
//const Session = require("../models/session-time");
//const Project = require("../models/project");
//const User = require("../models/user");
const session = require('express-session');
const cookie_parser = require("cookie-parser");



router.get("/", function(req,res){
    let projectCode = req.query.p;
    let startDate = req.query.w;

    //set start and end dates
    startDate = new Date(Date.parse(startDate)).toISOString();
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + numberOfDays);
    endDate = endDate.toISOString();

    //query to find all worksessions for user in date range. If user does not have worksessions but has project, null values will be in table
    let sqlSELECT = 'SELECT usersOnProject.email, usersOnProject.fname, usersOnProject.lname, w.startTime, w.endTime, w.code, w.code90Description, w.description, w.sessionID FROM ( ';
    sqlSELECT += 'SELECT u.*, p.idProject FROM `User`u ';
    sqlSELECT += 'INNER JOIN Student s ON u.iduser = s.user_iduser ';
    sqlSELECT += 'LEFT JOIN Student_has_Project b1 ON s.user_iduser = b1.Student_user_iduser ';
    sqlSELECT += 'LEFT JOIN Project p ON b1.Project_idProject = p.idProject ';
    sqlSELECT += 'WHERE p.projectCode= ?) usersOnProject ';
    sqlSELECT += 'LEFT JOIN Worksession w  ';
    sqlSELECT += 'ON usersOnProject.iduser = w.Student_user_iduser  ';
    sqlSELECT += 'AND w.Project_idProject = usersOnProject.idProject  ';
    sqlSELECT += 'AND w.startTime BETWEEN ? AND  ?;';
        
    conn.query(sqlSELECT, [projectCode, startDate, endDate], (err,rows) => {
        if(err){
            res.status(404).send({msg: "No project found"})
        }
        else{
            //accumulator for rows based on matching emails
            let seperatedStudentData = []

            //boolean variable to tell if row has been sorted
            let added = false;

            //while there are still rows in the list
            while(rows.length > 0){
                added = false;

                //pull off the first row from the list
                currRow = rows.shift();

                //check each index of seperatedStudentData and see if a row with a matching email has been added
                seperatedStudentData.forEach((studentData) => {
                    //if soo, add it to the same list
                    if(studentData[0].email == currRow.email){
                        studentData.push(currRow)
                        added = true
                    }
                });
                //if it hasn't been added to seperatedStudentData yet, add it in a new array
                if(!added){
                    seperatedStudentData.push([currRow])
                }
            }

            let summaries = []
            //make json object in this form and add them to an array
            //{
            //  lastname: lname,
            //  firstName: fname,
            //  email: email,
            //  totHours: totHours
            //}
            
            //iterate through list of work seperated by user and make summary data
            seperatedStudentData.forEach(function(dataCollection){
                let email = dataCollection[0].email
                let fname = dataCollection[0].fname
                let lname = dataCollection[0].lname
                let totTime = 0
                dataCollection.forEach((worksession) => {
                    let time1 = worksession.startTime
                    let time2 = worksession.endTime
                    // divide by 1000 * 60 to convert to hours from miliseconds (1000 miliseconds * 60 seconds * 60 minutes)
                    let elapsedTime = (time2 - time1)/ (1000 * 60 * 60)
                    totTime += elapsedTime
                })

                let summary = {
                    lastName: lname, 
                    firstName: fname,
                    email: email,
                    totHours: totTime.toFixed(2)
                }

                summaries.push(summary)
            });
            
            let jsonCookieData = {
                sessions: seperatedStudentData
            }
            res.cookie("studentData",JSON.stringify(jsonCookieData));
            res.status(200).send({summaries: summaries})
        }
    });
})

module.exports = router;