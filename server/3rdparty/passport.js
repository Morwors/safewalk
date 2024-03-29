// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var crypto = require('crypto');
var mysql = require('mysql');


var connection = mysql.createConnection({
          host:'localhost',
          user:'root',
          password:'',
        });

connection.query('USE safewalk');  
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      var newID=id;
      
        connection.query("SELECT * FROM users WHERE id = ? ",[newID], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'test@gmail.com',
            passwordField : '123456',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT * FROM users WHERE email = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false);
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            console.log('Pocetak passport login');

            connection.query("SELECT * FROM users WHERE email = ?",[username], function(err, rows){

                if (err){
                    console.log("error: "+err);
                    return done(err);
                }
                if (!rows.length) {
                    console.log('Ne postoji ROW');
                    return done(null, false); // req.flash is the way to set flashdata using connect-flash
                }
                
                var newPass=crypto.createHash('md5').update(password).digest("hex");
                // if the user is found but the password is wrong
                console.log(newPass+'  '+rows[0].password);
                if (newPass!=rows[0].password){
                    console.log('greska,nema tog pass')
                    return done(null, false);
                }

                console.log(rows[0]);
                
                return done(null, rows[0]);
            });
        })
    );
};