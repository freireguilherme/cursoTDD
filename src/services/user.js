const bcrypt = require('bcryptjs');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select(['id', 'name', 'mail']);
  };

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const getPasswdHash = (passwd) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(passwd, salt);
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Nome é atributo obrigatório'); // validando se nome existe
    if (!user.mail) throw new ValidationError('Email é atributo obrigatório'); // validando se email existe
    if (!user.passwd) throw new ValidationError('Senha é atributo obrigatório'); // validando se senha existe

    const userdb = await findOne({ mail: user.mail }); // validando email duplicado
    if (userdb) throw new ValidationError('Já existe um usuário com esse email');

    const newUser = { ...user };
    newUser.passwd = getPasswdHash(user.passwd);

    return app.db('users').insert(newUser, ['id', 'name', 'mail']);
  };

  return { findAll, save, findOne };
};
