const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //MUST DO THIS FOR EXPRESS 4 UPDATE

//...............................Required to use Flash Messages
const session = require("express-session");
const flash = require("express-flash");

const app = express();
app.listen(1337, () => console.log("suhhh dude 1337"));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/static"));

app.use(bodyParser.urlencoded({extended: false}));

//...............................Required to use Flash Messages
app.use(session({
    secret: "groot",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 5000},
}));
app.use(flash());

const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/BisonDB', {useNewUrlParser: true, useUnifiedTopology: true}); //!!localhost/... is name of DataBase

const BisonSchema = new Schema({ //!!Schema in Mongoose is a structure for each Document
    name: {type: String, required: true, minlength: 1, maxlength: 20},
    details: {type: String, required: true, minlength: 1, maxlength: 50},
}, {timestamps: true }); //.....................adds "createdAt" and "updatedAt" properties to QuoteDocument(s)

// create an object to that contains methods for mongoose to interface with MongoDB
const BisonModel = mongoose.model('BisonDocument', BisonSchema); //!!Model in Mongoose is a structure for each Collection

app.get('/', (req, res) => {
    // QuoteDocument.remove({}, ()=> console.log('empty')); //remove all quotes from QuoteCollection
    BisonModel.find()
        .then(bison => res.render("index", {bison: bison}))
});

app.post('/submit', (req, res) => {
    const bison = new BisonModel();
    bison.name = req.body.name;
    bison.details = req.body.details;
    bison.save()
        .then(newBuffalo => {
            console.log('Buffalo Created: ', newBuffalo);
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
            for(let key in err.errors) {
                req.flash("registration", err.errors[key].message);
            }
            res.redirect('/bison/new');
        });
});

app.get('/bison/new', (req, res) => {
    res.render("new");
});

app.get('/bison/:id', function(req, res) {
    BisonModel.findById(req.params.id)
        .then(bison => res.render('spotlight', {bison: bison}))
});

app.get('/bison/edit/:id', function(req, res) {
    BisonModel.findById(req.params.id)
        .then(bison => res.render('edit', {bison: bison}))
});

app.post('/submit/edit/:id', function(req, res) { //......................Validations Not Working Here!!!!!!!!!
    // const bison = BisonModel.findById(req.params.id)
    // bison.name = req.body.name
    // bison.details = req.body.details
    // bison.save()
    BisonModel.updateOne({_id: req.params.id}, {$set: {name: req.body.name, details: req.body.details}}, {runValidators: true})
        .then(editedBuffalo => {
            console.log('Buffalo Edited: ', editedBuffalo);
            res.redirect('/')
        })
        .catch(err => {
            console.log(err);
            for (let key in err.errors) {
                req.flash("registration", err.errors[key].message);
            }
            res.redirect('/bison/edit/' + bison.id);
        });
    });

app.get('/bison/destroy/:id', function(req, res) {
    BisonModel.deleteOne({_id: req.params.id})
        .then(res.redirect('/'))
});

