function validationEmail(email, res) {
  const regex = /^\S+@\S+\.\S+$/;

  const erros = [
    { message: 'O campo "email" é obrigatório' },
    { message: 'O "email" deve ter o formato "email@email.com"' },
  ];

  if (email === undefined || email === '') return res.status(400).json(erros[0]);
  if (!regex.test(email)) return res.status(400).json(erros[1]);
}

function validationPassword(password, res) {
  const erros = [
    { message: 'O campo "password" é obrigatório' },
    { message: 'O "password" deve ter pelo menos 6 caracteres' },
  ];

  if (password === undefined || password === '') return res.status(400).json(erros[0]);
  if (password.length < 6) return res.status(400).json(erros[1]);
}

function validationLogin(req, res, next) {
  const { email, password } = req.body;

  validationPassword(password, res);
  validationEmail(email, res);

  next();
}

module.exports = validationLogin;