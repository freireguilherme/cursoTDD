// arquivo de configuração da conexão com o banco de dados postgres
module.exports = {
  test: {
    client: 'pg',
    version: '9.6',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'admin',
      database: 'barriga',
    },
    migrations: {
      directory: 'src/migrations',
    },
  },
};
