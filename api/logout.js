// File: logout.js
// Author:  S. Sigman   Date: 03/24/2021
// Copyright 2021 Julian Fisher
// 
// This file defines a route to destroy a session
// API
//  Resource   Req Verb  Description               Status Code
//  /auth        POST    Destory Session           200 (session destoryed)

const router = require("./studentTotals");

router.post('/', function(req,res){
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.clearCookie('studentData');
    res.status(200).json('{msg: session destroyed}');
})

module.exports=router;