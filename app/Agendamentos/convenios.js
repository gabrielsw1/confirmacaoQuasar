const express = require('express')
const router = express.Router()
const db = require('../dbConnect')

router.get('/convenios/:tipo/:id', (req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      if (req.params.tipo === 'consulta') {
        const convenios = await client.query(
          `select distinct ac.cod_convenio as "value"
                                          , c.nm_fantasia   as "label"
                            from sigh.agendas_convenios ac
                                     inner join sigh.convenios c on (c.id_convenio = ac.cod_convenio)
                            where ac.ativo
                              and c.ativo
                              and cod_agenda in (
                                select distinct id_agenda
                                from sigh.agendas a
                                         inner join sigh.agendamentos ag on (ag.cod_agenda = a.id_agenda)
                                         inner join sigh.tipos_agendamentos ta on (ta.id_tp_agendamento = a.cod_tp_agendamento)
                                         inner join sigh.especialidades_principais esp on (esp.id_esp_principal = a.cod_especialidade)
                                where ag.fechado = 'A'
                                  and a.cod_especialidade = $1
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
                            order by label`, [req.params.id])
        res.status(200).json(convenios.rows)
      } else if (req.params.tipo === 'exame') {
        const convenios = await client.query(
          `select distinct ac.cod_convenio as "value"
                                        , c.nm_fantasia   as "label"
                          from sigh.agendas_convenios ac
                                   inner join sigh.convenios c on (c.id_convenio = ac.cod_convenio)
                          where ac.ativo
                            and c.ativo
                            and cod_agenda in (
                              select distinct a.id_agenda
                              from sigh.agendas a
                                       inner join sigh.agendamentos ag on (ag.cod_agenda = a.id_agenda)
                                       inner join sigh.tipos_agendamentos ta on (ta.id_tp_agendamento = a.cod_tp_agendamento)
                                       inner join sigh.procedimentos proc on (proc.id_procedimento = a.cod_exame)
                              where ag.fechado = 'A'
                                and a.agenda_web = true
                                and a.cod_exame = $1
                                and a.data_agenda >= current_date
                                and ta.codigo_tp_agendamento = '3'
                                and a.cod_exame is not null
                                and coalesce((select count(*)
                                              from sigh.agendamentos
                                              where cod_agenda = a.id_agenda
                                                and data_atend_iten_agend >= current_date
                                                and (cod_paciente is null and nm_paciente is null)
                                                and ativo
                                                and (bloqueado = false and fechado = 'A')), 0) > 0)
                          order by label`, [req.params.id])
        res.status(200).json(convenios.rows)
      }

    } finally {
      client.release()
    }
  })().catch((e) => {
    res.status(400).json(e)
  })

})

module.exports = router
