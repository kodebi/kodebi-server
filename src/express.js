import express from "express";
import cookieParser from "cookie-parser";
import compress from "compression";
import cors from "cors";
import helmet from "helmet";
import mainRoutes from "./routes/main.routes";
// import path from "path";
// import config from "./config/config";

// const CURRENT_WORKING_DIR = process.cwd();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());

// Secure app
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["https://fonts.gstatic.com"],
      imgSrc: ["'self'", "https://ik.imagekit.io"],
      baseUri: ["'self'"]
    }
  })
);
// Cross Origin Resource Sharing
app.use(cors());

// Serve up static files when deployed
// if (config.env === "production") {
//   app.use(express.static(path.join(CURRENT_WORKING_DIR, "client/build")));
// }

// use morgan + winston for logging
// Use rate-limiter
// rate-limiter-flexible

// mount routes
app.use("/", mainRoutes.mainRouter);

// app.get("*", (req, res) => {
//   res.sendFile(path.join(CURRENT_WORKING_DIR + "/client/dist/index.html"));
//   if (err) {
//     res.status(500).send(err);
//   }
// });

export default app;
