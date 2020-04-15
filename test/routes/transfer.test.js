const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQG1haWwuY29tIn0.QMgvo_lPe0Rdxpx7cay_hIkDAbjCK_--VD2fP0NTTqk';

beforeAll(async () => {
  // await app.db.migrate.rollback();
  // await app.db.migrate.latest();
  await app.db.seed.run();
});

test('Deve listar apenas as transferencias do usuario', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('transfer #1');
    });
});

test('Deve inserir uma transferencia com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({ description: 'Regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
    .then(async (res) => {
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('Regular transfer');

      const transactions = await app.db('transactions').where({ transfer_id: res.body.id });
      expect(transactions).toHaveLength(2);
      expect(transactions[0].description).toBe('Transfer to acc #10001');
      expect(transactions[1].description).toBe('Transfer from acc #10000');
      expect(transactions[0].ammount).toBe('-100.00');
      expect(transactions[1].ammount).toBe('100.00');
      expect(transactions[0].acc_id).toBe(10000);
      expect(transactions[1].acc_id).toBe(10001);
    });
});

describe('Ao salvar uma transferencia valida...', () => {
  let transferID;
  let income;
  let outcome;

  test('Deve retornar o status 201 e os dados da transferencia', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: 'Regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
      .then(async (res) => {
        expect(res.status).toBe(201);
        expect(res.body.description).toBe('Regular transfer');
        transferID = res.body.id;
      });
  });

  test('As transacoes equivalentes devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferID }).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });

  test('A transacao de saida deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001');
    expect(outcome.ammount).toBe('-100.00');
    expect(outcome.acc_id).toBe(10000);
    expect(outcome.type).toBe('O');
  });

  test('A transacao de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #10000');
    expect(income.ammount).toBe('100.00');
    expect(income.acc_id).toBe(10001);
    expect(income.type).toBe('I');
  });

  test('Ambas devem referenciar a transferencia que as originou', () => {
    expect(income.transfer_id).toBe(transferID);
    expect(outcome.transfer_id).toBe(transferID);
  });
});

describe('Ao tentar salvar uma transferencia invalida', () => {
  let ValidTransfer;

  beforeAll(() => {
    ValidTransfer = { description: 'Regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() };
  });

  const testTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...ValidTransfer, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Nao deve inserir sem descrição', () => testTemplate({ description: null }, 'Descrição é um atributo obrigatório'));
  test('Nao deve inserir sem valor', () => testTemplate({ ammount: null }, 'Valor é um atributo obrigatório'));
  test('Nao deve inserir sem data', () => testTemplate({ date: null }, 'Data é um atributo obrigatório'));
  test('Nao deve inserir sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'Conta de origem é um atributo obrigatório'));
  test('Nao deve inserir sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'Conta de destino é um atributo obrigatório'));
  test('Nao deve inserir se as contas de origem e destino forem as mesmas', () => testTemplate({ acc_dest_id: 10000 }, 'Não é possível transferir de uma conta para ela mesma'));
  test('Nao deve inserir se as contas pertecerem a outro usuario', () => testTemplate({ acc_ori_id: 10002 }, 'Conta #10002 não pertence ao usuário'));
});

test('Deve retornar uma transferencia por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('transfer #1');
    });
});

describe('Ao alterar uma transferencia valida...', () => {
  let transferID;
  let income;
  let outcome;

  test('Deve retornar o status 200 e os dados da transferencia', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: 'Transfer Updated', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 500, date: new Date() })
      .then(async (res) => {
        expect(res.status).toBe(200);
        expect(res.body.description).toBe('Transfer Updated');
        expect(res.body.ammount).toBe('500.00');
        transferID = res.body.id;
      });
  });

  test('As transacoes equivalentes devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferID }).orderBy('ammount');
    expect(transactions).toHaveLength(2);
    [outcome, income] = transactions;
  });

  test('A transacao de saida deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001');
    expect(outcome.ammount).toBe('-500.00');
    expect(outcome.acc_id).toBe(10000);
    expect(outcome.type).toBe('O');
  });

  test('A transacao de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #10000');
    expect(income.ammount).toBe('500.00');
    expect(income.acc_id).toBe(10001);
    expect(income.type).toBe('I');
  });

  test('Ambas devem referenciar a transferencia que as originou', () => {
    expect(income.transfer_id).toBe(transferID);
    expect(outcome.transfer_id).toBe(transferID);
  });
});
