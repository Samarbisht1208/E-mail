document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // submitting the composed email
  document.querySelector('#compose-form').addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#specific-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // Show the specific mail info and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#specific-email').style.display = 'block';
      
      // ... do something else with email ...
      document.querySelector('#specific-email').innerHTML = `
        <ul class="list-group">
          <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
          <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
          <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
          <li class="list-group-item"><strong>Tiemstamp:</strong> ${email.timestamp}</li>
          <li class="list-group-item">${email.body}</li>
          <br>
        </ul>
      ` 

      //creating a button for archive
      const btn_arch = document.createElement('button');
      btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive"
      btn_arch.className = email.archived ? "btn btn-success" : "btn btn-danger"
      btn_arch.style.marginRight = '10px'
      btn_arch.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => { load_mailbox('archive')})
      });
      document.querySelector('#specific-email').append(btn_arch);


      // making the reply button
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply"
      btn_reply.className = "btn btn-info"
      btn_reply.addEventListener('click', function() {
        compose_email();
        //reciepent
        document.querySelector('#compose-recipients').value = email.sender;
        var inputField = document.getElementById('compose-recipients');
        inputField.disabled = true;
        //subject
        let subject = email.subject;
        if (subject.split(' ',1)[0] != "Re:") {
          document.querySelector('#compose-subject').value =`Re: ${email.subject}`;
        } else {
          document.querySelector('#compose-subject').value = email.subject;
        }
        //body
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector('#specific-email').append(btn_reply);
  });
}


// Function to mark the message as read
function markAsRead(id) {
  //changing the read object value
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#specific-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //getting all the mail and user
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // iterate through all emails and create a div for each
      emails.forEach(single_email => {

        //getting the mail info
        console.log(single_email);

        // creating div for each
        const new_email = document.createElement('div');
        // new_email.setAttribute('id', 'myDivId');
        // selecting the div colour for read and unread message 
        if (single_email.read === false) {
          new_email.style.backgroundColor = 'white';
        } else {
          new_email.style.backgroundColor = 'gray';
        }
        //here is css (it is just for styling)
        new_email.className = "list-group-item";
        new_email.innerHTML = `
          <h6>Sender: ${single_email.sender}</h6>
          <h5>Subject: ${single_email.subject}</h5>
          <p>${single_email.timestamp}</p>
          `;
        //change backgroung colour for read message and goint my view to specific email
        new_email.addEventListener('click', function() {
          markAsRead(single_email.id);
          view_email(single_email.id);
        });
        document.querySelector('#emails-view').append(new_email);
      })
  });
}







// todo function
function send_email(event){
  event.preventDefault();
  
  // storing the data
  const send_recipients = document.querySelector('#compose-recipients').value;
  const send_subject = document.querySelector('#compose-subject').value;
  const send_body = document.querySelector('#compose-body').value;

  // sending data from front end to back end
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: send_recipients,
        subject: send_subject,
        body: send_body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}



