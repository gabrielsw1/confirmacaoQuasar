const express = require('express')
const router = express.Router()
const db = require('../dbConnect')
const nodemailer = require("nodemailer");


async function main(object, html) {

  let {
    subject,
    text,
    to,
  } = object
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: 'gabriel.luz@mv.com.br',
      pass: 'Matriz@2022',
    },
  });

  let info = await transporter.sendMail({
    from: `"Gabriel Moreno da Luz" <gabriel.luz@mv.com.br>`,
    to: `${to}`,
    subject,
    text,
    html,
  });

  console.log("Message sent: %s", info.messageId);
}

router.get('/consultaAgendamentos/:id', (req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      const agendamentos = await client.query(
        `SELECT agend.id_agendamento                               AS "idAgendamento",
                                 p.id_paciente                                      AS "idPaciente",
                                 p.nm_paciente                                      AS "nmPaciente",
                                 TO_CHAR(agend.data_atend_iten_agend, 'DD/MM/YYYY') AS "dtAgendamento",
                                 TO_CHAR(agend.hora_atend_iten_agen, 'HH24:MI')       AS "hrAgendamento",
                                 (case ta.tipo_agendamento
                                      when 2 then 'consulta'
                                      when 3 then 'exame'
                                     end)                                           AS "tipo",
                                 (case ta.tipo_agendamento
                                      when 2 then esp.id_esp_principal
                                      when 3 then proc.id_procedimento
                                     end)                                           AS "idItemAgendamento",
                                 (case ta.tipo_agendamento
                                      when 2 then esp.nm_especialidade
                                      when 3 then proc.descr_red_proc
                                     end)                                           AS "descrItemAgendamento",
                                 proc.descr_red_proc                                AS "descrProcedimento",
                                 esp.nm_especialidade                               AS "descrEspecialidade",
                                 agend.obs_resp_pag                                 AS "observacaoAgendamento",
                                 conv.id_convenio                                   AS "idConvenio",
                                 conv.nm_fantasia                                   AS "nmConvenio",
                                 cat.nm_categoria                                   AS "nmCategoria",
                                 prest.nm_prestador                                 AS "nmPrestador",
                                 prest.id_prestador                                 AS "idPrestador",
                                 h.nome                                             AS "nmHospital",
                                 l.logradouro || ', ' || h.numero                   AS "logradouro"
                          FROM sigh.agendas ag
                                   LEFT JOIN sigh.agendamentos agend ON
                              agend.cod_agenda = ag.id_agenda
                                   LEFT JOIN sigh.tipos_agendamentos ta ON
                              ta.id_tp_agendamento = ag.cod_tp_agendamento
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
                    AND cod_motivo_cancelamento is null`, [req.params.id]) //nao esquecer de mudar o left do procedimento para INNER
      res.status(200).json(agendamentos.rows)
    } finally {
      client.release()
    }
  })().catch((e) => {
    res.status(400).json(e)
  })

})

