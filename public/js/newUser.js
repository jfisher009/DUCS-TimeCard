// File newUser.js
// Author: J. Fisher  Date: 05/10/2021
// Copyright 2021 by J. Fisher
// 
// Handle the form and api calls to make a new user account



$(function(){
    //change if student or instruct account info is shown
    $("#accountType").change(function(){
        if($("#accountType").val() == "student"){
            $("#studentInfo").attr("hidden", false);
            $("#instructorInfo").attr("hidden", true);
        }
        else{
            $("#studentInfo").attr("hidden", true);
            $("#instructorInfo").attr("hidden", false);
        }
    });


    $("#newUserForm").submit((event) => {
        event.preventDefault();
        //hide all password erros
        errors = ["too_short","too_long","no_num","no_letter","must_match"]
        errors.forEach(function(error){
            $('#'+error).attr("hidden", true);
        })

        //get data from form
        let fname = $('#fname').val();
        let lname = $('#lname').val();
        let email = $('#email').val();
        let password = $('#password').val();
        let retypedPassword = $('#retypedPassword').val();
        let role = $("#accountType").val();
        let roleInfo;
        if(role == "student"){
            roleInfo = {
                major: $("#major").val(),
                gradYear: $("#gradYear").val()
            }
        }
        else{
            roleInfo = {
                department: $("#department").val(),
                officeAddress: $("#offAdd").val()
            }
        }

        let check = checkPwd(password, retypedPassword);
        //alert user to password errors
        check.forEach(function(error){
            $('#'+error).attr("hidden", false);
        })

        //if there are no password errors, try to create user
        console.log(check)
        console.log(check.length == 0)
        if(check.length == 0){

            let userData = {
                email: email,
                password: password,
                fname: fname, 
                lname: lname, 
                role: role,
                roleInfo: roleInfo
            }

            console.log(userData)
            // make the API call
            $.ajax({
                url: "/api/user",
                method: "POST",
                data: JSON.stringify(userData),
                contentType: "application/json",
                dataType: "json"
            })
            .always(function(response){
                console.log(response)
                if(response.status == 201){
                    alert("User created");
                    window.location.replace("index.html");
                }
                else if (response.status = 409){
                    alert("A user with this email already exists");
                }
                else if (response.status = 409){
                    alert("An error occured while saving the new user. Please contact a site admin for help.");
                }
                else if (response.status = 409){
                    alert("An unidentified error occured. Please contact a site admin for help.");
                }
            })
        }
    });
});

// function checkPwd adpated from https://stackoverflow.com/questions/7844359/password-regex-with-min-6-chars-at-least-one-letter-and-one-number-and-may-cont 
function checkPwd(pass, passcheck) {
    let errors = []
    if (pass.length < 8) {
        errors.push("too_short");
    }
    else if (pass.length > 50) {
        return("too_long");
    } 
    if (pass.search(/\d/) == -1) {
        errors.push("no_num");
    }
    if (pass.search(/[a-zA-Z]/) == -1) {
        errors.push("no_letter");
    }
    if(pass != passcheck){
        errors.push("must_match")
    }

    return errors;
}