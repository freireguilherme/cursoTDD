// rotas para lidar com requisições para usuários
module.exports = (app) => {
  const findAll = (req, res, next) => { // função para listar usuários
    app.services.user.findAll()
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  };

  const create = async (req, res, next) => { // função para criar novo usuário
    try {
      const result = await app.services.user.save(req.body); // retorna uma array
      return res.status(201).json(result[0]); // para retornar o primeiro usuario
    } catch (err) {
      return next(err); // se error, retorna status 400
    }
  };
  return { findAll, create };
};
