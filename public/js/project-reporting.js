// File project-reporting.js
// Author: J. Fisher  Date: 02/09/2021
// Copyright 2021 by J. Fisher
// 
// Handle the form and api calls to give the instructor
// page student work details
// Modification log:
// 05/11/2021 Updated routes to work with mysql format

const numberOfDays = 6; 
let currProjectName = ""
$(function(){
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



    let form = $("#wsReportForm");

    //copied from ws-recording.js
    // adjust the heading name
    $('#lg-userToggle').html(window.localStorage.getItem("fName"));
    // find the user's projects and populate the project dropdown
    // 1. create the URL with an encoded query string
    let encodedQuery = encodeURIComponent(window.localStorage.getItem("email"));
    let projUrl = `/api/project?u=${encodedQuery}`;
    console.log(`URL for GET Projects ${projUrl}`);
    // make an ajax call to get the user's projects
    $.ajax({
        url: projUrl,
        method: "GET",
        dataType: "json"
    })
    .done((data, statusText, xhr)=>{
        console.log(`Get Projects Status Code: ${xhr.status}. Num projects returned: ${data.length}`);
        // Got the projects put in the dropdown 
        if (xhr.status == 200 && data.length > 0) {
            addProjects(data);
        }
        else{
            // user not assigned projects
            $('#acct-error').removeClass('hide');
        }
    });//end copied from ws-recording.js

    //handle submitting the form to search for time cards
    form.submit(function(event){
        event.preventDefault();

        let apiRoute = "/api/studentTotals?"

        //get date from form to send to API
        let startDate = $("#work-week").val();
        let project = $("#project").val();

        apiRoute = apiRoute + "p=" + project + "&w=" + startDate;
        $.ajax({
            url: apiRoute,
            method: "GET",
            dataType: "JSON"
        })
        .done(response => {
            //make html to put into table
            let table = $("#studentDataTable")
            //let allWorkSessions = response.allData;

            table.empty();
            response.summaries.forEach(function(studentData){
                let html = '<tr class="studentRow">';
                html += '\n<td class="stuNameCol">' + studentData.lastName + ", " + studentData.firstName + "</td>";
                html += '\n<td class="hrsCol">' + studentData.totHours + "</td>";
                html += '\n<td hidden>' + studentData.email + '</td>';
                html += "\n</tr>";
                table.append(html);
            });
        })
        .fail(function(response){
            if(response.status == 404){
                alert("No worksessions found");
            }
            else{
                alert("An unidentified error occurred")
            }
        });
    });

    $("table").delegate('tr.studentRow', 'click', function(event) {
        let currentRow = event.target.parentElement;
        let studentEmail = $(currentRow.children[2]).text();
        
        let projectCode = $("#project").val();
        let startDate = $("#work-week").val();

        startDate = new Date(Date.parse(startDate));
        let endDate = new Date(startDate.toString());
        endDate.setDate(endDate.getDate() + numberOfDays);

        /*
        let apiRoute = "/api/studentWorkWeek?"
        apiRoute += "p=" + projectCode + "&u=" + email + "&w=" + startDate;
        */
        
        //get studentData cookie 
        //code from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie\
        let wSessionCookie = JSON.parse(decodeURIComponent(document.cookie.split('; ').find(row => row.startsWith('studentData='))).split('=')[1])

        //decode stringified json. wSessionList is an array of json objects in the form
        // {
        //      email: email@example.com,
        //      workSessions: [
        //          workSession#1,
        //          workSession#2,
        //          ...
        //          workSession#n
        //      ]
        // }
        let wSessionList = wSessionCookie.sessions
        
        //get list of current student's work sessions
        let timeCards = wSessionList.find(element => element[0].email == studentEmail)

        //get student name from table and reformat it
        let name = $(currentRow.children[0]).text();
        let time = $(currentRow.children[1]).text();
        name = name.split(", ");
        name = name[1] + " " + name[0];
        
        //make modal header
        let headerHtml = '<ul>';
        headerHtml += '\n<li><b>Name: </b>' + name + '</li>';
        headerHtml += '\n<li><b>Week: </b>' + startDate.toJSON().slice(0,10) + ' to ' + endDate.toJSON().slice(0,10) + '</li>';
        headerHtml += '\n<li><b>Project: </b>' + $('#project option:selected').text() + '</li>';
        headerHtml += '\n<li><b>Total Hours: </b>' + time + '</li>';
        headerHtml += '\n</ul>';

        let bodyHtml = '<table class="table table-striped">';
        bodyHtml += '\n<thead>';
        bodyHtml += '\n<th><b>Date</b></th>';
        bodyHtml += '\n<th><b>Start</b></th>';
        bodyHtml += '\n<th><b>Finsh</b></th>';
        bodyHtml += '\n<th><b>Time</b></th>';
        bodyHtml += '\n<th><b>Code</b></th>';
        bodyHtml += '\n<th><b>Activity</b></th>';
        //make table with session info
        bodyHtml += '\n<tbody>';
        timeCards.forEach(function(card){
            // if the user has session, display the,
            if(card.sessionID != null){
                let start = card.startTime.split("T")[1].substring(0,5)
                let end = card.endTime.split("T")[1].substring(0,5)
                // divide by 1000* 60 to convert to hours from miliseconds (1000 miliseconds * 60 seconds * 60 minutes)
                let totTime = ((new Date(card.endTime) - new Date(card.startTime))/(1000 * 60 * 60)).toFixed(2);

                bodyHtml += "\n<tr>"
                bodyHtml += "\n<td>" + card.startTime.substring(0,10) + '</td>';
                bodyHtml += "\n<td>" + start  + '</td>';
                bodyHtml += "\n<td>" + end + '</td>';
                bodyHtml += "\n<td>" + totTime + '</td>';
                bodyHtml += "\n<td>" + card.code + '</td>';
                bodyHtml += "\n<td>" + card.description + '</td>';
                bodyHtml += "\n</tr>"
            }
            //otherwise show 0s and N/A
            else{
                bodyHtml += "\n<tr>"
                bodyHtml += "\n<td>" + "N/A" + '</td>';
                bodyHtml += "\n<td>" + "N/A"  + '</td>';
                bodyHtml += "\n<td>" + "N/A" + '</td>';
                bodyHtml += "\n<td>" + "0" + '</td>';
                bodyHtml += "\n<td>" + "N/A" + '</td>';
                bodyHtml += "\n<td>" + "N/A" + '</td>';
                bodyHtml += "\n</tr>"
            }
        });
        bodyHtml += '\n</tbody>';
        bodyHtml += '\n</table>';
        
        $('#studentData').html(headerHtml + bodyHtml);
        $("#student-reporting").modal("show");

    });
});


function getTotalHours(timeCardList){
    let totalHours = 0;

    timeCardList.forEach(function(session){
        let hours = session.finishHr - session.startHr;
        let minutes = (session.finishMin - session.startMin)/60;
        totalHours += hours + minutes;
    });

    return totalHours.toFixed(2);
}

//copied from ws-recording.js
function addProjects(projects){
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
//end copy from ws-recording.js