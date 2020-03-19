const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Nome é atributo obrigatório'); // validando se nome existe
    if (!user.mail) throw new ValidationError('Email é atributo obrigatório'); // validando se email existe
    if (!user.passwd) throw new ValidationError('Senha é atributo obrigatório'); // validando se senha existe

    const userdb = await findAll({ mail: user.mail }); // validando email duplicado
    if (userdb && userdb.length > 0) throw new ValidationError('Já existe um usuário com esse email');

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
