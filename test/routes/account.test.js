const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@mail.com`, passwd: '123456' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
});

test('Deve inserir uma conta com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Acc #1', user_id: user.id })
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('Acc #1');
    });
});

test('Não deve inserir uma conta sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ user_id: user.id })
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Nome é um atributo obrigatório');
    });
});

// ToDO autenticação
test.skip('Não deve inserir uma conta de nome duplicado para o mesmo usuario', () => {

});

// ToDo nao se deve listar todas as contas
test('Deve listar todas as contas', () => {
  return app.db('accounts') // cada teste monta a massa necessaria para executar
    .insert({ name: 'Acc list', user_id: user.id }) // inserir uma conta, para o teste ser atomico
    .then(() => request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)) // requisição get
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test.skip('Deve listar apenas as contas do usuario', () => {

});

// ToDo deve retornar a conta apenas do usuario autorizado
test('Deve retornar uma conta por id', () => {
  return app.db('accounts')
    .insert({ name: 'Acc by Id', user_id: user.id }, ['id'])
    .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc by Id');
      expect(res.body.user_id).toBe(user.id);
    });
});

test.skip('Não deve retornar uma conta de outro usuario', () => {

});

// ToDo deve alterar a conta apenas do usuario autorizado
test('Deve alterar uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Acc to Update', user_id: user.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .send({ name: 'Acc update' })
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc update');
    });
});

test.skip('Não deve alterar uma conta de outro usuario', () => {

});

// ToDo deve remover a conta apenas do usuario autorizado
test('Deve remover uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Acc to remove', user_id: user.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204); // status referente a body vazio
    });
});

test.skip('Não deve remover uma conta de outro usuario', () => {

});
