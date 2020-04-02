module.exports = function RecursoIndevidoError(message = 'Este recurso não pertece ao usuário') {
  this.name = 'RecursoIndevidoError';
  this.message = message;
};
