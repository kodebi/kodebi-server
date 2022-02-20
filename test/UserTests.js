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

  let dummyUserId = "000";

  describe("/POST /api/users", () => {
    it("Create a dummy user", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .send({
          username: "Dummy",
          email: "dummy@testDummy.de",
          password: "Dummy1234"
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
          dummyUserId = res.body.user;
          const activationRoute =
            "/completeRegistration/" + testToken + "/" + dummyUserId;

          chai
            .request(server)
            .get(activationRoute)
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

  const username = "Testi";
  const email = "test@testi.de";
  const password = "tester1";

  describe("/POST /api/users", () => {
    it("Create a user", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .send({
          username: username,
          email: email,
          password: password
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
          const activationRoute =
            "/completeRegistration/" + testToken + "/" + userId;

          chai
            .request(server)
            .get(activationRoute)
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

  let authToken = "NoToken";
  let userId = "1111";

  describe("/POST /auth/signin", () => {
    it("The new user signs in", (done) => {
      chai
        .request(server)
        .post("/api/users")
        .send({
          email: email,
          password: password
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.have.property("token");
          res.body.user.should.have.property("_id");
          res.body.user.should.have.property("name").eql(username);
          res.body.user.should.have.property("email").eql(email);
          res.body.user.should.have.property("group");
          authToken = res.body.token;
          userId = res.body.user._id;
        });
    });
  });

  describe("/GET /api/users/userid", () => {
    it("Get User by UserId", (done) => {
      chai
        .request(server)
        .auth(authToken, { type: "bearer" })
        // .set({ Authorization: `Bearer ${authToken}` })
        .post("/api/users/" + userId)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.have.property("_id");
          res.body.should.have.property("name").eql(username);
          res.body.should.have.property("email").eql(email);
          res.body.should.have.property("group");
        });
    });
  });

  const newUserName = "HelloTesti";

  describe("/PUT /api/users/userid", () => {
    it("Change own user", (done) => {
      chai
        .request(server)
        .auth(authToken, { type: "bearer" })
        .put("/api/users/" + userId)
        .send({
          password: "12345678",
          username: "HelloTesti"
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.have.property("_id");
          res.body.should.have.property("name").eql(newUserName);
          res.body.should.have.property("email").eql(email);
          res.body.should.have.property("group");
        });
    });
  });

  describe("/PUT /api/users/userid", () => {
    it("Try to change other user", (done) => {
      chai
        .request(server)
        .auth(authToken, { type: "bearer" })
        .put("/api/users/" + dummyUserId)
        .send({
          password: "12345678",
          username: "HelloTesti"
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(403);
          res.body.should.have.property("error").eql("User is not authorized");
        });
    });
  });

  describe("/DELETE /api/users/userid", () => {
    it("Try to Delete other user", (done) => {
      chai
        .request(server)
        .auth(authToken, { type: "bearer" })
        .delete("/api/users/" + dummyUserId)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(403);
          res.body.should.have.property("error").eql("User is not authorized");
        });
    });
  });

  describe("/DELETE /api/users/userid", () => {
    it("Delete own user", (done) => {
      chai
        .request(server)
        .auth(authToken, { type: "bearer" })
        .delete("/api/users/" + userId)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.have.property("_id");
          res.body.should.have.property("name").eql(newUserName);
          res.body.should.have.property("email").eql(email);
          res.body.should.have.property("group");
        });
    });
  });

  describe("/GET /api/users/userid", () => {
    it("Deleted user get User by UserId", (done) => {
      chai
        .request(server)
        .auth(authToken, { type: "bearer" })
        // .set({ Authorization: `Bearer ${authToken}` })
        .post("/api/users/" + userId)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.have.property("_id");
          res.body.should.have.property("name").eql(username);
          res.body.should.have.property("email").eql(email);
          res.body.should.have.property("group");
        });
    });
  });
});
