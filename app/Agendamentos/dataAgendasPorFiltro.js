const express = require('express')
const router = express.Router()
const db = require('../dbConnect')

router.get('/agendas/:tipo/:idItemAgendamento/:idConvenio/:idMedico', (req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      if (req.params.tipo == 'exame' && !req.query.data) {
        const {rows} = await client.query(
          `select distinct id_agenda as "idAgenda"
                                          , to_char(data_agenda, 'YYYY-MM-DD') as "dtAgenda"
                            from sigh.agendas a
                                     inner join sigh.agendamentos ag on (ag.cod_agenda = a.id_agenda)
                                     inner join sigh.tipos_agendamentos ta on (ta.id_tp_agendamento = a.cod_tp_agendamento)
                                     inner join sigh.procedimentos proc on (proc.id_procedimento = a.cod_exame)
                                     inner join sigh.agendas_convenios ac on (a.id_agenda = ac.cod_agenda)
                            where ag.fechado = 'A'
                              and ac.ativo
                              and a.cod_exame = $2
                              and ac.cod_convenio = $1
                              and a.agenda_web = true
                              and a.data_agenda >= current_date
                              and ta.codigo_tp_agendamento = '3'
                              and a.cod_exame is not null
                              and (coalesce((select count(*)
                                            from sigh.agendamentos
                                            where cod_agenda = a.id_agenda
                                              and data_atend_iten_agend >= current_date
                                              and (cod_paciente is null and nm_paciente is null)
                                              and ativo
                                              and (bloqueado = false and fechado = 'A')), 0) > 0)
                              and cast((a.data_agenda || ' ' || ag.hora_atend_iten_agen)as timestamp ) > current_timestamp
                            order by 2`, [req.params.idConvenio, req.params.idItemAgendamento])
        res.status(200).json(rows)
      } else if (req.params.tipo == 'consulta' && !req.query.data) {
        const filtroMedico = req.params.idMedico && req.params.idMedico != 0 ? ` and a.cod_medico = ${req.params.idMedico}` : ''
        const {rows} = await client.query(
          `select distinct id_agenda as "idAgenda"
                                          , to_char(data_agenda, 'YYYY-MM-DD') as "dtAgenda"
                            from sigh.agendas a
                                     inner join sigh.agendamentos ag on (ag.cod_agenda = a.id_agenda)
                                     inner join sigh.tipos_agendamentos ta on (ta.id_tp_agendamento = a.cod_tp_agendamento)
                                     inner join sigh.especialidades_principais esp on (esp.id_esp_principal = a.cod_especialidade)
                                     inner join sigh.agendas_convenios ac on (a.id_agenda = ac.cod_agenda)
                            where ag.fechado = 'A'
                              and ac.ativo
                              and a.cod_especialidade = $2
                              and ac.cod_convenio = $1
                              and a.agenda_web = true
                              and a.data_agenda >= current_date
                              and ta.codigo_tp_agendamento = '2'
                              and a.cod_especialidade is not null
                              and (coalesce((select count(*)
                                            from sigh.agendamentos
                                            where cod_agenda = a.id_agenda
                                              and data_atend_iten_agend >= current_date
                                              and (cod_paciente is null and nm_paciente is null)
                                              and ativo
                                              and (bloqueado = false and fechado = 'A')), 0) > 0)
                              and cast((a.data_agenda || ' ' || ag.hora_atend_iten_agen) as timestamp ) > current_timestamp ` + filtroMedico + ' order by 2', [req.params.idConvenio, req.params.idItemAgendamento])
        res.status(200).json(rows)
      } else if (req.query.data && req.params.tipo == 'exame') {
        const {rows} = await client.query(
          `select distinct ag.id_agendamento                                                               as "value"
                                        , to_char(ag.hora_atend_iten_agen, 'HH24:MI')                                       as "label"
                                        , (to_char(coalesce(ag.data_hora_agendamento, a.data_agenda), 'DD/MM/YYYY'))        as "dtAgendamento"
                                        , (to_char(ag.hora_atend_iten_agen, 'HH24:MI'))                                     as "hora"
                                        , proc.descr_red_proc                                                               as "itemAgendamento"
                                        , coalesce(h.nome_reduzido, h.nome)                                                 as "hospital"
                                        , (l.tp_logradouro || ' ' || l.logradouro || ', ' || h.numero)                      as "logradouro"
                                        , l.municipio                                                                       as "cidade"
                                        , l.bairro_inicial                                                                  as "bairro"
                                        , (coalesce(prest.nome_reduzido, prest.nm_prestador,'Não informado'))               as "nmPrestador"
                                        , proc.orientacoes_internacao                                                       as "orientacao"
                            from sigh.agendas a
                                     inner join sigh.agendamentos ag on (ag.cod_agenda = a.id_agenda)
                                     inner join sigh.tipos_agendamentos ta on (ta.id_tp_agendamento = a.cod_tp_agendamento)
                                     inner join sigh.procedimentos proc on (proc.id_procedimento = a.cod_exame)
                                     inner join sigh.agendas_convenios ac on (a.id_agenda = ac.cod_agenda)
                                     left join sigh.prestadores prest on (prest.id_prestador = a.cod_medico)
                                     left join sigh.hospitais h on (h.id_hospital = a.cod_hospital)
                                     left join endereco_sigh.logradouros l on (l.id_logradouro = h.cod_logradouro)
                            where
                              ag.data_atend_iten_agend = $3
                              and ag.fechado = 'A'
                              and ag.bloqueado = false
                              and ag.cod_paciente is null
                              and ag.nm_paciente is null
                              and ag.ativo
                              and ac.ativo
                              and a.agenda_web = true
                              and a.cod_exame = $2
                              and ac.cod_convenio = $1
                              and ta.codigo_tp_agendamento = '3'
                              and a.cod_exame is not null
                              and (coalesce((select count(*)
                                            from sigh.agendamentos
                                            where cod_agenda = a.id_agenda
                                              and data_atend_iten_agend >= current_date
                                              and (cod_paciente is null and nm_paciente is null)
                                              and ativo
                                              and (bloqueado = false and fechado = 'A')), 0) > 0)
                              and cast((a.data_agenda || ' ' || ag.hora_atend_iten_agen)as timestamp ) > current_timestamp
                            order by 2`, [req.params.idConvenio, req.params.idItemAgendamento, req.query.data])
        res.status(200).json(rows)
      } else if (req.query.data || req.params.tipo == 'consulta') {
        const filtroMedico = req.params.idMedico && req.params.idMedico != 0 ? ` and a.cod_medico = ${req.params.idMedico}` : ''

        const {rows} = await client.query(
          `select distinct ag.id_agendamento                                                               as "value"
                                        , (to_char(ag.hora_atend_iten_agen, 'HH24:MI') || ' - ' || prest.nm_prestador)      as "label"
                                        , (to_char(coalesce(ag.data_hora_agendamento, a.data_agenda), 'DD/MM/YYYY'))        as "dtAgendamento"
                                        , (to_char(ag.hora_atend_iten_agen, 'HH24:MI'))                                     as "hora"
                                        , esp.nm_especialidade                                                              as "itemAgendamento"
                                        , coalesce(h.nome_reduzido, h.nome)                                                 as "hospital"
                                        , (l.tp_logradouro || ' ' || l.logradouro || ', ' || h.numero)                      as "logradouro"
                                        , l.municipio                                                                       as "cidade"
                                        , l.bairro_inicial                                                                  as "bairro"
                                        , (coalesce(prest.nome_reduzido, prest.nm_prestador,'Não informado'))                               as "nmPrestador"
                            from sigh.agendas a
                                     inner join sigh.agendamentos ag on (ag.cod_agenda = a.id_agenda)
                                     inner join sigh.tipos_agendamentos ta on (ta.id_tp_agendamento = a.cod_tp_agendamento)
                                     inner join sigh.especialidades_principais esp on (esp.id_esp_principal = a.cod_especialidade)
                                     inner join sigh.agendas_convenios ac on (a.id_agenda = ac.cod_agenda)
                                     left join sigh.prestadores prest on (prest.id_prestador = a.cod_medico)
                                     left join sigh.hospitais h on (h.id_hospital = a.cod_hospital)
                                     left join endereco_sigh.logradouros l on (l.id_logradouro = h.cod_logradouro)
                            where
                            ag.data_atend_iten_agend = $3
                            and ag.fechado = 'A'
                              and a.cod_especialidade = $2
                              and ac.cod_convenio = $1
                              and ag.fechado = 'A'
                              and ag.bloqueado = false
                              and ag.cod_paciente is null
                              and ag.nm_paciente is null
                              and ag.ativo
                              and ac.ativo
                              and a.agenda_web = true
                              and ta.codigo_tp_agendamento = '2'
                              and a.cod_especialidade is not null
                              and (coalesce((select count(*)
                                            from sigh.agendamentos
                                            where cod_agenda = a.id_agenda
                                              and data_atend_iten_agend >= current_date
                                              and (cod_paciente is null and nm_paciente is null)
                                              and ativo
                                              and (bloqueado = false and fechado = 'A')), 0) > 0)
                              and cast((a.data_agenda || ' ' || ag.hora_atend_iten_agen) as timestamp ) > current_timestamp ` + filtroMedico + ' order by 2', [req.params.idConvenio, req.params.idItemAgendamento, req.query.data])
        res.status(200).json(rows)
      }

    } finally {
      client.release()
    }
  })().catch((e) => {
    console.log(e)
    res.status(400).json(e)
  })

})

module.exports = router
