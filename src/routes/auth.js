const jwt = require('jwt-simple');
const express = require('express');
const bcrypt = require('bcryptjs');
const ValidationError = require('../errors/ValidationError');

const secret = 'Segredo!';

module.exports = (app) => {
  const router = express.Router();

  router.post('/signin', (req, res, next) => {
    app.services.user.findOne({ mail: req.body.mail })
      .then((user) => {
        if (!user) throw new ValidationError('Usuário ou senha inválido');
        if (bcrypt.compareSync(req.body.passwd, user.passwd)) {
          const payload = {
            id: user.id,
            name: user.name,
            mail: user.mail,
          };
          const token = jwt.encode(payload, secret);
          res.status(200).json({ token });
        } else throw new ValidationError('Usuário ou senha inválido');
      }).catch((err) => next(err));
  });

  router.post('/signup', async (req, res, next) => { // função para criar novo usuário
    try {
      const result = await app.services.user.save(req.body); // retorna uma array
      return res.status(201).json(result[0]); // para retornar o primeiro usuario
    } catch (err) {
      return next(err); // se error, retorna status 400
    }
  });

  return router;
};
