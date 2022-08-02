const fs = require('fs').promises;

const validationTalkerID = (req, res, next) => {
  fs.readFile('./talker.json', 'utf8')
  .then((data) => {
    const { id } = req.params;
    const talkerList = JSON.parse(data);
    const talker = talkerList.find((t) => t.id === Number(id));
    if (talker === undefined) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    next();
  })
  .catch((err) => {
    console.error(`Não foi possível ler o arquivo. Erro: ${err}`);
    process.exit(1);
  });
};

module.exports = validationTalkerID;