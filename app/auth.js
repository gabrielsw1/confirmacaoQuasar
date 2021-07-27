const localStrategy = require('passport-local').Strategy
const db = require('./dbConnect')
const bcrypt = require("bcryptjs")
const md5 = require('md5')

module.exports = function (passport) {
  passport.use(new localStrategy(async (username, password, done) => {
    const client = await db.pool.connect()
    console.log('iniciando login')
    client.query(`
            select * from sigh.pacientes where email Ilike '${username}' limit 1
        `)
      .then(paciente => {

        if (paciente.rows.length === 0) {
          return done(null, false)
        }

        if (md5(password) === paciente.rows[0].pwd) {
          return done(null, ...paciente.rows)
        } else {
          return done(null, false)
        }
      }).catch(e => console.log(e))
  }))

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser(async (id, done) => {
    const client = await db.pool.connect()
    client.query(`select * from sigh.pacientes where id_paciente = ${id.id_paciente}`).then(user => {
      done(null, user)
    }).catch(e => console.log(e))
  })
}
