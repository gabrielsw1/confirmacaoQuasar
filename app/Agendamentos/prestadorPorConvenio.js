const express = require('express')
const router = express.Router()
const db = require('../dbConnect')

router.get('/prestador/:idItemAgendamento/:idConvenio', (req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
        const convenios = await client.query(
          `select distinct prest.id_prestador as "value"
                                          , prest.nm_prestador as "label"
                            from sigh.agendas_convenios ac
                                     inner join sigh.convenios c on (c.id_convenio = ac.cod_convenio)
                                     inner join sigh.agendas a on (a.id_agenda = ac.cod_agenda)
                                     inner join sigh.prestadores prest on (prest.id_prestador = a.cod_medico)
                            where
                               ac.cod_convenio = $1
                              and c.ativo
                              and a.id_agenda in (
                                select distinct id_agenda
                                from sigh.agendas a
                                         inner join sigh.agendamentos ag on (ag.cod_agenda = a.id_agenda)
                                         inner join sigh.tipos_agendamentos ta on (ta.id_tp_agendamento = a.cod_tp_agendamento)
                                         inner join sigh.especialidades_principais esp on (esp.id_esp_principal = a.cod_especialidade)
                                where ag.fechado = 'A'
                                  and a.cod_especialidade = $2
                                  and a.agenda_web = true
                                  and a.data_agenda >= current_date
                                  and ta.codigo_tp_agendamento = '2'
                                  and a.cod_especialidade is not null
                                  and coalesce((select count(*)
                                                from sigh.agendamentos
                                                where cod_agenda = a.id_agenda
                                                  and data_atend_iten_agend >= current_date
                                                  and (cod_paciente is null and nm_paciente is null)
                                                  and ativo
                                                  and (bloqueado = false and fechado = 'A')), 0) > 0)
                            order by label`, [req.params.idConvenio, req.params.idItemAgendamento])
        res.status(200).json(convenios.rows)
    } finally {
      client.release()
    }
  })().catch((e) => {
    res.status(400).json(e)
  })

})

module.exports = router
