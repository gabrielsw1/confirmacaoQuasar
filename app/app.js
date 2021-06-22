// Import dos Módulos
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')

//Import das rotas
const Login = require('./login')
const Correios = require('./Correios/consultasCorreios')
const Agendamentos = require('./Agendamentos/agendamentos')
const MotivosCancelamentos = require('./Agendamentos/motivosCancelamentos')
const Especialidades = require('./Agendamentos/especialidades')
const Exames = require('./Agendamentos/exames')
const Convenios = require('./Agendamentos/convenios')
const Categorias = require('./Agendamentos/categorias')
const Prestador = require('./Agendamentos/prestadorPorConvenio')
const Pacientes = require('./Pacientes/pacientes')

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
app.use(cors({origin: true, credentials: true}))

//Configuracoes Sessao
app.use(session({
  secret: 'teste',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 30 * 60 * 1000} //30min
}))
app.use(passport.initialize())
app.use(passport.session())

//Regras de Uso Por Rota
app.use('/', Login)
app.use('/pacientes', Pacientes)
app.use('/correios', Correios)
app.use('/agendamentos', Agendamentos, MotivosCancelamentos, Especialidades, Exames, Convenios,Categorias,Prestador)


//Inicio do WebService
app.listen(port, () => {
  console.log(`Aplicacao iniciada na porta ${port}`)
})
