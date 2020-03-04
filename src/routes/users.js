// rotas para lidar com requisições para usuários
module.exports = () => {
  const findAll = (req, res) => { // função para listar usuários
    const users = [
      { name: 'John Doe', mail: 'john@mail.com' },
    ];
    res.status(200).json(users);
  };

  const create = (req, res) => { // função para criar novo usuário
    res.status(201).json(req.body);
  };
  return { findAll, create };
};
