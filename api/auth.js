// File: auth.js
// Author:  S. Sigman   Date: 11/23/2020
// Copyright 2021 Scott Sigman
// 
// This file defines a route to authenticate a user.
// API
//  Resource   Req Verb  Description               Status Code
//  /auth        POST    Authenticate User         200 (user authenticated)
//                                                 401 (authentication failed)
//
// Modification Log
// 1/17/2021 Reused code from App Dev I 2020 project. S. Sigman
// 1/17/2021 Modified query to include password. S. Sigman
// 4/22/2021 Modified Query to use MySql
// 9/14/2021 Modified MySql queries to be resistant to SQL injections

const bodyParser = require("body-parser");
//const { $where } = require("../models/user");
const router = require("express").Router();
//const User = require("../models/user");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const key = "supersecret";
const conn = require("../mysqldb");
router.use(bodyParser.json());

router.post('/',async (req,res) => {
    console.log(`Auth called for ${req.body.email}`);

    //find user
    let qry = "SELECT email, passwordHash, lname, fname, role, created FROM User WHERE email = ?;";
    
    //query the database
    conn.query(qry, [req.body.email], async (err, rows) => {
        console.log(err)
        if (err) return res.status(500).json({error: err});

        if(rows.length != 1){
            res.status(500).json({error: "Improper number of users returned"})
        }
        else{
            user = rows[0];
            //get password hash
            const passHash = user.passwordHash;

            //check if hash and plain text password match
            let result = await bcrypt.compare(req.body.password, passHash);
            console.log("Result:", result)

            //if user is found and password matches hash
            if(result){
                const token = jwt.encode({username: req.body.email}, key);
                res.status(200).json({msg: 'user authenticated', 
                                        fname: user.fname, 
                                        lname: user.lname, 
                                        role: user.role,
                                        token: token});
            }

            //if user is found and password doesn't match
            else{
                res.status(401).json({msg: 'user unauthorized'});
            }
        }
    });
});

module.exports = router;