router.get('/pendentes/total/:id', (req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      const agendamentos = await client.query(
        `SELECT
                    count(*) as "totalAgendamentosPendentes"
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
                    AND cod_motivo_cancelamento is null`, [req.params.id]) //nao esquecer de mudar o left do procedimento para INNER
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

      const {rows} = await client.query(`select
                                                                 coalesce(h.nome_reduzido, h.nome)                                  as "clinica",
                                                                 p.email                                                            as "to",
                                                                 'Agendamento Cancelado'                                            as "subject",
                                                                 'Agendamento Cancelado'                                            as "text",
                                                                 p.nm_paciente                                                      as "paciente",
                                                                 (l.tp_logradouro || ' ' || l.logradouro || ', ' || h.numero || ' - ' || l.bairro_inicial || ' - ' ||l.municipio) as "endereco",
                                                                 (case tpagend.tipo_agendamento
                                                                      when 2 then esp.nm_especialidade
                                                                      when 3 then proc.descr_red_proc
                                                                     end)                                                           as "itemAgendamento",
                                                                 conv.nm_fantasia                                                   as "convenio",
                                                                 coalesce(prest.nome_reduzido, prest.nm_prestador,'não informado')  as "medico",
                                                                 TO_CHAR(agend.data_atend_iten_agend, 'DD/MM/YYYY') AS "data",
                                                                 TO_CHAR(agend.hora_atend_iten_agen, 'HH24:MI')     AS "hora"
                                                          from sigh.agendamentos agend
                                                                   inner join sigh.agendas ag on (ag.id_agenda = agend.cod_agenda)
                                                                   left join sigh.hospitais h on (h.id_hospital = agend.cod_hospital)
                                                                   left join sigh.convenios conv on (conv.id_convenio = agend.cod_convenio)
                                                                   left join sigh.pacientes p on (p.id_paciente = agend.cod_paciente)
                                                                   left join sigh.prestadores prest on (prest.id_prestador = agend.cod_medico)
                                                                   left join sigh.tipos_agendamentos tpagend on (tpagend.id_tp_agendamento = ag.cod_tp_agendamento)
                                                                   left join sigh.procedimentos proc on (proc.id_procedimento = ag.cod_exame)
                                                                   left join endereco_sigh.logradouros l on (l.id_logradouro = h.cod_logradouro)
                                                                   left join sigh.especialidades_principais esp
                                                                             on (esp.id_esp_principal = ag.cod_especialidade)
                                                          where agend.id_agendamento = $1`, [req.params.idHorario])

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

      const motivo = await client.query(`select
                                                descr_motivo_cancelamento  as "motivo"
                                            from sigh.motivos_cancelamentos
                                            where
                                            id_motivo_cancelamento = $1`, [req.params.motivoCancelamento])

      const html = `<body>
                      <div style="box-shadow: #9e9e9e 1px 1px 12px;
                              padding: 10px;
                              width: 100%;
                              border-radius: 5px;
                              display: flex;
                              flex-direction: column;
                              justify-content: center;
                              align-items: center;
                              max-width: 400px;
                              font-family: 'Calibri Light'">
                      <div style="text-align: center;
                              width: 100%;
                              flex-direction: column">
                      <div style="width: 100%;">
                          <p style="font-size: 24px; color: #1976D2; margin-bottom: 0px;"><b>${rows[0].clinica}</b></p>
                      </div>
                      <div style="width: 100%;">
                          <p style="margin-top: 0px; width: 100%;">${rows[0].endereco}</p>
                      </div>
                      <div style="width: 100%;">
                          <p style="font-size: 18px; margin-top: 5px; color: #D32F2F; width: 100%;"><b>${rows[0].subject}</b></p>
                      </div>
                  </div>
                  <div style="width: 100%;">
                      <p> Olá <b>${rows[0].paciente}</b> , está é sua confirmação de cancelamento na <b>${rows[0].clinica}</p>
                      <p><b>Item Cancelado: </b>${rows[0].itemAgendamento} </p>
                      <p><b>Motivo: </b>${motivo.rows[0].motivo} </p>
                      <p><b>Data: </b>${rows[0].data}</p>
                      <p><b>Hora: </b>${rows[0].hora}</p>
                  </div>

              </div>
              </body>`
      main(rows[0], html).catch(console.error)
      res.status(200).json("OK")

    } finally {
      client.release()
    }
  })().catch((e) => {
    res.status(417).json({
      error: e
    })
  })
})

