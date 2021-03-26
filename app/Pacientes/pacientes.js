const e = require('express')
const express = require('express')
const router = express.Router()
const db = require('../dbConnect')

router.get('/perfil/:id', (req, res) => {
  (async () => {
    const client = await db.pool.connect()
    try {
      let Geral = await client.query(
        `
            select
                p.nm_paciente as "nmPaciente"
                , p.apelido as "nmSocial"
                , p.cod_sexo as "sexo"
                , to_char(p.data_nasc, 'DD/MM/YYYY') as "dtNasc"
                , p.mae as "nmMae"
                , p.pai as "nmPai"
                , coalesce(p.fone_res_1, p.fone_res_2) as "telRes"
                , coalesce(p.fone_cel_1, p.fone_cel_2) as "telCel"
            from
                sigh.pacientes p
            where
                p.id_paciente = ${req.params.id}
        `
      )
      let Endereco = await client.query(
        `
            select
                en.numero as "numero"
                , en.complemento as "complemento"
                , en.referencia as "referencia"
                , en.cod_tp_endereco as "codTpEndereco"
                , l.tp_logradouro as "tpLogradouro"
                , l.uf as "uf"
                , l.municipio as "municipio"
                , l.bairro_inicial as "bairroInicial"
                , l.bairro_final as "bairroFinal"
                , l.logradouro as "logradouro"
                , l.cep as "cep"
            from
                sigh.enderecos en
                inner join endereco_sigh.logradouros l on
                l.id_logradouro = en.cod_logradouro
            where
                en.ativo
                and l.ativo 
                and cod_paciente = ${req.params.id}
        `
      )

      let Documentos = await client.query(
        `
            select
                dp.id_doc_paciente as "idDocPaciente"
                , td.id_tp_documento as "idTipoDocPaciente"
                , td.identificacao_documento as "identficacaoDoc"
                , td.nm_tp_documento as "nmDocumento"
                , dp.numero_documento as "numeroDocumento"
            from
                sigh.documentos_pacientes dp
                inner join sigh.tipos_documentos td on
                td.id_tp_documento = dp.cod_tp_documento
            where
                dp.ativo
                and dp.numero_documento is not null
                and dp.cod_paciente = ${req.params.id}
        `
      )

      const retorno = {
        ...Geral.rows[0],
        Endereco: Endereco.rows,
        Documentos: Documentos.rows
      }

      res.status(200).json(retorno)
    } finally {
      client.release()
    }
  })().catch(e => {
    res.status(400).json(e)
  })
})

module.exports = router
