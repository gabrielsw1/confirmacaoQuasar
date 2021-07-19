const express = require('express')
const router = express.Router()
const db = require('../dbConnect')

router.get('/consultaAgendamentos/:id', (req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      const agendamentos = await client.query(
        `SELECT
                    agend.id_agendamento                               AS "idAgendamento",
                    p.id_paciente                                      AS "idPaciente",
					          p.nm_paciente                                      AS "nmPaciente",
                    TO_CHAR(agend.data_atend_iten_agend, 'DD/MM/YYYY') AS "dtAgendamento",
                    TO_CHAR(agend.hora_atend_iten_agen, 'HH:MM')       AS "hrAgendamento",
                    proc.descr_red_proc                                AS "descrProcedimento",
                    esp.nm_especialidade                               AS "descrEspecialidade",
                    agend.obs_resp_pag                                 AS "observacaoAgendamento",
                    conv.nm_fantasia                                   AS "nmConvenio",
                    cat.nm_categoria                                   AS "nmCategoria",
                    prest.nm_prestador                                 AS "nmPrestador",
                    h.nome                                             AS "nmHospital",
                    l.logradouro || ', ' || h.numero                   AS "logradouro"
                    FROM
                        sigh.agendas ag
                    LEFT JOIN sigh.agendamentos agend ON
                        agend.cod_agenda = ag.id_agenda
                    LEFT JOIN sigh.especialidades_principais esp ON
                        ag.cod_especialidade = esp.id_esp_principal
                    LEFT JOIN sigh.convenios conv ON
                        conv.id_convenio = agend.cod_convenio
                    LEFT JOIN sigh.categorias cat ON
                        cat.id_categoria = agend.cod_categoria
                    LEFT JOIN sigh.pacientes p ON
                        p.id_paciente = agend.cod_paciente
                    LEFT JOIN sigh.prestadores prest ON
                        prest.id_prestador = agend.cod_medico
                    INNER JOIN sigh.hospitais h ON
                        h.id_hospital = ag.cod_hospital
                    LEFT JOIN endereco_sigh.logradouros l ON
                        l.id_logradouro = h.cod_logradouro
                    left JOIN sigh.procedimentos proc ON
                        proc.id_procedimento = ag.cod_exame
                    WHERE agend.cod_paciente = $1
                    AND ag.data_agenda >= current_date
                    and ag.agenda_web = true
                    AND cod_motivo_cancelamento is null`,[req.params.id]) //nao esquecer de mudar o left do procedimento para INNER
      res.status(200).json(agendamentos.rows)
    } finally {
      client.release()
    }
  })().catch((e) => {
    res.status(400).json(e)
  })

})

