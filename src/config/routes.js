module.exports = (app) => {
  app.route('/users')
    .get(app.routes.users.findAll) // quando receber um get, direciona para a função de listar
    .post(app.routes.users.create); // quando receber um post, direciona para a função de criar
};
