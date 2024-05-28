const express = require("express");
const mysql = require("mysql2");
const app = express();
const cors = require('cors');
app.use(cors());

const connection = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    database: process.env.MYSQL_DATABASE || "projet",
});

app.use(express.json());

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check user credentials in the database
    connection.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (results.length > 0) {
                // Authenticated user
                res.status(200).send('Login successful');
            } else {
                // Incorrect credentials
                res.status(401).send('Invalid email or password');
            }
        }
    );
});

app.post('/signup', (req, res) => {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (results.length > 0) {
                // User already exists
                res.status(409).send('User already exists');
            } else {
                // Insert new user into the database
                connection.query(
                    'INSERT INTO users (email, password, fullName) VALUES (?, ?, ?)',
                    [email, password, fullName],
                    (error, results, fields) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        
                        // User successfully signed up
                        res.status(201).send('User created successfully');
                    }
                );
            }
        }
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