router.delete('/cancelar/:idHorario/:motivoCancelamento', (req, res) => {
  (async () => {
    const client = await db.pool.connect()

    try {

      let converteDataPostgres = (date) => {
        const a = new Date(date)
        const dia = a.getUTCDate()
        const mes = a.getUTCMonth() + 1
        const ano = a.getFullYear()
        return `${ano}-${mes}-${dia}`
      }


      let agendamentoOriginal = await client.query(`select * from sigh.agendamentos where id_agendamento = ${req.params.idHorario}`)
      agendamentoOriginal = agendamentoOriginal.rows
      await client.query(`update
                                       sigh.agendamentos
                                    set
                                       nm_paciente = null
                                       , cod_paciente = null
                                       , cod_convenio = null
                                       , cod_categoria = null
                                       , cod_procedimento =  (select cod_procedimento from sigh.agendas where id_agenda = ${agendamentoOriginal[0].cod_agenda})
                                       , hora_atendimento = null
                                       , cod_especialidade = null
                                       , cod_procedencia = null
                                       , cod_encaminhamento = null
                                       , data_marcacao = null
                                       , cod_setor = (select cod_setor from sigh.agendas where id_agenda = ${agendamentoOriginal[0].cod_agenda})
                                       , cod_sala = (select cod_sala from sigh.agendas where id_agenda = ${agendamentoOriginal[0].cod_agenda})
                                       , cod_cbo = null
                                       , compl_iten_agendamento = null
                                       , consulta_retorno = 'N'
                                       , meio_agendamento = ''
                                       , cobrar = 'N'
                                       , fone_paciente = null
                                       , nm_responsavel = null
                                       , cod_grau_parentesco = null
                                       , fatura_iten_agendado = null
                                       , cod_grupo_sus = null
                                       , cod_tipo_sus = null
                                       , cod_especialidade_sus = null
                                       , cod_subespecialidade = null
                                       , em_edicao = false
                                       , cod_fia = null
                                       , sequencial = null
                                       , duracao_consulta = (select intervalo_consulta from sigh.agendas where id_agenda = ${agendamentoOriginal[0].cod_agenda})
                                       , tratamento = false
                                       , cod_agendamento_tratamento = null
                                       , celular_paciente = null
                                       , falta = null
                                       , tipo_atend_tiss = 4
                                       , tipo_consulta_tiss = 1
                                       , email = null
                                       , autorizado_convenio = false
                                       , data_origem_marcacao = null
                                       , data_transferencia = null
                                       , data_nasc = null
                                       , nm_medico_solicitante = null
                                       , cod_prescricao = null
                                       , cod_agendamento_integracao_ag = null
                                   where
                                        id_agendamento = ${agendamentoOriginal[0].id_agendamento}`)




      //Gera o novo registro na agenda com o motivo agendamento
      await client.query(`
                                            insert into
                                            sigh.agendamentos_desistencias (
                                                 cod_agenda
                                                , data_atend_iten_agend
                                                , hora_atend_iten_agen
                                                , nm_paciente
                                                , cod_paciente
                                                , cod_convenio
                                                , cod_categoria
                                                , cod_procedimento
                                                , hora_atendimento
                                                , duracao_consulta
                                                , cod_especialidade
                                                , cod_procedencia
                                                , cod_encaminhamento
                                                , data_marcacao
                                                , cod_setor
                                                , cod_sala
                                                , cod_cbo
                                                , consulta_retorno
                                                , meio_agendamento
                                                , fone_paciente
                                                , nm_responsavel
                                                , cod_grau_parentesco
                                                , fatura_iten_agendado
                                                , cod_grupo_sus
                                                , cod_tipo_sus
                                                , cod_especialidade_sus
                                                , cod_subespecialidade
                                                , em_edicao
                                                , cod_fia
                                                , tratamento
                                                , cod_agendamento_tratamento
                                                , celular_paciente
                                                , email
                                                , autorizado_convenio
                                                , data_nasc
                                                , nm_medico_solicitante
                                                , cod_prescricao
                                                , cod_agendamento_integracao_ag
                                                , cod_motivo_cancelamento)
                                            values(
                                               ${agendamentoOriginal[0].cod_agenda}
                                            , '${converteDataPostgres(agendamentoOriginal[0].data_atend_iten_agend)}'
                                            , '${agendamentoOriginal[0].hora_atend_iten_agen}'
                                            , '${agendamentoOriginal[0].nm_paciente}'
                                            , ${agendamentoOriginal[0].cod_paciente}
                                            , ${agendamentoOriginal[0].cod_convenio}
                                            , ${agendamentoOriginal[0].cod_categoria}
                                            , ${agendamentoOriginal[0].cod_procedimento}
                                            , '${agendamentoOriginal[0].hora_atend_iten_agen}'
                                            , '${agendamentoOriginal[0].duracao_consulta}'
                                            , ${agendamentoOriginal[0].cod_especialidade}
                                            , ${agendamentoOriginal[0].cod_procedencia}
                                            , ${agendamentoOriginal[0].cod_encaminhamento}
                                            , '${converteDataPostgres(agendamentoOriginal[0].data_marcacao)}'
                                            , ${agendamentoOriginal[0].cod_setor}
                                            , ${agendamentoOriginal[0].cod_sala}
                                            , ${agendamentoOriginal[0].cod_cbo}
                                            , '${agendamentoOriginal[0].consulta_retorno}'
                                            , ${agendamentoOriginal[0].meio_agendamento}
                                            , ${agendamentoOriginal[0].fone_paciente || null}
                                            , ${agendamentoOriginal[0].nm_responsavel || null}
                                            , ${agendamentoOriginal[0].cod_grau_parentesco}
                                            , ${agendamentoOriginal[0].fatura_iten_agendado}
                                            , ${agendamentoOriginal[0].cod_grupo_sus}
                                            , ${agendamentoOriginal[0].cod_tipo_sus}
                                            , ${agendamentoOriginal[0].cod_especialidade_sus}
                                            , ${agendamentoOriginal[0].cod_subespecialidade}
                                            , ${agendamentoOriginal[0].em_edicao}
                                            , ${agendamentoOriginal[0].cod_fia}
                                            , ${agendamentoOriginal[0].tratamento}
                                            , ${agendamentoOriginal[0].cod_agendamento_tratamento}
                                            , '${agendamentoOriginal[0].celular_paciente}'
                                            , '${agendamentoOriginal[0].email}'
                                            , ${agendamentoOriginal[0].autorizado_convenio}
                                            , '${converteDataPostgres(agendamentoOriginal[0].data_nasc)}'
                                            , ${agendamentoOriginal[0].nm_medico_solicitante}
                                            , ${agendamentoOriginal[0].cod_prescricao}
                                            , ${agendamentoOriginal[0].cod_agendamento_integracao_ag}
                                            , ${req.params.motivoCancelamento})`)
      res.status(200).json("OK")

    } finally {
      client.release()
    }
  })().catch((e) => {
    console.log(e)
    res.status(417).json({
      error: e
    })
  })
})

router.post('/agendar', ((req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      const {idPaciente,idAgendamento,idConvenio,idCategoria}  = req.body
      const {rows} = await client.query('' +
        'update sigh.agendamentos set cod_paciente = $1, cod_convenio = $3, cod_categoria = $4 where id_agendamento = $2',[parseInt(idPaciente),idAgendamento,idConvenio,idCategoria])
      res.status(200).json(rows)
    } finally {
      client.release()
    }
  })().catch((e) => {
    console.log(e)
    res.status(400).json(e)
  })
}))

module.exports = router
