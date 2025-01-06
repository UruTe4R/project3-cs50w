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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

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

			container.append(emailSender, emailSubject, emailTimestamp)
			document.querySelector('#emails-view').append(container)

      
      // Click event to container
			container.addEventListener('click', () => {
        
        // Toggle read status
        if (!email["read"]) {
          fetch(`emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          })
          .then(response => response.json())
          .then(result => {
            console.log(result)
          })
          .catch(error => {
            console.log(error)
          })
 
        }
        
        // GET email to render
        fetch(`emails/${id}`)
        .then(response => response.json())
        .then(email => {
          const sender = email["sender"]
          const recipients = email["recipients"]
          const subject =  email["subject"]
          const timestamp = email["timestamp"]
          const body = email["body"]

          const emailsView = document.querySelector("#emails-view")
          // Reset emails-view
          emailsView.innerHTML = ''

          // header.email-header>(div.infos>div.bold+div.info)*4+div.email-body
          const header = document.createElement('header')
          header.classList.add('email-header')
          emailsView.append(header)
          
          const boldTexts = ['From', 'To', 'Subject', 'Timestamp']
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
            emailsView.append(infos)
          }
          emailBody = document.createElement('div')
          emailBody.classList.add('email-body')
          emailBody.innerHTML = body
          emailsView.append(emailBody)
        })
        .catch(error => {
          console.log(error)
        })

        // Closing Eventlistener
			})

      
    })
  })
  .catch(error => {
    console.log(error)
  })
}
