export function BuscarFiltrosAgendarHorarios(state) {
  return {
    tipoItemAgendamento: state.tipoItemAgendamento,
    idItemAgendamento: state.idItemAgendamento,
    idConvenio: state.idConvenio,
    idCategoria: state.idCategoria,
    idMedico: state.idMedico
  }
}

export function HabilitarEtapaUmAgendamento(state) {
  return state.idConvenio && state.idCategoria ? false : true;
}

export function HabilitarBotaoAgendar(state) {
  return state.idHorarioAgendar ? false : true;
}

export function BuscarIdAgendamentoSelecionado(state) {
  return state.idHorarioAgendar
}


