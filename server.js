const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Add this line
const app = express();
const port = 3000;

app.use(express.static('public')); // Ensure this line is present to serve static files
app.use(bodyParser.json());
app.use(cors()); // Add this line to enable CORS

let questions = require('./questions.json');

app.get('/api/questions', (req, res) => {
  console.log('Sending questions:', questions); // Debugging line
  res.json(questions);
});

app.post('/api/questions', (req, res) => {
  const newQuestion = req.body;
  questions.push(newQuestion);
  fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(questions, null, 2));
  res.status(201).json(newQuestion);
});

app.put('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const updatedQuestion = req.body;
  questions[questionId] = updatedQuestion;
  fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(questions, null, 2));
  res.json(updatedQuestion);
});

app.delete('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  questions.splice(questionId, 1);
  fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(questions, null, 2));
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
