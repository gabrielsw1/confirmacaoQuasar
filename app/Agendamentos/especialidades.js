const express = require('express')
const router = express.Router()
const db = require('../dbConnect')

router.get('/especialidades', (req, res) => {
    (async() => {
        const client = await db.pool.connect()
        try {
            const especialidades = await client.query(
                    `select distinct a.cod_especialidade     as "value"
                                    , esp.nm_especialidade                  as "label"
                                    from sigh.agendas a
                                             inner join sigh.agendamentos ag on (ag.cod_agenda = a.id_agenda)
                                             inner join sigh.tipos_agendamentos ta on (ta.id_tp_agendamento = a.cod_tp_agendamento)
                                             inner join sigh.especialidades_principais esp on (esp.id_esp_principal = a.cod_especialidade)
                                    where ag.fechado = 'A'
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
                                                       and (bloqueado = false and fechado = 'A')), 0) > 0`)
            res.status(200).json(especialidades.rows)
        } finally {
            client.release()
        }
    })().catch((e) => {
        res.status(400).json(e)
    })

})

module.exports = router
