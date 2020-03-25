const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile.js');

// TODO criar chaveamento dinamico
app.db = knex(knexfile.test);

consign({ cwd: 'src', verbose: false }) // consign irá organizar os arquivos
  .include('./config/passport.js') // incluindo o middleware (body-parser)
  .then('./config/middlewares.js') // incluindo o middleware (body-parser)
  .then('./services') // serviços
  .then('./routes') // as rotas
  .then('./config/routes.js') // as configurações de rotas
  .into(app); // isso tudo no aplicativo app

app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  if (name === 'ValidationError') res.status(400).json({ error: err.message });
  else res.status(500).json({ name, message, stack });
  next();
});

/*
app.get('/', (req, res) => {
  res.status(200).send();
});
*/

// aleternativa ao knex-logger
/* app.db.on('query', (query) => {
  console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' });
})
  .on('query-response', (response) => console.log(response))
  .on('error', (error) => console.log(error));
*/
module.exports = app;
