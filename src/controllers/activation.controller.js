import nodemailer from "nodemailer";
import User from "../models/user.model";
import registrationToken from "../models/registrationToken.model";
import crypto from "crypto";
import config from "../config/config";

const failedUserActivation = async (req, res, next) => {
  const user = await User.findOne({ email: req.param.email }).exec();
  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }
  // Add mail and id to request to rerequest the activation token
  req.ownProfile._id = user._id;
  req.ownProfile.email = user.email;
  next();
};

const requestUserActivation = async (req, res) => {
  // Add email for rerequest? to find user
  const oldtoken = await registrationToken.findOne({
    user: req.ownProfile._id
  });
  if (oldtoken) {
    await oldtoken.deleteOne();
  }
  const registerToken = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .createHmac("sha256", config.userActivationSalt)
    .update(registerToken)
    .digest("hex");
  const token = new registrationToken({
    user: req.ownProfile._id,
    token: hash
  });

  try {
    await token.save();
  } catch (err) {
    return res.status(500).json({
      what: err.name,
      error: err.message
    });
  }
  const link =
    "http://app.kodebi.de/auth/completeRegistration/" +
    registerToken +
    "/" +
    req.ownProfile._id;

  if (process.env.NODE_ENV === "test") {
    // Get token directly for testing
    return res.status(200).json({
      message: "Benutzer erfolgreich erstellt!",
      user: req.ownProfile._id,
      token: registerToken
    });
  }

  sendRegisterUserMail(req.ownProfile.email, link);

  return res.status(200).json({
    message: "Benutzer erfolgreich erstellt!",
    user: req.ownProfile
  });
};

async function sendRegisterUserMail(mailTo, resetLink) {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: config.mailSmtpServer,
    port: 465,
    secure: true,
    auth: {
      user: config.mailUser,
      pass: config.mailPass
    }
  });

  const mailFrom = { name: "Kodebi Passwort", address: config.mailFrom };

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: mailFrom,
    bcc: mailFrom, // also send to self for docu
    to: mailTo, // list of receivers
    subject: "Kodebi Benutzer aktivieren", // Subject line
    text:
      "Um deinen Benutzer zu aktivieren klicke bitte diesen Link: " + resetLink, // plain text body
    html:
      "<b>Um deinen Benutzer zu aktivieren klicke bitte diesen Link:</b>" +
      resetLink // html body
  });

  console.log("Message sent: %s", info.messageId);
}

const activateUser = async (req, res) => {
  // We need userid, reset token
  const activateToken = await registrationToken
    .findOne({ user: req.params.userId })
    .exec();

  if (!activateToken) {
    return res.status(401).json({
      error: "Token not found"
    });
  }
  const hash = crypto
    .createHmac("sha256", config.userActivationSalt)
    .update(req.params.token)
    .digest("hex");
  const keyBuffer = Buffer.from(hash, "hex");
  const hashBuffer = Buffer.from(activateToken.token, "hex");
  const isValid = crypto.timingSafeEqual(keyBuffer, hashBuffer);
  if (!isValid) {
    await activateToken.deleteOne();
    return res.status(401).json({
      error: "Invalid or expired user activation token"
    });
  }

  try {
    await User.findByIdAndUpdate(req.params.userId, {
      activated: true
    }).exec();
  } catch (err) {
    return res.status(500).json({
      what: err.name,
      error: err.message
    });
  }

  await activateToken.deleteOne();
  return res.status(200).json({
    message:
      "Benutzer Registrierung abgeschlossen! Du kannst dich jetzt anmelden."
  });
};

export default { requestUserActivation, activateUser, failedUserActivation };
