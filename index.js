const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

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

app.listen(PORT, () => {
  console.log('Online');
});
