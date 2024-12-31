const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            secure: false, //For curiosity
        });

        let info = await transporter.sendMail({
            from: `"CodeVerse | Veepanshu Kasana" <${process.env.MAIL_USER}>`, //Sender Adress
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })
        console.log(info.response);
        return info;
    }
    catch(error) {
        console.log(error.message);
        return error.message;
    }
}

module.exports = mailSender;