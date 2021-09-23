// File project.js
// Author: S. Sigman  Date: 1/25/2021
// Copyright 2021 by S. Sigman
// 
// This file defines the API routes for project
// objects.
// API
//  Resource       Req Verb  Description               Status Code
//  /project?u=UU     Get    Retrieve all projects     200 (ok)
//                           for user UU                
//                                                     404 (user not found)
// 
// Modifications
// 05/10/2021 - Updated route to use mysql
// 9/14/2021 Modified MySql queries to be resistant to SQL injections by J Fisher

const router = require("express").Router();
//const User = require("../models/user");
const conn = require("../mysqldb");

//router.use(bodyParser.json());
router.get('/',(req,res) => {
    //need to find role of user before we can find their associated projects
    let userSELECT = 'SELECT role FROM `User` WHERE email = ?;'
    email = decodeURI(req.query.u);
    
    conn.query(userSELECT, [email], (err,rows) => {
        console.log(err)
        if(err){
            res.status(404).send({msg: "No project found"})
        }
        else if (rows[0].role != "administrator"){
            //generate SQL select for student
            if(rows[0].role == "student"){
                SELECTsql = "SELECT p.* FROM `User` u ";
                SELECTsql += "INNER JOIN Student s on u.iduser = s.User_iduser ";
                SELECTsql += "INNER JOIN Student_has_Project b ON b.Student_user_iduser = s.User_iduser ";
                SELECTsql += "INNER JOIN Project p ON b.Project_idProject = p.idProject ";
                SELECTsql += "WHERE u.email = ?;";
            
            }
            //generate SQL select for instructor
            else if(rows[0].role == "instructor"){
                SELECTsql = 'SELECT p.* FROM `User` u '
                SELECTsql += 'INNER JOIN courseOffering_has_Instructor b1 ON u.iduser = b1.Instructor_user_iduser '
                SELECTsql += 'INNER JOIN courseOffering c ON b1.Class_idClass = c.idClass '
                SELECTsql += 'INNER JOIN Project p ON c.idClass = p.Class_idClass '
                SELECTsql += 'WHERE u.email = ?;'
            }
    
            conn.query(SELECTsql, [email], (err, rows) => {
                if (err) return res.status(500).json({error: err});
                if(!(rows.length > 0 )){
                    res.status(404);
                    res.send({msg: "No projects found."});
                }
                else{
                    let projects = []
                    rows.forEach(row => {
                        let name = row.projectName;
                        let projCode = row.projectCode;
        
                        let currRowData = {
                            name: name,
                            projCode: projCode
                        }
        
                        projects.push(currRowData)
                    });
        
                    res.status(200).send(projects)
                }
            });
        }
        else{
            res.status(404).send({msg: "No project data available"})
        }
    });
})


module.exports = router;