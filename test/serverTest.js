import mongoose from "mongoose";
import server from "../src/server";
import bookModel from "../src/models/book.model";

// For testing
import chai from "chai";
import chaiHttp from "chai-http";

let should = chai.should();

// Own db for testing
process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";
process.env.NODE_ENV = "test";

chai.use(chaiHttp);
//Our parent block
describe("Books", () => {
  beforeEach((done) => {
    //Before each test we empty the database
    bookModel.remove({}, (err) => {
      done();
    });
  });
  /*
   * Test the /GET route
   */
  describe("/GET book", () => {
    it("it should GET all the books", (done) => {
      chai
        .request(server)
        .get("/api/books")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});
