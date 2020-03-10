// rotas para lidar com requisições para usuários
module.exports = (app) => {
  const findAll = (req, res) => { // função para listar usuários
    app.services.user.findAll()
      .then((result) => res.status(200).json(result));
  };

  const create = async (req, res) => { // função para criar novo usuário
    const result = await app.services.user.save(req.body); // retorna uma array
    res.status(201).json(result[0]); // para retornar o primeiro usuario
  };
  return { findAll, create };
};
