const fs = require('fs').promises;

const validationTalker = (req, res, next) => {
    fs.readFile('./talker.json', 'utf8')
    .then((data) => {
      if (JSON.parse(data).length === 0) return res.status(200).json([]);
      next();
    })
    .catch((err) => {
      console.error(`Não foi possível ler o arquivo. Erro: ${err}`);
      process.exit(1);
    });
};

module.exports = validationTalker;