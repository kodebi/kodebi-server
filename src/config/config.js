import dotenv from "dotenv";

dotenv.config();

let cMongoUri = process.env.MONGODB_URI;
if (process.env.NODE_ENV === "test") {
    cMongoUri = process.env.MONGODB_URI_TEST;
}

const config = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4000,
    jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
    mongoUri: cMongoUri,
    mailUser: process.env.MAIL_USER,
    mailPass: process.env.MAIL_PASS,
    mailFrom: process.env.MAIL_FROM,
    mailSmtpServer: process.env.MAIL_SERVER,
    passwortResetSalt: process.env.PASSWORD_RESET_SALT || "YOUR_secret_key",
    ImagePublicKey: process.env.IMAGEKIT_PUB_KEY,
    ImagePrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    ImageUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    userActivationSalt: process.env.USER_ACTIVATION_SALT || "YOUR_secret_key"
};

export default config;
