let userId = JSON.parse(localStorage.db).user[0].id;
let current_date = new Date().toLocaleDateString("fr");
let useremail = `${userId}@gmail.com`;
let chat_variables = {
    lang: "fr",
    userName:  `John ${userId} DO`,
    userFirstName: `John ${userId}`, 
    userLastname: "DO",
    userMobile: "229229229229", 
    userEmail: useremail,
    now: "31/01/2024", 
    agentName: "Discutez avec Jack et Maurice", 
    mode: "DEV"
}

let isFirstStart = true;
window.userUri = 'wss://mobile.jacketmaurice.com/ws';
window.hostUrl = 'mobile.jacketmaurice.com';
window.scenarioGuid = '27ae2257-8ca6-479d-a302-f41ebb20a682';
window.discussion_id    = localStorage.getItem("current_discussion_id")
window.userEmail = useremail;
window.userVariables = JSON.stringify(chat_variables);
window.userProject = null;
window.userAccessToken = 'authtoken';

start(window.userUri, window.hostUrl, window.scenarioGuid, window.userEmail, window.userVariables, window.userProject,window.discussion_id,api_callback);

setTimeout(() => {
    let userId = JSON.parse(localStorage.db).user[0].id;
    addDiscussion(userId, localStorage.getItem("current_discussion_id"));
},5000);