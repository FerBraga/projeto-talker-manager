const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const ARQUIVO = './talker.json';

const write = async (data) => {
  await fs.writeFile(ARQUIVO, JSON.stringify(data));
};

const read = async () => {
  const dados = await fs.readFile(ARQUIVO, 'utf-8');
  const response = JSON.parse(dados);
  return response;
};

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

function tokenValidation(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
   return res.status(401).json({ message: 'Token não encontrado' });
  } 
  if (token.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
 
  next();
}

function nameAgeValidation(req, res, next) {
  const { name, age } = req.body;
  if (!name) {
   return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 3) {
   return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  if (!age) {
   return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  }
  if (Number(age) < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  next();
}

function talkie(req, res, next) {
  const { talk } = req.body;

  if (!talk) {
    return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  }
 
next();
}

function watchedAtt(req, res, next) {
  const { watchedAt } = req.body.talk;
  const dateRegex = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;

  if (!watchedAt) {
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  } 
  if (!dateRegex.test(watchedAt)) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
next();
}

function rated(req, res, next) {
  const { talk: { rate } } = req.body;

  console.log(rate);
 
  if (Number(rate) === 0) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  } 
  if (Number(rate) > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  if (!rate) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }

  next();
}

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
    const talkers = await fs.readFile(ARQUIVO, 'utf-8');
    console.log(talkers);
     res.status(200).json(JSON.parse(talkers));
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await fs.readFile(ARQUIVO, 'utf-8');
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

app.post('/talker', 
tokenValidation, 
nameAgeValidation, 
talkie, 
rated, 
watchedAtt, async (req, res) => {
  try {
    const { name, age, talk: { watchedAt, rate } } = req.body;
    const leitura = await read();
    const data = { id: leitura.length + 1, name, age, talk: { watchedAt, rate } };
    const final = [...leitura, data];
    write(final);
    return res.status(201).json(data);
  } catch (error) {
    return res.status(400).end();
  }
});

app.put('/talker/:id',
tokenValidation,
nameAgeValidation,
talkie,
rated,
watchedAtt, async (req, res) => {
  try {
    const { name, age, talk: { watchedAt, rate } } = req.body;
    const { id } = req.params;
    const pessoas = await read();
    const result = pessoas.find((pessoa) => 
      pessoa.id === Number(id));
      console.log(result);
      const news = { id: result.id, name, age, talk: { watchedAt, rate } };
      console.log(news);
   write([news]);
   return res.status(200).json({ id: result.id, name, age, talk: { watchedAt, rate } });
  } catch (error) {
   return res.status(400).end();
  }
});

app.listen(PORT, () => {
  console.log('Online');
});
