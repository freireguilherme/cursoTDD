const app = require('express')();
const consign = require('consign');

consign({ cwd: 'src', verbose: false }) // consign irá organizar os arquivos
  .include('./config/middlewares.js') // incluindo o middleware (body-parser)
  .then('./routes') // as rotas
  .then('./config/routes.js') // as configurações de rotas
  .into(app); // isso tudo no aplicativo app

app.get('/', (req, res) => {
  res.status(200).send();
});

module.exports = app;
