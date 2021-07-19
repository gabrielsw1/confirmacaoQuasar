<template>
  <div class="row q-col-gutter-sm" style="width: 100%">

    <div v-if="$q.screen.md" class="q-gutter-sm col-auto col-sm-3">
      <q-date class="shadow-3" v-model="DataSelecionada" color="light-blue-9"
              :subtitle="'Primeiro dia disponível: ' + Options[0].split('/').reverse().join('/')" today-btn
              :options="Options"></q-date>
    </div>
    <!-- Calendario -->
    <div v-else class="col-12 col-sm-3">
      <q-input dense v-model="DataSelecionada" readonly>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer" color="light-blue-9">
            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
              <q-date  landscape v-model="DataSelecionada" color="light-blue-9"
                      :subtitle="'Primeiro dia disponível: ' + Options[0].split('/').reverse().join('/')"
                      :options="Options" mask="DD/MM/YYYY">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Fechar" color="primary" flat/>
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div class="q-gutter-sm col-auto col-sm-9" v-if="HorarioConfirmado">
      <q-card class="shadow-3">
        <q-card-section class="bg-light-blue-9">
          <div class="text-h6 text-white">Informações do Agendamento</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="row q-col-gutter-sm" style="width: 100%">
            <div class="col-12 col-sm-2">
              <q-input readonly outlined standout="bg-blue text-white" dense label="Data"
                       v-model="HorarioConfirmado.dtAgendamento"/>
            </div>
            <div class="col-12 col-sm-5">
              <q-btn style="width: 100%" text-color="primary" :label="'Horário: ' + HorarioConfirmado.label"
                     @click="SelecionarHorarioAgendamento" icon="schedule">
              </q-btn>
            </div>
            <div class="col-12 col-sm-5">
              <q-input readonly outlined standout="bg-blue text-white" dense label="Descrição"
                       v-model="HorarioConfirmado.itemAgendamento"/>
            </div>
            <div class="col-12 col-sm-4">
              <q-input readonly outlined standout="bg-blue text-white" dense label="Médico"
                       v-model="HorarioConfirmado.nmPrestador"/>
            </div>
            <div class="col-12 col-sm-4">
              <q-input readonly outlined standout="bg-blue text-white" dense label="Instituição"
                       v-model="HorarioConfirmado.hospital"/>
            </div>
            <div class="col-12 col-sm-4">
              <q-input readonly outlined standout="bg-blue text-white" dense label="Endereço"
                       v-model="HorarioConfirmado.logradouro"/>
            </div>
            <div class="col-12 col-sm-4">
              <q-input readonly outlined standout="bg-blue text-white" dense label="Bairro"
                       v-model="HorarioConfirmado.bairro"/>
            </div>
            <div class="col-12 col-sm-4">
              <q-input readonly outlined standout="bg-blue text-white" dense label="Cidade"
                       v-model="HorarioConfirmado.cidade"/>
            </div>
            <div class="col-12 col-sm-12">
              <q-input readonly outlined dense label="Orientações" type="textarea"
                       v-model="HorarioConfirmado.orientacao"/>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>


    <q-dialog v-model="Show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Selecione o horário que deseja agendar na data:
            <b>{{ DataSelecionada ? DataSelecionada.split('/').reverse().join('/') : 'ERROR' }}</b> </span>
        </q-card-section>

        <div class="q-mx-lg">
          <q-select options-dense dense label="Selecione o Horário" :options="Horarios" v-model="HorarioSelecionado"
                    behavior="dialog"/>
        </div>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="primary" v-close-popup/>
          <q-btn label="Confirmar" color="primary" v-close-popup :disabled="!HorarioSelecionado"
                 @click="HorarioConfirmado = HorarioSelecionado"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="ShowAlert" :position="Position">
      <q-card :class="BgClass">
        <q-card-section>
          <span>{{ Message }}</span>
        </q-card-section>
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
      HorarioSelecionado: null,
      HorarioConfirmado: null,
      Loading: false,
      Position: null,
      BgClass: null,
      Message: null,
      ShowAlert: false
    }
  },
  mounted() {
    this.$store.commit('agendar/AlterarHorarioSelecionado', null)
    this.Filtro = this.$store.getters['agendar/BuscarFiltrosAgendarHorarios']
    this.BuscarDatasAgendas(this.Filtro.tipoItemAgendamento, this.Filtro.idItemAgendamento, this.Filtro.idConvenio, this.Filtro.idMedico)
  },
  watch: {
    HorarioConfirmado(val) {
      val ? this.$store.commit('agendar/AlterarHorarioSelecionado', val.value) : this.$store.commit('agendar/AlterarHorarioSelecionado', null)
    },
    DataSelecionada(val) {
      if (val) {
        this.SelecionarHorarioAgendamento()
      } else {
        this.HorarioSelecionado = null
        this.HorarioConfirmado = null
      }
    }
  },
  methods: {
    AtivarLoading(boolean) {
      this.$store.commit('global/AtivarLoading', boolean)
    },
    async SelecionarHorarioAgendamento() {
      if (this.DataSelecionada) {
        this.Show = true
        this.AtivarLoading(true)
        const {data} = await this.$axios.get(`/agendamentos/agendas/${this.Filtro.tipoItemAgendamento}/${this.Filtro.idItemAgendamento}/${this.Filtro.idConvenio}/${this.Filtro.idMedico || 0}/?data=${this.DataSelecionada.replaceAll('/', '-')}`);
        this.Horarios = data
        this.AtivarLoading(false)
        this.HorarioSelecionado = null
      }
    },
    async BuscarDatasAgendas(tipo, idItemAgendamento, idConvenio, idMedico) {
      try {
        this.AtivarLoading(true)
        const Medico = idMedico || 0
        this.LoadingConv = true
        const {data} = await this.$axios.get(`/agendamentos/agendas/${tipo}/${idItemAgendamento}/${idConvenio}/${Medico}`);
        data.map(e => {
          this.Options.push(e.dtAgenda.replaceAll('-', '/').replace('/T(.)*Z', ''))
        })
        this.AtivarLoading(false)

      } catch (e) {
        console.log(e)
      }
    },
    OpenAlertDialog(position, bgclass, message) {
      this.Position = position;
      this.BgClass = bgclass;
      this.Message = message;
      this.ShowAlert = true;
      setTimeout(() => {
        this.ShowAlert = false;
      }, 2000);
    },
  }
}
</script>

<style scoped>

</style>
