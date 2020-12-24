const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendmail=(email,name)=>{
    sgMail.send({
        to: email,
        from: 'muhammadzain8@gmail.com',
        subject: 'Sending email ',
        text: `welcome to the app  ${name}`,
        html:'<div class="container" style="background-color:gray"><h1> Email send by Zain </h1> </div>' 
      })
}

const sendmail_for_response=(email,name)=>{
    sgMail.send({
        to: email,
        from: 'muhammadzain8@gmail.com',
        subject: 'Sending email ',
        text: `bye ${name}`,
        html:'<div class="container" style="background-color:gray"><h1> Can i know why u removed you account thanks </h1> </div>' 
      })
}

module.exports={
    sendmail,
    sendmail_for_response
}
