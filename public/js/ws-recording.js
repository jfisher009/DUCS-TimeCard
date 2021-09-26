// File: ws-recording.js
// Author: S. Sigman   Date: 1/19/2021
// Copyright 2021 by Scott Sigman
//
// This file defines the functionality for the work session recording
// page of the application.
// 
// Sidebar code from: https://bootstrap-menu.com/detail-offcanvas-mobile.html
//
// Modification:  
// 1/31/21 - Added functionality for code 90 and added verification on times

$(() => {
    // create an instance of the work session recording page of the app
    stuWSApp = new WSApp("DUCS Time Tracker");
    stuWSApp.initialize();
});

class WSApp {
    constructor (name) {
        this.title = name;
    }

    get getTitle() {
        return this.title;
    }

    initialize () {
        //set functionality of log out button
        let signOut = $("#signOutButton");
        signOut.click(function(){
            localStorage.setItem('fName','');
            localStorage.setItem('email','');
            localStorage.setItem('jwt-token','');
            window.location.replace("index.html");
            $.ajax({
                url: "/api/logout",
                method: "POST",
                dataType: "json"
            })
        });
        
        // adjust the heading name
        $('#lg-userToggle').html(window.localStorage.getItem("fName"));
        
        // find the user's projects and populate the project dropdown
        // 1. create the URL with an encoded query string
        let encodedQuery = encodeURIComponent(window.localStorage.getItem("email"));
        let projUrl = `/api/project?u=${encodedQuery}`;
        // make an ajax call to get the user's projects
        $.ajax({
            url: projUrl,
            method: "GET",
            dataType: "json"
        })
        .done((data, statusText, xhr)=>{
            // Got the projects put in the dropdown 
            if (xhr.status == 200 && data.length > 0) {
                this.addProjects(data);
            }
            else{
                // user not assigned projects
                $('#acct-error').removeClass('hide');
            }
        });

        // initialization for sidebar menu
        $("[data-trigger]").on("click", function(e){
            e.preventDefault();
            e.stopPropagation();
            var offcanvas_id =  $(this).attr('data-trigger');
            $(offcanvas_id).toggleClass("show");
            $('body').toggleClass("offcanvas-active");
            $(".screen-overlay").toggleClass("show");
    
            // check if a section needs to be hidden
            if ($('#stu-col').css("display") == "block") 
              $('#stu-col').css("display", "none");
    
            if ($('#inst-col').css("display") == "block") 
              $('#inst-col').css("display", "none");
    
            if ($('#about-info').css("display") == "block") 
              $('#about-info').css("display", "none");
    
        }); 
    
           // Close menu when pressing ESC
        $(document).on('keydown', function(event) {
            if(event.keyCode === 27) {
               $(".mobile-offcanvas").removeClass("show");
               $("body").removeClass("overlay-active");
            }
        });
    
        $(".btn-close, .screen-overlay").click(function(e){
            $(".screen-overlay").removeClass("show");
            $(".mobile-offcanvas").removeClass("show");
            $("body").removeClass("offcanvas-active");
        }); 
    
        $("#stu-info-btn, #inst-info-btn, #about-info-btn").click((event)=> {
            // remove the sidebar
            $(".screen-overlay").removeClass("show");
            $(".mobile-offcanvas").removeClass("show");
            $("body").removeClass("offcanvas-active");
    
            // show the card
            if (event.target.id=="stu-info-btn") {
                $('#stu-col').css("display","block");
            }
    
            if (event.target.id == "inst-info-btn") {
                $('#inst-col').css("display","block");
            }
    
            if (event.target.id == "about-info-btn") {
                $('#about-info').css("display","block");
            }
        });

        //handle submitting the form
        $('#wsForm').submit((event)=>{
            event.preventDefault();

            //get data
            let owner = window.localStorage.getItem("email");
            let project = $("#project").val();
            let date = $("#ws-date").val();
            let startTime = $("#startTime").val();
            let finishTime = $("#finishTime").val();
            let code = Number($("#code").val());
            let other = $("#otherCategory").val();
            let description = $("#desc").val();

            let data = {
                owner: owner,
                project: project,
                wsDate: date,
                startTime: startTime,
                finishTime: finishTime,
                code: code,
                other: other,
                desc: description
            }
            
            $.ajax({
                url: "/api/wsession",
                method: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json"
            }).always(function(data){
                alert(data.msg);
            })
        })

        //set max date to today's date on date picker
        let date = new Date();
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = String(date.getFullYear());
        $("#ws-date").attr("max", year+"-"+month+"-"+day)

        //make sure start time is before end time
        $("#finishTime").change(function(event){
            let start = $("#startTime").val().split(":");
            let end = $("#finishTime").val().split(":");
            let startHours = start[0];
            let startMinutes = start[1];
            let endHours = end[0];
            let endMinutes = end[1];
            //set startTime to endTime if endTime is before startTime
            if(startHours > endHours || (startHours == endHours && startMinutes > endMinutes)){
                $("#startTime").val(end);
                $("#startTime").trigger("change");
            }
            if($("startTime").val() != null){
                alert("Please make sure that the start time entered is before the end time.")
            }
            updateHours();
        });
    
        $("#startTime").change(function(event){
            let start = $("#startTime").val().split(":");
            let end = $("#finishTime").val().split(":");
            let startHours = start[0];
            let startMinutes = start[1];
            let endHours = end[0];
            let endMinutes = end[1];
            //set startTime to endTime if endTime is before startTime
            if(startHours > endHours || (startHours == endHours && startMinutes > endMinutes)){
                $("#finishTime").val(start);
            }
            if($("finishTime").val() != null){
                alert("Please make sure that the start time entered is before the end time.")
            }
            updateHours();
        });

        //update the total number of hours worked
        function updateHours(){
            let start = $("#startTime").val().split(":");
            let end = $("#finishTime").val().split(":");
            if(end != "" && start!= ""){
                let startHours = start[0];
                let startMinutes = start[1];
                let endHours = end[0];
                let endMinutes = end[1];
                let totHours = parseInt(endHours - startHours).toString();
                let totMinutes = parseFloat((endMinutes -startMinutes)).toString();
                if(totHours.length == 1){
                    totHours = "0" + totHours;
                }
                if(totMinutes.length == 1){
                    totMinutes = "0" + totMinutes;
                }
                let totTime = totHours + ":" + totMinutes;
                $("#totTime").val(totTime);
            }
        }

        //display and hide other cattegory depending on code select
        $("#otherCategoryDiv").hide();
        $("#code").change(function(){
            if($("#code").val() == "90"){
                $("#otherCategory").attr("hidden",false);
                //require when shown
                $("#otherCategory").attr("required",true);
            }
            else{
                $("#otherCategory").attr("hidden",true);
                //do not require when not shown
                $("#otherCategory").attr("required",false);
            }
        });
    }

    

    addProjects(projects) {
        for(let i=0; i<projects.length; i++) {
            let proj = `<option value=${projects[i].projCode}`;
            if (i==0){
                proj += ` selected>`;
            }
            else {
                proj += '>'
            }
            proj += `${projects[i].name}</option>`

            // put in dropdown list
            $('#project').append(proj);
        }
    }
}