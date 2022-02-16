import mongoose from "mongoose";
import server from "../src/server";
import bookModel from "../src/models/book.model";
import Users from "../src/models/user.model";

// For testing
import chai from "chai";
import chaiHttp from "chai-http";
import "chai/register-should";

let should = chai.should();

// Own db for testing
process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";
process.env.NODE_ENV = "test";

chai.use(chaiHttp);
//Our parent block
describe("Users", () => {
  beforeEach((done) => {
    //Before each test we empty the database
    Users.remove({}, (err) => {
      done();
    });
  });

  describe("/POST /api/users", () => {
    it("Create a user", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .send({
          username: "Testi",
          email: "test@testi.de",
          password: "tester1"
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.have.property("message");
          res.body.should.have.property("user");
          res.body.should.have.property("token");

          const testToken = res.body.token;
          const userId = res.body.user;
          const postRoute = "/completeRegistration/" + testToken + "/" + userId;

          chai
            .request(server)
            .get(postRoute)
            // .send({
            //   username: "Testi",
            //   email: "test@testi.de",
            //   password: "tester1"
            // })
            .end((err, res) => {
              if (err) {
                done(err);
              }
              res.should.have.status(200);
              res.body.should.have.property("message");
              done();
            });
        });
    });
  });
});
