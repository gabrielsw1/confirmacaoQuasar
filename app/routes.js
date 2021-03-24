// Import dos Módulos
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')

//Import das rotas 
const Login = require('./login')
const Correios = require('./Correios/consultasCorreios')
const Agendamentos = require('./Agendamentos/agendamentos')
const MotivosCancelamentos = require('./Agendamentos/motivosCancelamentos')

//Declaração de Variaveis
const app = express()
const port = 8587

//import passport
const passport = require('passport')
const session = require('express-session')
require('./auth')(passport)

// Regras de Uso Geral
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json());
app.use(cors())

//Configuracoes Sessao
app.use(session({
  secret: 'teste',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

//Regras de Uso Por Rota
app.use('/', Login)
app.use('/correios', Correios)
app.use('/agendamentos', Agendamentos, MotivosCancelamentos)


//Inicio do WebService
app.listen(port, () => {
  console.log(`Aplicacao iniciada na porta ${port}`)
})
