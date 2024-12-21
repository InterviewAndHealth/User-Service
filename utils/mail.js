const nodemailer = require("nodemailer")

const sendEmail = async (options) => {
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    })

    const { to, subject, html } = options

    const mail = {
      from: SMTP_USER,
      to,
      subject,
      html,
    }

    await transporter.sendMail(mail)
    return true
  } catch (error) {
    return false
  }
}

module.exports = sendEmail