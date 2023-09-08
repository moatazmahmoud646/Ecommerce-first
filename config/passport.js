const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
    passport.use(
      'local',
      new LocalStrategy(
        {
          usernameField: 'email'
        },
        async (email, password, done) => {
          try {
            const user = await User.findOne({ email });
           // console.log(user.password)
            if (!user) {
              return done(null, false, { message: 'Invalid email or password1' });
            }
           const passwordMatch = await bcrypt.compare(password, user.password);
          console.log(passwordMatch)
            if (!passwordMatch) {
                console.log(password)
              return done(null, false, { message: 'Invalid email or password2' });
            }
  
           
  
            return done(null, user);
          } catch (error) {
            console.error(error);
            return done(error);
          }
        }
      )
    );
  
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
  
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        if (user) {
          done(null, user);
        } else {
          done('User not found', null);
        }
      } catch (error) {
        console.error(error);
        done(error, null);
      }
    });
  };