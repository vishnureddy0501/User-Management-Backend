import nodemailer from "nodemailer";

export default function send_mail(pemail, text, subject) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "gujjulavishnuvardhanreddy8179@gmail.com",
      pass: "pkyzpcoziepmenpd",
    },
  });
  const mailOptions = {
    from: "gujjulavishnuvardhanreddy8179@gmail.com",
    to: pemail,
    subject: subject,
    text: text,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("email sent successfully");
    }
  });
}