router.post('/agendar', ((req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      const {idPaciente, idAgendamento, idConvenio, idCategoria} = req.body
      await client.query('' +
        `update sigh.agendamentos
         set cod_paciente = $1,
         cod_convenio = $3,
         cod_categoria = $4
         where id_agendamento = $2`,
        [parseInt(idPaciente), idAgendamento, idConvenio, idCategoria])

      const {rows} = await client.query(`select
                                                                 coalesce(h.nome_reduzido, h.nome)                                  as "clinica",
                                                                 p.email                                                            as "to",
                                                                 'Agendamento Realizado'                                            as "subject",
                                                                 'Agendamento Realizado'                                            as "text",
                                                                 p.nm_paciente                                                      as "paciente",
                                                                 (l.tp_logradouro || ' ' || l.logradouro || ', ' || h.numero || ' - ' || l.bairro_inicial || ' - ' ||
                                                                  l.municipio)                                                      as "endereco",
                                                                 (case tpagend.tipo_agendamento
                                                                      when 2 then esp.nm_especialidade
                                                                      when 3 then proc.descr_red_proc
                                                                     end)                                                           as "itemAgendamento",
                                                                 conv.nm_fantasia                                                   as "convenio",
                                                                 coalesce(prest.nome_reduzido, prest.nm_prestador,'não informado')  as "medico",
                                                                 TO_CHAR(agend.data_atend_iten_agend, 'DD/MM/YYYY') AS "data",
                                                                 TO_CHAR(agend.hora_atend_iten_agen, 'HH24:MI')     AS "hora",
                                                                 coalesce(orientacoes_internacao,'Não possui preparo')             as "preparo"
                                                          from sigh.agendamentos agend
                                                                   inner join sigh.agendas ag on (ag.id_agenda = agend.cod_agenda)
                                                                   left join sigh.hospitais h on (h.id_hospital = agend.cod_hospital)
                                                                   left join sigh.convenios conv on (conv.id_convenio = agend.cod_convenio)
                                                                   left join sigh.pacientes p on (p.id_paciente = agend.cod_paciente)
                                                                   left join sigh.prestadores prest on (prest.id_prestador = agend.cod_medico)
                                                                   left join sigh.tipos_agendamentos tpagend on (tpagend.id_tp_agendamento = ag.cod_tp_agendamento)
                                                                   left join sigh.procedimentos proc on (proc.id_procedimento = ag.cod_exame)
                                                                   left join endereco_sigh.logradouros l on (l.id_logradouro = h.cod_logradouro)
                                                                   left join sigh.especialidades_principais esp
                                                                             on (esp.id_esp_principal = ag.cod_especialidade)
                                                          where agend.id_agendamento = $1`, [idAgendamento])


      const html = `<body>
                      <div style="box-shadow: #9e9e9e 1px 1px 12px;
                              padding: 10px;
                              width: 100%;
                              border-radius: 5px;
                              display: flex;
                              flex-direction: column;
                              justify-content: center;
                              align-items: center;
                              max-width: 400px;
                              font-family: 'Calibri Light'">
                      <div style="text-align: center;
                              width: 100%;
                              flex-direction: column">
                      <div style="width: 100%;">
                          <p style="font-size: 24px; color: #1976D2; margin-bottom: 0px;"><b>${rows[0].clinica}</b></p>
                      </div>
                      <div style="width: 100%;">
                          <p style="margin-top: 0px; width: 100%;">${rows[0].endereco}</p>
                      </div>
                      <div style="width: 100%;">
                          <p style="font-size: 18px; margin-top: 5px; color: #66BB6A; width: 100%;"><b>${rows[0].subject}</b></p>
                      </div>
                  </div>
                  <div style="width: 100%;">
                      <p> Olá <b>${rows[0].paciente}</b> , está é sua confirmação de agendamento na <b>${rows[0].clinica}</b>, realizado para o convênio <b>${rows[0].convenio}</b></p>
                      <p><b>Item Agendado: </b>${rows[0].itemAgendamento}
                      <p><b>Médico: </b>${rows[0].medico}
                      <p><b>Data: </b>${rows[0].data}
                      <p><b>Hora: </b>${rows[0].hora}
                      <p><b>Preparo: </b>${rows[0].preparo}
                  </div>

              </div>
              </body>`
      main(rows[0], html).catch(console.error)

      res.status(200).json(rows)
    } finally {
      client.release()
    }
  })().catch((e) => {
    console.log(e)
    res.status(400).json(e)
  })
}))

