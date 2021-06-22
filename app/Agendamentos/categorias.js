const express = require('express')
const router = express.Router()
const db = require('../dbConnect')

router.get('/categorias/:id', (req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
        const categorias = await client.query(
          `select
                                id_categoria    as "value"
                                , nm_categoria  as "label"
                            from sigh.categorias
                            where cod_convenio = $1`, [req.params.id])
        res.status(200).json(categorias.rows)
    } finally {
      client.release()
    }
  })().catch((e) => {
    res.status(400).json(e)
  })

})

module.exports = router
