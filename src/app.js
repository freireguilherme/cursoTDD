const app = require('express')();
const consign = require('consign');
const knex = require('knex');
// const knexlogger = require('knex-logger');
const knexfile = require('../knexfile.js');

// TODO criar chaveamento dinamico
app.db = knex(knexfile.test);

// app.use(knexlogger(app.db)); // knex-logger irá mostrar as consultas ao db nos testes

consign({ cwd: 'src', verbose: false }) // consign irá organizar os arquivos
  .include('./config/middlewares.js') // incluindo o middleware (body-parser)
  .then('./services') // serviços
  .then('./routes') // as rotas
  .then('./config/routes.js') // as configurações de rotas
  .into(app); // isso tudo no aplicativo app

app.get('/', (req, res) => {
  res.status(200).send();
});

// aleternativa ao knex-logger
/* app.db.on('query', (query) => {
  console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' });
})
  .on('query-response', (response) => console.log(response))
  .on('error', (error) => console.log(error));
*/
module.exports = app;