router.post('/transferir', ((req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      console.log(req.body)
      const {idAgendamentoOrigem, idAgendamentoDestino} = req.body
      const horaAtendimentoDestino = await client.query(
        `SELECT
                            hora_atend_iten_agen,
                            cod_agenda
                         FROM sigh.agendamentos
                         WHERE id_agendamento = $1`, [idAgendamentoDestino])

      await client.query(
        `SELECT sigh.f_transf_agendamento(
                            ${idAgendamentoOrigem},
                            ${idAgendamentoDestino},
                            ${horaAtendimentoDestino.rows[0].cod_agenda},
                            '${horaAtendimentoDestino.rows[0].hora_atend_iten_agen}',4,1,'N')`)

      const {rows} = await client.query(`select
                                                                 coalesce(h.nome_reduzido, h.nome)                                  as "clinica",
                                                                 p.email                                                            as "to",
                                                                 'Agendamento Transferido'                                          as "subject",
                                                                 'Agendamento Transferido'                                          as "text",
                                                                 p.nm_paciente                                                      as "paciente",
                                                                 (l.tp_logradouro || ' ' || l.logradouro || ', ' || h.numero || ' - ' || l.bairro_inicial || ' - ' ||
                                                                  l.municipio)                                                      as "endereco",
                                                                 (case tpagend.tipo_agendamento
                                                                      when 2 then esp.nm_especialidade
                                                                      when 3 then proc.descr_red_proc
                                                                     end)                                                           as "itemAgendamento",
                                                                 conv.nm_fantasia                                                   as "convenio",
                                                                 coalesce(prest.nome_reduzido, prest.nm_prestador,'não informado')  as "medico",
                                                                 TO_CHAR(agend.data_atend_iten_agend, 'DD/MM/YYYY') AS "data",
                                                                 TO_CHAR(agend.hora_atend_iten_agen, 'HH24:MI')     AS "hora",
                                                                 coalesce(orientacoes_internacao,'Não possui preparo')             as "preparo"
                                                          from sigh.agendamentos agend
                                                                   inner join sigh.agendas ag on (ag.id_agenda = agend.cod_agenda)
                                                                   left join sigh.hospitais h on (h.id_hospital = agend.cod_hospital)
                                                                   left join sigh.convenios conv on (conv.id_convenio = agend.cod_convenio)
                                                                   left join sigh.pacientes p on (p.id_paciente = agend.cod_paciente)
                                                                   left join sigh.prestadores prest on (prest.id_prestador = agend.cod_medico)
                                                                   left join sigh.tipos_agendamentos tpagend on (tpagend.id_tp_agendamento = ag.cod_tp_agendamento)
                                                                   left join sigh.procedimentos proc on (proc.id_procedimento = ag.cod_exame)
                                                                   left join endereco_sigh.logradouros l on (l.id_logradouro = h.cod_logradouro)
                                                                   left join sigh.especialidades_principais esp
                                                                             on (esp.id_esp_principal = ag.cod_especialidade)
                                                          where agend.id_agendamento = $1`, [idAgendamentoDestino])

      const html = `<body>
                      <div style="box-shadow: #9e9e9e 1px 1px 12px;
                              padding: 10px;
                              width: 100%;
                              border-radius: 5px;
                              display: flex;
                              flex-direction: column;
                              justify-content: center;
                              align-items: center;
                              max-width: 400px;
                              font-family: 'Calibri Light'">
                      <div style="text-align: center;
                              width: 100%;
                              flex-direction: column">
                      <div style="width: 100%;">
                          <p style="font-size: 24px; color: #1976D2; margin-bottom: 0px;"><b>${rows[0].clinica}</b></p>
                      </div>
                      <div style="width: 100%;">
                          <p style="margin-top: 0px; width: 100%;">${rows[0].endereco}</p>
                      </div>
                      <div style="width: 100%;">
                          <p style="font-size: 18px; margin-top: 5px; color: #66BB6A; width: 100%;"><b>${rows[0].subject}</b></p>
                      </div>
                  </div>
                  <div style="width: 100%;">
                      <p> Olá <b>${rows[0].paciente}</b> , está é sua confirmação de transferencia de agendamento na <b>${rows[0].clinica}</b>, realizado para o convênio <b>${rows[0].convenio}</b></p>
                      <p><b>Item Agendado: </b>${rows[0].itemAgendamento}
                      <p><b>Médico: </b>${rows[0].medico}
                      <p><b>Data: </b>${rows[0].data}
                      <p><b>Hora: </b>${rows[0].hora}
                      <p><b>Preparo: </b>${rows[0].preparo}
                  </div>
              </div>
              </body>`
      main(rows[0], html).catch(console.error)

      res.status(200).json('ok')
    } finally {
      client.release()
    }
  })().catch((e) => {
    console.log(e)
    res.status(400).json(e)
  })
}))

module.exports = router




