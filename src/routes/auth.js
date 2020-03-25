const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');

const secret = 'Segredo!';

module.exports = (app) => {
  const signin = (req, res, next) => {
    app.services.user.findOne({ mail: req.body.mail })
      .then((user) => {
        if (bcrypt.compareSync(req.body.passwd, user.passwd)) {
          const playload = {
            id: user.id,
            name: user.name,
            mail: user.mail,
          };
          const token = jwt.encode(playload, secret);
          res.status(200).json({ token });
        }
      }).catch((err) => next(err));
  };

  return { signin };
};
