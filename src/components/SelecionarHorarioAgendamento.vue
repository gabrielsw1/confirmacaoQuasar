<template>
  <div class="row q-col-gutter-sm" style="width: 100%">

    <div class="q-gutter-sm col-6 col-sm-3">
      <q-date class="shadow-3" v-model="DataSelecionada" color="light-blue-9" title="dia" subtitle="Selecione o" today-btn
              :options="Options" @click="SelecionarHorarioAgendamento"></q-date>
    </div>
    <div class="q-gutter-sm col-11 col-sm-9">
      <q-card class="shadow-3">
        <q-card-section class="bg-light-blue-9">
          <div class="text-h6 text-white">Informações do Agendamento</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          Informações Gerais do atendimento
        </q-card-section>
      </q-card>
    </div>


    <q-dialog v-model="Show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Selecione o horário que deseja agendar na data: <b>{{
              DataSelecionada ? DataSelecionada.split('/').reverse().join('/') : 'ERROR'
            }}</b> </span>
        </q-card-section>

        <div class="q-mx-lg">
          <q-select options-dense dense label="Selecione o Horário" :options="Horarios" v-model="HorarioSelecionado"
                    behavior="dialog"/>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Voltar" color="primary" @click="DataSelecionada = null" v-close-popup/>
          <q-btn label="Confirmar" color="primary" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: "SelecionarHorarioAgendamento",
  data() {
    return {
      DataSelecionada: '',
      Options: [],
      Show: false,
      Filtro: null,
      Horarios: null,
      HorarioSelecionado: null
    }
  },
  mounted() {
    this.Filtro = this.$store.getters['agendar/BuscarFiltrosAgendarHorarios']
    this.BuscarDatasAgendas(this.Filtro.tipoItemAgendamento, this.Filtro.idItemAgendamento, this.Filtro.idConvenio, this.Filtro.idMedico)
  },
  watch: {
    DataSelecionada(val) {
      console.log(val)
    }
  },
  methods: {
    async SelecionarHorarioAgendamento() {
      if (this.DataSelecionada) {
        this.Show = true
        const {data} = await this.$axios.get(`/agendamentos/agendas/${this.Filtro.tipoItemAgendamento}/${this.Filtro.idItemAgendamento}/${this.Filtro.idConvenio}/${this.Filtro.idMedico || 0}/?data=${this.DataSelecionada.replaceAll('/', '-')}`
        );
        this.Horarios = data
      }
    },
    async BuscarDatasAgendas(tipo, idItemAgendamento, idConvenio, idMedico) {
      try {
        const Medico = idMedico || 0
        this.LoadingConv = true
        const {data} = await this.$axios.get(
          `/agendamentos/agendas/${tipo}/${idItemAgendamento}/${idConvenio}/${Medico}`
        );
        data.map(e => {
          this.Options.push(e.dtAgenda.replaceAll('-', '/').replace('/T(.)*Z', ''))
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style scoped>

</style>
