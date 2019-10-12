const mysql=require('mysql');
const db=mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'safewalk'
	
});
db.connect((err)=>{
	if(err){
		console.log('Error',err);
	}
	console.log('Connected');
});
var loginDB=(req,res,callback)=>{
	var crypto = require('crypto');
	var email=req.body.email;
	var data = req.body.password;
	var newPass=crypto.createHash('md5').update(data).digest("hex");
	var findSqlEmail='SELECT * FROM users WHERE email = ? and password= ?';
	var findQuery=db.query(findSqlEmail,[email,newPass],(err,result)=>{
		if(err) throw err;
		if(result.length>0){
			console.log('Postoji');

			callback(result[0]);
					
		}
		callback(null);


	});
}


var registerDB=(req,res,callback)=>{
	console.log(req.body);
	// var email=req.body.email;
	// var username=req.body.username;
	var unexpected=false;
	var errArray=[];
	var errStr='<br>';
	// var data = req.body.password;
	// tmp
	var email=req.body.email;
	// var username='test';
	var data = req.body.password;
	var phonenu=req.body.phone;
	
	var findSqlEmail='SELECT email FROM users WHERE email = ?';
		var findQuery=db.query(findSqlEmail,email,(err,result)=>{
			if(err) throw err;
				if(result.length>0){
					
					if(result[0].email==email){
						errArray.push('Postoji Email');
						// errStr+='Postoji Email <br>';
						unexpected=true;
					}
					
				}
				if(data.length<6){
						errArray.push('Password mora da bude veci od 6 karaktera');
						// errStr+='Password mora da bude veci od 6 karaktera <br>';
						unexpected=true;
				}
				if(unexpected==true){
					callback(errArray);
				}else{


					
					var crypto = require('crypto');
					//console.log();
					var newPass=crypto.createHash('md5').update(data).digest("hex");


					var post={
						fname:req.body.firstname,
						lname:req.body.lastname,
						email:email,
						password:newPass,
						phonenu:phonenu,
						// adresa:req.body.adresa,
						// zip:req.body.zip,
						// br_proizvoda:0,
						// rating:0
					}
					var sql='INSERT INTO users SET ?';
					var query=db.query(sql,post,(err,result)=>{
						if(err) throw err;
						console.log(result);
						//res.send('Created');
						callback(null);
					});

				}
			

		});


	//console.log(JSON.stringify(req.body.ime));
	
	

}
var addNuDB=(req,res,callback)=>{
	var userID=req.body.userID;
	console.log(userID+' user id');
	var phoneNu=req.body.phoneNumber;
	var checkID='SELECT * FROM users WHERE id = ?';
	var findQuery=db.query(checkID,userID,(err,result)=>{
		if(err) throw err;
		if(result.length>0){
			var post={
						idSafe:userID,
						phonenu:phoneNu
			}
			var sql='INSERT INTO userssafe SET ?';
			var query=db.query(sql,post,(errPost,resultPost)=>{
						if(errPost) throw errPost;
						console.log(resultPost);
						//res.send('Created');
						
						var selectNumber='SELECT phonenu FROM userssafe WHERE idSafe=?';
						var getNumbers=db.query(selectNumber,userID,(errNU,resultNU)=>{
							if (errNU){
								console.log('Error ',errNU);
							}else{
								callback(resultNU);
							}
							
						});
					});


			// callback(result[0].id);
		}else{
			callback(null,'Doslo do greske');
		}
	});


}
var removeNumber=(req,res,callback)=>{
	var userID=req.body.userID;
	var phoneNumber=req.body.phoneNumber;
	var deleteNumber='DELETE FROM userssafe WHERE phonenu=? AND idSafe=?';
	var deleteQuery=db.query(deleteNumber,[phoneNumber,userID],(err,result)=>{
		var selectNumber='SELECT phonenu FROM userssafe WHERE idSafe=?';
		var getNumbers=db.query(selectNumber,userID,(errNU,resultNU)=>{
			if (errNU){
				console.log('Error ',errNU);
			}else{
				callback(resultNU);
			}
			
		});

	});
}

var getNU=(req,res,callback)=>{
	var userID=6;
	console.log(userID);
	var findNumbers='SELECT phonenu FROM userssafe WHERE idSafe  = ?';
	var findQuery=db.query(findNumbers,userID,(err,result)=>{
		if(err) throw err;
		if(result.length>0){
			console.log('Postoji');
			console.log(result);
			callback(result);
					
		}else{
			callback(null);
		}
		


	});
}
var pingDB=(req,res)=>{
	var latitude=req.body.latitude;
	var longitude=req.body.longitude;
	var userID=req.body.userID;
	var getLocation='SELECT * FROM location WHERE idSafe=?';
	var findQuery=db.query(getLocation,email,(err,result)=>{
		if(err) console.log(err);
				if(result.length>0){
					var updateLocation='UPDATE location SET latitude=?,longitude=? WHERE idSafe=?';
					var updateQuery=db.query(updateLocation,[latitude,longitude,userID],(errUpdate,resultUpdate)=>{

					});
				}else{
					var post={
						idSafe:userID,
						latitude:latitude,
						longitude:longitude
					};
					var instertLocation='INSERT INTO location SET ?';
					var insertQuery=db.query(instertLocation,post,(errInsert,resultInsert)=>{

					});
				}
	});
			

}
module.exports={
	registerDB,
	loginDB,
	addNuDB,
	getNU,
	removeNumber,
	pingDB
};