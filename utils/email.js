const pug = require('pug');
const htmlToText = require('html-to-text');

const nodemailer = require('nodemailer');

module.exports = class Email {
   constructor(user, url) {
      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.url = url;
      this.from = `Mehedi Islam <${process.env.EMAIL_FROM}>`;
   }

   newTransport() {
      if (process.env.NODE_ENV === 'production') {
         return 1;
      }
      return nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
         },
      });
   }

   // send the actual email
   async send(template, subject) {
      // render HTML based on a pug template
      const html = pug.renderFile(
         `${__dirname}/../views/email/${template}.pug`,
         {
            firstName: this.firstName,
            url: this.url,
            subject,
         }
      );

      // define the email options
      const mailOptions = {
         from: this.from,
         to: this.to,
         subject,
         html,
         text: htmlToText.fromString(html),
      };

      // create a transport and send email
      await this.newTransport().sendMail(mailOptions);
   }

   async sendWelcome() {
      await this.send('welcome', 'Welcome to the Tour Application!');
   }

   async sendPasswordReset() {
      await this.send(
         'passwordReset',
         'Your password reset token (valid for only 10 minutes)'
      );
   }
};
