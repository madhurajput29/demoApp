const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Initiate testing the app', function () {

  it('check app status', function (done) {
    chai.request(server).get('/').end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      done();
    })
  });

  // Test the GET login route
  describe('/Get Login test', function () {

    it('Check the app GET /login route', function (done) {
      chai.request(server).get('/login').end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('message').eql('You got the login page!');
        done();
      })
    });

  });

  // Test the Post login route
  describe('/Post Login test', function () {

    it('Check the app POST /login route with blank payload', function (done) {
      chai.request(server).post('/login').send({}).end((err, res) => {
        should.not.exist(err);
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('message').eql('Missing credentials');
        done();
      })
    });

    it('Check the app POST /login route with wrong password', function (done) {
      chai.request(server).post('/login').send({ "email": "test@test.com", "password": "word" }).end((err, res) => {
        should.not.exist(err);
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('message').eql('Invalid credentials');
        done();
      })
    });

    it('Check the app POST /login route with wrong username', function (done) {
      chai.request(server).post('/login').send({ "email": "test@tes.com", "password": "password" }).end((err, res) => {
        should.not.exist(err);
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('message').eql('User not found');
        done();
      })
    });

    it('Check the app POST /login route with correct credentials', function (done) {
      chai.request(server).post('/login').send({ "email": "test@test.com", "password": "password" }).end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('message').eql('You are logged in');
        done();
      })
    });

  });

  // Test the GET products route
  describe('/Get product test', function () {

    it('Check the app GET /products route without login', function (done) {
      chai.request(server).get('/products').end((err, res) => {
        should.not.exist(err);
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('message').eql('User is not logged in. Please log in');
        done();
      })
    });

    it('Check the app GET /products route with login', function (done) {
      chai.request(server).post('/login').send({ 'email': 'test@test.com', 'password': 'password' }).end((err, res) => {
        var cookie = res.header['set-cookie']
        chai.request(server).get('/products').set('Cookie', cookie).end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('Array');
          done();
        });
      });
    });

  });

  // Test the GET cart route
  describe('/Get cart test', function () {

    it('Check the app GET /cart route without login', function (done) {
      chai.request(server).get('/cart').end((err, res) => {
        should.not.exist(err);
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('message').eql('User is not logged in. Please log in');
        done();
      })
    });

    it('Check the app GET /cart route with login', function (done) {
      chai.request(server).post('/login').send({ 'email': 'test@test.com', 'password': 'password' }).end((err, res) => {
        var cookie = res.header['set-cookie']
        chai.request(server).get('/cart').set('Cookie', cookie).end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('Array');
          done();
        });
      });
    });

    it('Check the app GET /cart route with cart empty', function (done) {
      chai.request(server).post('/login').send({ 'email': 'user2@example.com', 'password': 'password' }).end((err, res) => {
        var cookie = res.header['set-cookie']
        chai.request(server).get('/cart').set('Cookie', cookie).end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('message').eql('Cart is empty');
          done();
        });
      });
    });

  });

  // Test the PATCH cart route
  describe('/Patch cart test', function () {

    it('Check the app PATCH /cart route without login', function (done) {
      chai.request(server).patch('/cart').end((err, res) => {
        should.not.exist(err);
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('message').eql('User is not logged in. Please log in');
        done();
      })
    });

    it('Check the app PATCH /cart route with login', function (done) {
      chai.request(server).post('/login').send({ 'email': 'test@test.com', 'password': 'password' }).end((err, res) => {
        var cookie = res.header['set-cookie']
        chai.request(server).patch('/cart').set('Cookie', cookie).send({ 'itemId': 2 }).end((err, res) => {
          should.not.exist(err);
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('message').eql('Item has been added to the cart');
          done();
        });
      });
    });

  });

});