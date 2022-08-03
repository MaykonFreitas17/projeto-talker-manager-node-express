const express = require('express');

const router = express.Router();

const fs = require('fs').promises;

const fileDB = './talker.json';

// Middlewares
const validationTalker = require('./validation_talkers');
const validationTalkerID = require('./validation_talker_id');

function validationTokenAuthorization(req, res, next) {
  const { authorization } = req.headers;
  if (authorization === undefined || authorization === '') {
    return res.status(401).json({
      message: 'Token não encontrado',
    });
  }

  if (authorization.length !== 16) {
    return res.status(401).json({
      message: 'Token inválido',
    });
  }

  next();
}

function validationName(req, res, next) {
  const { name } = req.body;
  if (name === undefined || name === '') {
    return res.status(400).json({
      message: 'O campo "name" é obrigatório',
    });
  }

  if (name.length < 3) {
    return res.status(400).json({
      message: 'O "name" deve ter pelo menos 3 caracteres',
    });
  }

  next();
}

function validationAge(req, res, next) {
  const { age } = req.body;
  if (age === undefined || age === '') {
    return res.status(400).json({
      message: 'O campo "age" é obrigatório',
    });
  }

  if (age < 18) {
    return res.status(400).json({
      message: 'A pessoa palestrante deve ser maior de idade',
    });
  }

  next();
}

function validationTalkWatchedAt(req, res, next) {
  const { talk } = req.body;
  const { watchedAt } = talk;

  const regex = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/;
  if (watchedAt === undefined || watchedAt === '') {
    return res.status(400).json({
      message: 'O campo "watchedAt" é obrigatório',
    });
  }

  if (!regex.test(watchedAt)) {
    return res.status(400).json({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }

  next();
}

function validationTalkRate(req, res, next) {
  const { talk } = req.body;
  const { rate } = talk;

  if (rate === undefined || rate === '') {
    return res.status(400).json({
      message: 'O campo "rate" é obrigatório',
    });
  }
  if (rate < 1 || rate > 5) {
    return res.status(400).json({
      message: 'O campo "rate" deve ser um inteiro de 1 à 5',
    });
  }

  next();
}

function validationTalk(req, res, next) {
  const { talk } = req.body;
  if (talk === undefined || talk === '') {
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório',
    });
  }

  next();
}

async function validationID(req, res, next) {
  const { id } = req.params;
  try {
    const data = await fs.readFile(fileDB, 'utf8');
    const dataJSON = JSON.parse(data);
    const talker = dataJSON.findIndex((t) => t.id === Number(id));
    if (talker === -1) {
      return res.status(404).json({ message: 'Talker ID not found' });
    }
    next();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

router.get('/', validationTalker, (_req, res) => {
  fs.readFile(fileDB, 'utf8')
  .then((data) => {
    res.status(200).json(JSON.parse(data));
  })
  .catch((err) => {
    console.error(`Não foi possível ler o arquivo. Erro: ${err}`);
  });
});

router.get('/:id', validationTalkerID, (req, res) => {
  fs.readFile(fileDB, 'utf8')
  .then((data) => {
    const { id } = req.params;
    const talkerList = JSON.parse(data);
    const talker = talkerList.find((t) => t.id === Number(id));
    res.status(200).json(talker);
  })
  .catch((err) => {
    console.error(`Não foi possível ler o arquivo. Erro: ${err.message}`);
    process.exit(1);
  });
});

router.use(validationTokenAuthorization);

router.delete('/:id', validationID, async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fs.readFile(fileDB, 'utf8');
    const dataJSON = JSON.parse(data);
    const newList = dataJSON.filter((t) => t.id !== Number(id));
    fs.writeFile(fileDB, JSON.stringify(newList));
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.use(validationName);
router.use(validationAge);
router.use(validationTalk);
router.use(validationTalkRate);
router.use(validationTalkWatchedAt);

router.post('/', async (req, res) => {
  try {
    const data = await fs.readFile('./talker.json', 'utf8');
    
    const { name, age, talk } = req.body;
    const id = JSON.parse(data).length + 1;
    const newList = [...JSON.parse(data), { id, name, age, talk }];
    
    await fs.writeFile('./talker.json', JSON.stringify(newList));
    res.status(201).json({ id, name, age, talk });
  } catch (e) {
    res.status(401).json({ message: e });
  }
});

router.put('/:id', validationID, async (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;
  try {
    const data = await fs.readFile(fileDB, 'utf8');
    const dataJSON = JSON.parse(data);
    const talker = dataJSON.findIndex((t) => t.id === Number(id));
    dataJSON[talker] = { ...dataJSON[talker], name, age, talk };
    fs.writeFile(fileDB, JSON.stringify(dataJSON));
    res.status(200).json({ ...dataJSON[talker], name, age, talk });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;