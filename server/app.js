//Initialization
const express = require('express');
const app = express();
//adding dependecies
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//

//3rd party code

const cookieParser = require('cookie-parser');

const session=require('express-session');
const passport=require('passport');
const passportConfig=require('./3rdparty/passport');
var MySQLStore = require('express-mysql-session')(session);

//


// const session=require('express-session');
// const passport=require('passport');
// const passportConfig=require('./3rdparty/passport');

const {testPoruke}=require('./3rdparty/telesignsdk');
// var MySQLStore = require('express-mysql-session')(session);
//passport code
app.use(express.urlencoded());
//Temp session db
var options={
	host:'localhost',
	user:'root',
	password:'',
	database:'safewalk'
	
};
var sessionStore = new MySQLStore(options);
require('./3rdparty/passport')(passport);
app.use(session({
  secret: 'kr0b0p0l1is',
  resave: false,
  store:sessionStore,
  saveUninitialized: false,
  cookie: {
    path    : '/',
    httpOnly: false,
    maxAge  : 24*60*60*1000
  }
  //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
//DB
const {registerDB,loginDB,addNuDB,getNU,removeNumber,pingDB}=require('./db/db');
 
app.get('/', function (req, res) {
  res.send('Hello World');
});
app.get('/success', function (req, res) {
  // res.send({user:req.user});
  console.log(req.user);
  res.end();
});
app.get('/err',(req,res)=>{
	res.send('ERr');
});
app.get('/location/:token',(req,res)=>{
	var token=req.params.token;
	console.log(token);

});
app.post('/removeNumber.api',(req,res)=>{
	removeNumber(req,res,(numbers)=>{
		res.send(numbers);
	});
});
 

//delete



const port=process.env.PORT||3000;
app.listen(port);
//testPoruke();

app.post('/register.api',(req,res)=>{
	console.log(req.body);

	registerDB(req,res,(err)=>{

		if(err){
			console.log('Doslo do greske');
		}else{
			console.log('Uspesno Registrovano');
		}

	});
	res.send({ message: 'success' });
});

// app.post('/login.api',passport.authenticate('local-login',{
// 	successRedirect:'/',
// 	failureRedirect:'/err',
// 	failureFlash: true
// }),
// function(req,res){
// 	console.log('Something');
// 	if(req.body.remember){
// 		req.session.cookie.maxAge=1000*60*3;
		
// 	}else{
// 		req.session.cookie.expires=false;
// 	}
// 	//res.send(req.user);
	

// });
app.post('/login.api',(req,res)=>{
loginDB(req,res,(user)=>{
	if(user){
		req.session.userID=user.id;
		req.session.fname=user.fname;
		req.session.lname=user.lname;
		console.log(user);
		res.send(user);
		console.log(req.session.userID+' session id');
	}else{
		console.log('Ne postoji ovaj nalog');
	}
})
});
app.get('/getNumbers.api',(req,res)=>{
	getNU(req,res,(phonenu)=>{
		if(phonenu.length>0){
			console.log(phonenu);
			res.send(phonenu);
		}else{
			res.send({message:'error'});
		}
	});
});
app.post('/addnu.api',(req,res)=>{
	console.log(req.body);

	addNuDB(req,res,(numbers,err)=>{

		if(err){
			console.log('Doslo do greske');
			res.send({ message: 'error' });
		}else{
			console.log('Uspesno Dodato');
			res.send(numbers);
		}

	});
	
});
app.post('/ping.api',(req,res)=>{
	pingDB(req,res);
});

app.post('/start.api',(req,res)=>{
	console.log(req.body);

	getNU(req,res,(phonenu)=>{
		console.log(phonenu);
		console.log('phone numbers');
		if(phonenu.length>0){
			console.log('Uspesno');
			// res.send({ message: 'salju se poruke' });
			function function2(i,token) {
				console.log(phonenu[i].phonenu);
  				console.log('Broj jednog fona');
  				testPoruke(phonenu[i].phonenu,token);
			   
			}
			require('crypto').randomBytes(48, function(err, buffer) {
  			var token = buffer.toString('hex');
  			for(var i=0;i<phonenu.length;i++){
  				let phoneNumber = phonenu[i].phonenu;
  				setTimeout(async ()=>{
					await testPoruke(phoneNumber,token);
  				}, i*5000);
  				

  			}
  			
			});
			res.send({message:'Uspesno'});

			
		}else{
			console.log('Greska kod brojeva');
			res.send({ message: 'greska' });
		}

	});
	
});


app.listen(port,'0.0.0.0',()=>{

	console.log(`Server is up ${port}`);
});