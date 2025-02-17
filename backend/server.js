const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'w01d83e4.kasserver.com',
  user: 'd042d2d7',
  password: '9ueAhbYUeS6MfzzxFf4W',
  database: 'd042d2d7'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
  
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      console.log('User registered:', { username, email });
      res.status(201).json({ message: 'User registered' });
    });
  });

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: 86400 });
    res.status(200).json({ auth: true, token });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});