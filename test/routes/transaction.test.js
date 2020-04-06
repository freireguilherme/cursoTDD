const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transactions';
let user;
let user2;
let accUser;
let accUser2;

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();
  const users = await app.db('users').insert([
    { name: 'User #1', mail: 'user@mail.com', passwd: '$2a$10$QRUOMAniPfqR1HGOTcTqtuasWY3ab7KqKXbtgEFF8eTF.DFbrFzG6' },
    { name: 'User #2', mail: 'user2@mail.com', passwd: '$2a$10$QRUOMAniPfqR1HGOTcTqtuasWY3ab7KqKXbtgEFF8eTF.DFbrFzG6' },
  ], '*');
  [user, user2] = users;
  delete user.passwd;
  user.token = jwt.encode(user, 'Segredo!');

  const accs = await app.db('accounts').insert([
    { name: 'Acc #1', user_id: user.id },
    { name: 'Acc #2', user_id: user2.id },
  ], '*');
  [accUser, accUser2] = accs;
});

test('Deve listar apenas as transações do usuario', () => {
  return app.db('transactions').insert([
    { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id },
    { description: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('T1');
    }));
});

test('Deve inserir uma transação com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ description: 'New T', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
    });
});

test('Deve retornar uma transação por iD', () => {
  return app.db('transactions').insert(
    { description: 'New T', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'],
  ).then((res) => request(app).get(`${MAIN_ROUTE}/${res[0].id}`)
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(200);
      expect(result.body.id).toBe(res[0].id);
      expect(result.body.description).toBe('New T');
    }));
});

test('Deve alterar uma transação', () => {
  return app.db('transactions').insert(
    { description: 'T for Update', date: new Date(), ammount: 150, type: 'I', acc_id: accUser.id }, ['id'],
  ).then((transaction) => request(app).put(`${MAIN_ROUTE}/${transaction[0].id}`)
    .send({ description: 'T updated', ammount: 200, type: 'O' })
    .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('T updated');
      expect(res.body.ammount).toBe('200.00');
      expect(res.body.type).toBe('O');
    });
});

test('Deve remover uma transação', () => {
  return app.db('transactions').insert(
    { description: 'T for delete', date: new Date(), ammount: 50, type: 'I', acc_id: accUser.id }, ['id'],
  ).then((transaction) => request(app).delete(`${MAIN_ROUTE}/${transaction[0].id}`)
    .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

test('Não deve remover uma transação de outro user', () => {
  return app.db('transactions').insert(
    { description: 'T for delete', date: new Date(), ammount: 50, type: 'I', acc_id: accUser2.id }, ['id'],
  ).then((transaction) => request(app).delete(`${MAIN_ROUTE}/${transaction[0].id}`)
    .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Este recurso não pertece ao usuário');
    });
});

test('Não deve alterar uma transação de outro user', () => {
  return app.db('transactions').insert(
    { description: 'T for update', date: new Date(), ammount: 50, type: 'I', acc_id: accUser2.id }, ['id'],
  ).then((transaction) => request(app).put(`${MAIN_ROUTE}/${transaction[0].id}`)
    .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Este recurso não pertece ao usuário');
    });
});
