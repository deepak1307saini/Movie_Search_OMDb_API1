// app.js
const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();


const db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '1307',
    database: 'movies'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('page1', { movies: [] });
});

app.post('/search', (req, res) => {
    // Use Axios to fetch data from OMDB API based on user input
    const searchQuery = req.body.searchQuery;
    const apiKey = '270a058f'; // Replace with your OMDB API key

    axios.get(`http://www.omdbapi.com/?s=${searchQuery}&apikey=${apiKey}`)
        .then(response => {
            const movies = response.data.Search || [];
            res.render('page1', { movies });
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error fetching data from OMDB.');
        });
});

app.post('/favorite', (req, res) => {
    const { title, year, type, poster } = req.body;
    const sql = 'INSERT INTO favorites (title, year, type, poster) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, year, type, poster], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving favorite.');
        } else {
            console.log('Favorite saved to database.');
            res.redirect('/');
        }
    });
});


app.get('/favorites', (req, res) => {
    const sql = 'SELECT * FROM favorites';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching favorites from the database.');
        } else {
            res.render('page2', { favorites: results });
        }
    });
});



// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
