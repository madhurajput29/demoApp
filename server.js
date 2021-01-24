//npm modules
const express = require('express');
const uuid = require('uuid').v4;
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');
const bcrypt = require('bcrypt-nodejs');

// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    axios.get(`http://localhost:5000/users?email=${email}`)
      .then(res => {
        const user = res.data[0]
        if (!user) {
          return done(null, false, null);
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        return done(null, user);
      })
      .catch(error => done(error));
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  axios.get(`http://localhost:5000/users/${id}`)
    .then(res => done(null, res.data))
    .catch(error => done(error, false))
});

// create the server
const app = express();

// add & configure middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  genid: (req) => {
    return uuid() // use UUIDs for session IDs
  },
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

// create the homepage route at '/'
app.get('/', (req, res) => {
  res.status(200).send({ 'message': 'Welcome to our Camera Shop' })
})

// create the login get and post routes
app.get('/login', (req, res) => {
  res.status(200).send({ 'message': 'You got the login page!' })
})

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user && !info) {
      return res.status(404).send({'message':'User not found'});
    }
    if (info) {
      return res.status(404).send(info);
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).send({ 'message': 'You are logged in' });
    })
  })(req, res, next);
})

// list all the products
app.get('/products', (req, res) => {
  if (req.isAuthenticated()) {
    axios.get(`http://localhost:5000/products`)
      .then(resp => {
        res.status(200).send(resp.data);
      })
      .catch(error => {
        console.log(error);
        res.status(500).send({'message':'Error in fetching cart data'});
      })
  } else {
    res.status(403).send({'message':'User is not logged in. Please log in'});
  }
})

// add and get cart
app.get('/cart', (req, res) => {
  if (req.isAuthenticated()) {
    if (!req.user.cart || req.user.cart.length <= 0) {
      return res.status(200).send({ 'message': 'Cart is empty' });
    }
    const productIds = req.user.cart;
    const fetchUserCart = async (ids) => {
      try {
        const { data } = await axios.get(`http://localhost:5000/products/${ids}`);
        return data;
      } catch (error) {
        console.log(error);
      }
    };
    const getPostsSync = async () => {
      var cartItem = [];
      for (const number of productIds) {
        const cartValue = await fetchUserCart(number);
        cartItem.push(cartValue);
      }
      res.status(200).send(cartItem);
    };
    getPostsSync();
  } else {
    res.status(403).send({'message':'User is not logged in. Please log in'})
  }
})

app.patch('/cart', (req, res) => {
  if (req.isAuthenticated()) {
    var prevCart = req.user.cart;
    if (req.body.itemId > 5) {
      return res.status(404).send({ 'message': 'Please enter itemId less than 5' });
    }
    prevCart.push(parseInt(req.body.itemId));
    const data = { cart: prevCart };
    axios.patch(`http://localhost:5000/users/${req.user.id}`, data)
      .then(response => {
        res.status(201).send({ 'message': 'Item has been added to the cart' });
      })
      .catch(error => {
        res.status(500).send({ 'message': 'Error in adding the item into the cart' });
        console.log(error);
      })
  } else {
    res.status(403).send({'message':'User is not logged in. Please log in'})
  }
})

// tell the server what port to listen on
module.exports = app.listen(3000, () => {
  console.log('Listening on localhost:3000')
})
