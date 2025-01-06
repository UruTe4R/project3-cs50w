document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send email
  document.querySelector('#compose-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    console.log(`Sending email to ${recipients} with subject ${subject} and body ${body}`)
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
      console.log('result:', result)
      console.log('message:', result.message)
      if (result.message === 'Email sent successfully.') {
        load_mailbox('sent')
      }
      if (result.error) {
        console.log(result.error)
      }

    })
    .catch(error => {
      console.log(error)
    })
  });
  

// closing parenthesis
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = '';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
	
	// Get emails based on mailbox name
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const id = email["id"]
      const sender = email["sender"]
			const recipients = email["recipients"]
			const subject = email["subject"]
			const body = email["body"]
			const timestamp = email["timestamp"]

			// Create container, then add subject, sender, timestamp
			const container = document.createElement('div')
			container.classList.add('email-container')

      // Read Status changes the background color
      if (email["read"] === true) {
        container.style.backgroundColor = "lightgray"
      } else {
        container.style.backgroundColor = "white"
      }

			const emailSubject = document.createElement('div')
			emailSubject.classList.add('email-subject')
			emailSubject.innerHTML = subject

			const emailSender = document.createElement('div')
			emailSender.classList.add('email-sender')
			emailSender.innerHTML = sender
			
			const emailTimestamp = document.createElement('div')
			emailTimestamp.classList.add('email-timestamp')
			emailTimestamp.innerHTML = timestamp

      container.append(emailSubject, emailSender, emailTimestamp)
      document.querySelector('#emails-view').append(container)

      // Create Archive button w/ event listener
      const archiveButton = document.createElement('button')
      archiveButton.classList.add('btn', 'btn-sm', 'btn-primary')

      const archiveState = email["archived"] ? 'Unarchive' : 'Archive'
      archiveButton.innerHTML = archiveState
      archiveButton.addEventListener('click', (e) => {
        e.stopPropagation()
        fetch(`emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email["archived"]
          })
        })
        .then(response => {
          if (response.status === 204) {
            console.log("Email archived.")
          }
        })
        .catch(error => {
          console.log('Error:', error)
        })
        .finally(() => {
          load_mailbox('inbox');
        });
      });
      
			container.append(emailSender, emailSubject, emailTimestamp, archiveButton)
      container.append(archiveButton)
      

      
      // Add click event to container
			container.addEventListener('click', () => {
        
        // Toggle read status
        if (!email["read"]) {
          fetch(`emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          })
          .then(response => {
            // PUT does not return JSON body
            if (response.status === 204) {
              console.log("Email read status = true.");
            } 
          })
          .catch(error => {
            console.log('Error:', error);
          })
          
        }
        
        // GET email to render
        console.log(id)
        load_mail(id)

        // Closing Eventlistener
			})

      
    })
  })
  .catch(error => {
    console.log(error)
  })


  // Change button 
  if (mailbox === 'sent') {

  }
  else if (mailbox === 'archive') {

  }
}

function load_mail(id) {
  fetch(`emails/${id}`)
    .then(response => response.json())
    .then(email => {
      const sender = email["sender"]
      const recipients = email["recipients"]
      const subject =  email["subject"]
      const timestamp = email["timestamp"]
      const body = email["body"]

      const emailView = document.querySelector("#email-view")
      // Reset emails-view and email-view
      emailView.innerHTML = ''
      document.querySelector('#emails-view').style.display = 'none';

      // header.email-header>(div.infos>div.bold+div.info)*4+div.email-body
      const header = document.createElement('header')
      header.classList.add('email-header')
      emailView.append(header)
      
      const boldTexts = ['From:', 'To:', 'Subject:', 'Timestamp:']
      const emailInfos = [sender, recipients, subject, timestamp]
      for (let i = 0; i < 4; i++) {
        const infos = document.createElement('div')
        infos.classList.add('infos')
        const bold = document.createElement('div')
        bold.classList.add('bold')
        bold.innerHTML = `${boldTexts[i]}`
        const info = document.createElement('div')
        info.classList.add('info')
        info.innerHTML = `${emailInfos[i]}`
        infos.append(bold, info)
        emailView.append(infos)
      }
      emailBody = document.createElement('div')
      emailBody.classList.add('email-body')
      emailBody.innerHTML = body

      // Add Reply button
      const replyButton = document.createElement('input')
      replyButton.type = 'button'
      replyButton.value = 'Reply'
      replyButton.classList.add('btn', 'btn-sm', 'btn-outline-primary')

      // Add eventListener to reply button
      // replyButton.addEventListener('click', {

      // })

      emailView.append(replyButton, document.createElement('hr'), emailBody)
    })
    .catch(error => {
      console.log(error)
    })
}
