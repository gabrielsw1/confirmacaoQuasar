const express = require('express')
const router = express.Router()
const db = require('../dbConnect')

router.get('/motivos/Cancelamentos', (req, res) => {
    (async() => {
        const client = await db.pool.connect()
        try {
            const Cancelamentos = await client.query(
                    `select 
                    id_motivo_cancelamento as "value",
                    descr_motivo_cancelamento as "label" 
                    from sigh.motivos_cancelamentos  
                    where ativo
                    `)
            res.status(200).json(Cancelamentos.rows)
        } finally {
            client.release()
        }
    })().catch((e) => {
        res.status(400).json(e)
    })

})

module.exports = router