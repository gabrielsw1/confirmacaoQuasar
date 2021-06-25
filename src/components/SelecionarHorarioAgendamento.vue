<template>
  <div class="row q-col-gutter-sm" style="width: 100%">

    <div class="q-gutter-sm col-auto col-sm-3">
      <q-date class="shadow-3" v-model="DataSelecionada" color="light-blue-9" subtitle="Selecione o dia" today-btn
              :options="Options" @click="SelecionarHorarioAgendamento"></q-date>
    </div>
    <div class="q-gutter-sm col-auto col-sm-9" v-if="HorarioSelecionado">
      <q-card class="shadow-3">
        <q-card-section class="bg-light-blue-9">
          <div class="text-h6 text-white">Informações do Agendamento</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="row q-col-gutter-sm" style="width: 100%">
            <div class="col-12 col-sm-2">
              <q-input disable outlined standout="bg-blue text-white" dense label="Data" v-model="HorarioSelecionado.dtAgendamento" />
            </div>
            <div class="col-12 col-sm-5">
              <q-select options-dense dense standout="bg-blue text-white" label="Selecione o Horário" :options="Horarios" v-model="HorarioSelecionado"
                        behavior="dialog"/>
            </div>
            <div class="col-12 col-sm-5">
              <q-input disable outlined standout="bg-blue text-white" dense label="Descrição" v-model="HorarioSelecionado.itemAgendamento" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input disable outlined standout="bg-blue text-white" dense label="Médico" v-model="HorarioSelecionado.nmPrestador" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input disable outlined standout="bg-blue text-white" dense label="Instituição" v-model="HorarioSelecionado.hospital" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input disable outlined standout="bg-blue text-white" dense label="Endereço" v-model="HorarioSelecionado.logradouro" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input disable outlined standout="bg-blue text-white" dense label="Bairro" v-model="HorarioSelecionado.bairro" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input disable outlined standout="bg-blue text-white" dense label="Cidade" v-model="HorarioSelecionado.cidade" />
            </div>
            <div class="col-12 col-sm-12">
              <q-input outlined  dense label="Orientações" type="textarea" v-model="HorarioSelecionado.orientacao"/>
            </div>
          </div>
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
                    behavior="dialog"     />
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
