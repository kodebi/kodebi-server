import config from "./config/config";
import app from "./express";
import mongoose from "mongoose";

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.info("connected to database: " + config.mongoUri);
    startServer();
  })
  .catch((error) =>
    console.info(
      "connection error for db: " + config.mongoUri + " error: " + error
    )
  );

// monitor db connection
const db = mongoose.connection;
db.on("disconnected", () => {
  console.info(
    "disconnected from database: " + config.mongoUri + ", reconnecting..."
  );
});
db.on("reconnected", () => {
  console.info("reconnected to database: " + config.mongoUri);
});
db.on("error", (error) => {
  console.error("database: error: " + error);
  process.exit(1);
});

function startServer() {
  app.listen(config.port, (err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.info("Server started on port %s.", config.port);
  });
}

export default app; // for testing
