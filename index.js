const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

// Middlewares
const validationTalker = require('./Middlewares/validation_talkers');
const validationTalkerID = require('./Middlewares/validation_talker_id');
const validationLogin = require('./Middlewares/validation_login');

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', validationTalker, (_req, res) => {
  fs.readFile('./talker.json', 'utf8')
  .then((data) => {
    res.status(HTTP_OK_STATUS).json(JSON.parse(data));
  })
  .catch((err) => {
    console.error(`Não foi possível ler o arquivo. Erro: ${err}`);
    process.exit(1);
  });
});

app.get('/talker/:id', validationTalkerID, (req, res) => {
  fs.readFile('./talker.json', 'utf8')
  .then((data) => {
    const { id } = req.params;
    const talkerList = JSON.parse(data);
    const talker = talkerList.find((t) => t.id === Number(id));
    res.status(HTTP_OK_STATUS).json(talker);
  })
  .catch((err) => {
    console.error(`Não foi possível ler o arquivo. Erro: ${err}`);
    process.exit(1);
  });
});

app.post('/login', validationLogin, (_req, res) => {
  res.status(200).json({ token: generateToken() });
});

app.listen(PORT, () => {
  console.log('Online');
});
