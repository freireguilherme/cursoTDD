module.exports = (app) => {
  app.route('/users')
    .get(app.routes.users.findAll) // quando receber um get, direciona para a função de listar
    .post(app.routes.users.create); // quando receber um post, direciona para a função de criar

  app.route('/accounts')
    .get(app.routes.accounts.getAll)
    .post(app.routes.accounts.create);

  app.route('/accounts/:id')
    .get(app.routes.accounts.get)
    .put(app.routes.accounts.update)
    .delete(app.routes.accounts.remove);
};
