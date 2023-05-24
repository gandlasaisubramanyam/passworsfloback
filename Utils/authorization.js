const { expressjwt: jwt } = require('express-jwt')

exports.requireSignIn = jwt({
  secret: process.env.SECRET_KEY,
  algorithms: ['HS256'],
  userProperty: 'auth'
})
exports.isAuth = (req, res, next) => {
  console.log('Auth: ', req.auth)
  let user = req.auth._id
  console.log('User: ', user)
  if (!user) {
    res.status(403).send({
      err: 'Access denied'
    })
  }
  next()
}