var express = require('express');
var bodyParser = require("body-parser");
var cfenv = require("cfenv");
var path = require("path");
var fs = require("fs");
var expressHbs = require('express-handlebars');
var cloudant, mydb;

var app = express();
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('views', path.join(__dirname, './app/views'));
app.set('view engine', '.hbs');
var jsonFile = fs.readFileSync('./app/data/qa.json');
var jsonContents = JSON.parse(jsonFile);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('./app'));



/*-------------------------------Cloudantant Configuration--------------------------------*/
const url = "https://297357a6-2291-420b-a246-ca5058b8e490-bluemix:8468949979cd6d8b4eb1ed5f8eee65ca6ba037d9970fa82162339c353f1f759a@297357a6-2291-420b-a246-ca5058b8e490-bluemix.cloudantnosqldb.appdomain.cloud/newdb"
const cqs = require('cloudant-quickstart');
const db = cqs(url);

db.create().then(console.log);
// { ok: true }
/*----------------------------------------------------------------------------------------------*/


app.get('/', function (req, res) {
    res.send('Welcome to the test!');
});







/*--------------------------------------- ADMIN -----------------------------------------*/

// Update Form 
app.get('/admin/create-form', function (req, res, ) {
    res.render('create.hbs');
});


// Add Question To Cloudant DB
app.post('/admin/create', function (req, res) {
    var docs = [
        { "question": req.body.q1, "answer_1": req.body.a11, "answer_2": req.body.a12, "answer_3": req.body.a13, "answer_4": req.body.a14 },
        { "question": req.body.q2, "answer": req.body.a2 },
    ]

    db.insert(docs).then(console.log);
    res.send('Create Success!');
});


// Get The Current QA List
app.get('/admin/list', function (req, res, ) {

    db.all().then(list => {
        res.render('list.hbs', { questions: list });
    });
});


// Update Question 
app.post('/admin/update', function (req, res) {
    var new_questions = [];

    db.all().then(list => {
        for (var i = 0; i < list.length; i++) {
            new_questions[i] = { "_id": list[i]._id, "question": req.body['q_' + list[i]._id], "answer": req.body['a_' + list[i]._id] };
            db.update(new_questions[i]).then(console.log);
        }

        res.render('updated_list.hbs', {questions: new_questions});
    });
});

/*----------------------------------------------------------------------------------------------*/







/*--------------------------------------- USER -----------------------------------------*/


app.get('/user/test', function (req, res) {
    db.all().then(list => {
        res.render('test.hbs', { questions: list });
    });
});


app.post('/user/result', function (req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var label_result = "Result: \n";
    var score = 0;
    
    db.all().then(list => {
        for (var i = 0; i < list.length; i++) {
            user_answer = req.body['a_' + list[i]._id];
            correct_answer = list[i].answer;

            if (user_answer.toUpperCase() === correct_answer.toUpperCase()) {
                label_result += "Q_" + (i+1) + ": CORRECT \n";
                score++;
            } else {
                label_result += "Q_" + (i+1) + ": INCORRECT \n";
            }    
        }
        label_result += "Your score is: " + score + "/" + list.length;
        res.send(label_result);
    });
});

/*----------------------------------------------------------------------------------------------*/



var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

module.exports = app;
