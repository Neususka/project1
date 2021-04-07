document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Calling the send_email function to submit the email
  document.querySelector('#compose-form').addEventListener('submit', send_email);
}



function load_mailbox(mailbox) {

  // Show the mailbox's name and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch to get emails data from mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Getting the most recent emails using sort function
    var sortJson = emails.sort(function (a, b) {
      return a.timestamp - b.timestamp;
    })
    //console.log(sortJson);
    create_div(sortJson, mailbox);
  })
}



// Create a div to show all the emails from a mailbox
function create_div(emails, mailbox) {

  for (var i=0; i < emails.length; i++) {
    const email_id = emails[i].id;
    let element = [];
    element[i] = document.createElement('div');
    element[i].className = 'email-div';
    element[i].id = `email-div-${email_id}` 

    let div = [];
    div[i] = document.createElement('div');
    
    if (mailbox === 'inbox') {
      // Check if an email is read 
      if (emails[i].read === true) {
        element[i].style.backgroundColor = "lightgray";   
      } else {
        element[i].style.backgroundColor = "white";
      }
      div[i].innerHTML =`<div class="row"><div class="col-10 bg" id="div-div1-${email_id}"></div><div class="col-2 bg" id="div-div2-${email_id}"></div></div>`
      element[i].innerHTML = `<div class="row"><div class="col bg">${emails[i].sender}</div><div class="col-6 bg">${emails[i].subject}</div><div class="col bg">${emails[i].timestamp}</div></div></div>`;      
      document.querySelector('#emails-view').append(div[i]);
      document.querySelector(`#div-div1-${email_id}`).append(element[i]);
      archive_email(email_id);

    } else if (mailbox === 'sent') {
      element[i].innerHTML = `<div class="row"><div class="col bg">${emails[i].recipients}</div><div class="col-6 bg">${emails[i].subject}</div><div class="col bg">${emails[i].timestamp}</div></div>`;
      document.querySelector('#emails-view').append(element[i]);

    } else if (mailbox === 'archive') {
      // Check if an email is archived 
      if (emails[i].archived === true) {
        div[i].innerHTML =`<div class="row"><div class="col-10 bg" id="div-div1-${email_id}"></div><div class="col-2 bg" id="div-div2-${email_id}"></div></div>`
        element[i].innerHTML = `<div class="row"><div class="col bg">${emails[i].sender}</div><div class="col-6 bg">${emails[i].subject}</div><div class="col bg">${emails[i].timestamp}</div></div></div>`;      
        document.querySelector('#emails-view').append(div[i]);
        document.querySelector(`#div-div1-${email_id}`).append(element[i]);
        unarchive_email(email_id);
      }
    }
    // Call the function to show contents of an email
    show_contents(mailbox, element[i], email_id);  
  }
}



// Use fetch GET email id to show email contents when clicking a div element
function show_contents(mailbox, element, email_id) {

  element.addEventListener('click', function(e) {  
    fetch('/emails/' + email_id)
    .then(response => response.json())
    .then(email => {
      // Call the function to mark an email as read
      email_read(email);
      document.querySelector('#emails-view').innerHTML = 
      '<strong>From: </strong>' + email.sender + '<br>'  + '<strong>To: </strong>' + email.recipients + '<br>' + '<strong>Subject: </strong>' + email.subject + '<br>' + '<strong>Date: </strong>' + email.timestamp + '<br>' + '<strong>Body: </strong>' + email.body;
      if (mailbox === 'inbox') {
        create_reply(email);
      }
    })
    .catch(error => console.log(error));
  });
}



// Reply to an email
function create_reply(email) {
  const email_id = email.id;
  var btn = document.createElement("button");
  btn.className = 'btn-reply';
  btn.id = `btn-${email_id}`
  btn.innerHTML = 'Reply';
  document.querySelector('#emails-view').append(btn);
  document.querySelector(`#btn-${email_id}`).addEventListener("click", function() {
    compose_reply(email);
  });
}



// Compose email to reply an email
function compose_reply(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#n-email').innerHTML = 'Reply Email';

  // Fill out the composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
  document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender + ' wrote: ' + email.body + '\n' + '\n';

  // Calling the send_email function to submit the email
  document.querySelector('#compose-form').addEventListener('submit', send_email);
}



// Mark an email as read
function email_read(email) {

  const email_id = email.id;
  // Fetch to PUT read = true 
  fetch('/emails/' + email_id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .then(response => response.text())
  .catch(error => console.log(error));
}



// Archive an email
function archive_email(email_id){
  //console.log(email_id);
  var button = document.createElement("button");
  button.className = 'btn-elem';
  button.id = `btn-${email_id}`
  button.innerHTML = 'Archive';
  document.querySelector(`#div-div2-${email_id}`).append(button);
  document.querySelector(`#btn-${email_id}`).addEventListener("click", function(event) {
    event.preventDefault();
    // Fetch to archive email 
    fetch('/emails/' + email_id, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    .then(response => {
      response.text();
      if(response.status === 204){
        load_mailbox('inbox');
      }
    })
    .catch(error => console.log(error));
  });
}



// Unarchive an email
function unarchive_email(email_id){

  var button = document.createElement("button");
  button.className = 'btn-elem';
  button.id = `btn-${email_id}`
  button.innerHTML = 'Unarchive';
  document.querySelector(`#div-div2-${email_id}`).append(button);
  document.querySelector(`#btn-${email_id}`).addEventListener("click", function(event) {
    event.preventDefault();
    // Fetch to archive email 
    fetch('/emails/' + email_id, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    .then(response => {
      response.text();
      if(response.status === 204){
        load_mailbox('inbox');
      }
    })
    .catch(error => console.log(error));
  });
}



// Send an email
function send_email(event) {

  event.preventDefault();
  
  // Save composition fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Fetch post request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    if(result.error) {
      document.getElementById('error').innerHTML = result.error;
      setTimeout(function(){ document.getElementById("error").innerHTML = "" }, 3000);
    } else if(result.message){
      document.getElementById('success').innerHTML = result.message;
      setTimeout(function(){ document.getElementById("success").innerHTML = "" }, 3000);
      setTimeout(function(){ load_mailbox('sent') }, 2000);
    }
  })
  .catch(error => console.log(error));
  document.querySelector('#n-email').innerHTML = 'New Email';
}

