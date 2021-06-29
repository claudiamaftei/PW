
'use strict';
const express = require('express');
var cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const session = require('express-session');
session.user = undefined;
session.admin = undefined;
const app = express();
app.use(cookieParser());
app.use(session({
  secret: 'secret_id',
  resave: true,
  saveUninitialized: true
}))
const port = 6789;


//var _cookie = document.cookie;

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
//app.get('/', (req, res) => res.send('Hello World'));

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată

const listaIntrebari = require('./intrebari.json');
const utilizatori = require('./utilizatori.json');
var produs = []; 
var i= 0;
var vec_produse = []; 


app.get('/verificare-autentificare',(req,res) => {
  res.render('verificare-autentificare');
  console.log(req.body);
});

app.get('/',(req,res) => {

  res.render('index',{user:req.cookies.user,userSession:session.user, admin:session.admin, produs:produs});
});


app.get('/autentificare',(req,res) => {
  res.render('autentificare',{user:req.cookies.user,userSession:session.user});
});

app.get('/admin',(req,res) => {
  if(session.admin=="true")
    res.render('admin',{user:req.cookies.user,userSession:session.user});
  else{
    res.redirect("/");
  }

  });



app.post('/delogare',(req,res) => {
  //res.render('index',{user:req.cookies.user,userSession:session.user});
 session.user=undefined;
 res.redirect('/');

});




app.get('/chestionar', (req, res) => {
	
	//var intrebari;
	// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
  res.render('chestionar', {intrebari: listaIntrebari,userSession:session.user});
});



app.post('/verificare-autentificare', (req, res) => {
   

    console.log(req.body);
    let correct=false;
    for(let usr in utilizatori)
    {
      console.log(usr);
      if((req.body.user == utilizatori[usr].user) && (req.body.pwd == utilizatori[usr].pwd))
      {
        console.log("asdasd");
        res.cookie('user', req.body.user);
        session.user = req.body.user;
        session.nume = utilizatori[usr].nume;
        session.prenume = utilizatori[usr].prenume;
        session.admin = utilizatori[usr].admin;
        correct=true;
        break;
      }
      
    }
    if(correct)
    {
      res.redirect("/");
    }
    else{
      res.cookie('user', 'messageError');
      session.user = undefined;
      session.admin = undefined;
      res.redirect('autentificare');
    }

});

app.post('/rezultat-chestionar', (req, res) => {
  console.log(req.body);
  let comanda;
  comanda = JSON.stringify(req.body);
  res.render('rezultat-chestionar', {intrebari: listaIntrebari, rasp: req.body,userSession:session.user});

});

app.get('/creare-bd',(req,res) => {
  var mysql = require('mysql');

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "abcd",
    database: "cumparaturi"
  });

  con.connect(function(err){
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE IF NOT EXISTS cumparaturi", function (err, result) {
      if (err) throw err;
      console.log("Database created");
    });
    var sql_table = "CREATE TABLE IF NOT EXISTS produse1 (id int, nume VARCHAR(20), zahar VARCHAR(20), lapte VARCHAR(20), dimensiune VARCHAR(20), temperatura VARCHAR(20), loc  VARCHAR(20))";
    con.query(sql_table, function (err, result) {
      if (err) throw err;
      else{
        console.log("Table created");
        con.end();
        res.redirect("/");
      }
      
    });
     
  });

  

});


app.post('/inserare-bd',(req,res) => {

  var mysql = require('mysql');

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "abcd",
    database: "cumparaturi"
  });

  con.connect(function(err){
    if (err) throw err;
      console.log("Connected!");
      //var sql = "INSERT INTO produse (tip, zahar, lapte, dimensiune, temperatura, loc) VALUES ('Espresso', 'o_lingurita', 'putin_lapte', 'medie', 'fierbinte', 'aici')";
     // let nr = "SELECT EXISTS( SELECT 1 FROM produse WHERE (tip = "+Espresso+" AND zahar = "+o_lingurita+" AND lapte = "+putin_lapte+" AND dimensiune = "+medie+" AND temperatura = "+fierbinte+" AND loc = "+aici+" ))";
     let nr = "SELECT count(*) AS NUMAR FROM produse1 WHERE id = '"+req.body.id+"'AND  nume = '"+req.body.nume+"' AND zahar = '"+req.body.zahar+"' AND lapte = '"+req.body.lapte+"' AND dimensiune = '"+req.body.dimensiune+"' AND temperatura = '"+req.body.temperatura+"' AND loc = '"+req.body.loc+"'";  
    
     console.log(req.body.id);
      console.log(req.body.nume);
     con.query(nr, function(error, result, field) {
        if(error) throw error;
        if(result[0].NUMAR>0)
        {
          console.log("This record exists in table");
           res.redirect("/");
        }
        else{
          var sql = "INSERT INTO produse1 (id, nume, zahar, lapte, dimensiune, temperatura, loc) VALUES ('"+req.body.id+"','"+req.body.nume+"','"+req.body.zahar+"','"+req.body.lapte+"', '"+req.body.dimensiune+"','"+req.body.temperatura+"','"+req.body.loc+"')";
         
          con.query(sql,function (err, result) {
          if (err) throw err;
          else{
            console.log("1 record inserted");
            con.end();
            res.redirect("/"); 
            }
          
          });

        }
        
      });
  });

});


app.get('/afisare-bd',(req,res) => {

  
  var mysql = require('mysql');

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "abcd",
    database: "cumparaturi"
  });

  con.connect(function(err){
    if (err) throw err;
    else{
      console.log("Connected!");
      
      var sql='SELECT * FROM produse1';
      con.query(sql, function (err, result, fields) {
      if (err) throw err;
     //con.end();
     else{
      produs = result;
      con.end();
      res.redirect("/"); 
     }
	   });
     
      
    }
    
  });
      



});



app.post('/adaugare_cos',(req,res)=>{
  
  var mysql = require('mysql');

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "abcd",
    database: "cumparaturi"
  });

  console.log(req.body);
  var sql='SELECT nume FROM produse1 WHERE id=?';
  con.query(sql,[req.body["id"]], function (err, raspuns, fields) {
    if (err) throw err;
    else
    {
      vec_produse[i]=raspuns[0].nume;
      i++;
      console.log(vec_produse);
      console.log(raspuns[0].nume);
      //res.render('vizualizare-cos',{produs:vec_produse,id:i});
      con.end();
     
    }
    res.redirect('/');
  });

})


app.get('/vizualizare-cos',(req,res)=>{
	res.render('vizualizare-cos',{produs :vec_produse});
})


app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));