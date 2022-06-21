const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

function validation(req, res, next) {
  const { email, password } = req.body; 
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!email.includes('@', '.com')) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
}

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
    const talkers = await fs.readFile('./talker.json', 'utf-8');
    console.log(talkers);
     res.status(200).json(JSON.parse(talkers));
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await fs.readFile('./talker.json', 'utf-8');
  const talk = JSON.parse(talkers).find((talker) => talker.id === Number(id));
  if (talk) {
    return res.status(200).json(talk);
  }
   return res.status(404).send({ message: 'Pessoa palestrante não encontrada' });
});

app.post('/login', validation, async (req, res) => {
  const token = { token: Math.random().toString().slice(1, 17) };
  const { email, password } = req.body;
  console.log(email, password);
   res.status(200).json(token);
});

app.listen(PORT, () => {
  console.log('Online');
});
