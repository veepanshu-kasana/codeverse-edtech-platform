const {contactUsEmail} = require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender");

exports.contactUsController = async (request,response) => {
    const {email, firstname, lastname, message, phoneNo, countrycode} = request.body;
    console.log(request.body);

    try {
        const emailResponse = await mailSender(
            email,
            "Your data send successfully",
            contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
        )
        console.log("Email Response ", emailResponse);
        return response.json({
            success:true,
            message: "Email sent successfully",
        });

    } catch(error) {
        console.log("Error", error);
        console.log("Error message: ", error.message);
        return response.json({
            success:false,
            message:"Something went wrong...",
        });
    }
}