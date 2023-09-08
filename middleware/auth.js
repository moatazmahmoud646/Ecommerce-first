module.exports = {

  ensureAuth: function(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.id)  {
      return next();
    } else {
      res.redirect('/');
    }
  },
    ensureGuest: function (req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      } else {
        res.redirect('/login');
      }
    },

    isAdmin : function(req, res, next) {
      if (req.user && req.user.isAdmin) {
        // User is authorized to access admin routes
        next();
      } else {
        // User is not authorized to access admin routes
        res.redirect('/login');
      }
    }
    
  }