// rotas para lidar com requisições para usuários
const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', (req, res, next) => { // função para listar usuários
    app.services.user.findAll()
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.post('/', async (req, res, next) => { // função para criar novo usuário
    try {
      const result = await app.services.user.save(req.body); // retorna uma array
      return res.status(201).json(result[0]); // para retornar o primeiro usuario
    } catch (err) {
      return next(err); // se error, retorna status 400
    }
  });
  return router;
};
