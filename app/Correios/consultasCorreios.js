const express = require('express')
const router = express.Router()
const soap = require('soap')

let urlCorreios = 'https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente?wsdl'

router.get('/consultaCEP/:cep', (req, res) => {
    let cep = req.params.cep
    soap.createClientAsync(urlCorreios)
        .then(client =>
            client.consultaCEP({ cep }, (err, result) => {
                if (err) {
                    res.status(400).json(err)
                } else {
                    res.status(200).json(result)
                }
            }))
})

module.exports = router