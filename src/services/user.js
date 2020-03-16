module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('users').where(filter).select();
  };

  const save = async (user) => {
    if (!user.name) return { error: 'Nome é atributo obrigatório' }; // validando se nome existe
    if (!user.mail) return { error: 'Email é atributo obrigatório' }; // validando se email existe
    if (!user.passwd) return { error: 'Senha é atributo obrigatório' }; // validando se senha existe

    const userdb = await findAll({ mail: user.mail }); // validando email duplicado
    if (userdb && userdb.length > 0) return { error: 'Já existe um usuário com esse email' };

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
