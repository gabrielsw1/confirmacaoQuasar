<template>
  <div class="no-padding">
    <q-stepper v-model="step" vertical color="primary" animated class="no-padding">
      <q-step :name="1" title="O que deseja agendar?" :done="step > 1">

        <FiltroAgendar/>

        <q-stepper-navigation>
          <q-btn @click="step += 1" color="primary" label="Continuar"
                 :disable="this.$store.getters['agendar/HabilitarEtapaUmAgendamento']"/>
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Selecione um horário" :done="step > 2">

        <SelecionarHorarioAgendamento/>

        <q-stepper-navigation>
          <q-btn flat @click="step -= 1" color="primary" label="Voltar" class="q-ml-sm"/>
          <q-btn @click="Agendar" color="primary" label="Agendar"
                 :disable="this.$store.getters['agendar/HabilitarBotaoAgendar']"/>
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <AlertDialog :ShowAlert="ShowAlert" :Position="Position" :BgClass="BgClass" :Message="Message"/>

    <q-inner-loading :showing="this.$store.getters['agendar/HabilitarLoading']">
      <q-spinner-facebook size="85px" color="primary"/>
    </q-inner-loading>
  </div>
</template>

<script>
export default {
  name: "Agendar",
  components: {
    FiltroAgendar: () => import('./FiltroAgendar.vue'),
    SelecionarHorarioAgendamento: () => import('./SelecionarHorarioAgendamento'),
    AlertDialog: () => import("./AlertDialog")
  },
  data() {
    return {
      step: 1,
      visible: false,
      Position: null,
      BgClass: null,
      Message: null,
      ShowAlert: null
    };
  },
  methods: {
    async Agendar() {
      const idPaciente = localStorage.id
      const idAgendamento = this.$store.getters['agendar/BuscarIdAgendamentoSelecionado']
      const idConvenio = this.$store.getters['agendar/BuscarFiltrosAgendarHorarios'].idConvenio
      const idCategoria = this.$store.getters['agendar/BuscarFiltrosAgendarHorarios'].idCategoria

      try {
        this.$store.commit('agendar/AtivarLoading', true)
        this.$store.dispatch('/agendar/AtivarLoading', true)
        const {data} = await this.$axios.post(
          `/agendamentos/agendar`, {idPaciente, idAgendamento, idConvenio, idCategoria}
        );
        this.$store.commit('agendar/AtivarLoading', false)
        this.OpenAlertDialog(
          "bottom",
          "bg-green text-white",
          "Agendamento realizado com sucesso!"
        );
      } catch (e) {
        console.log(e)
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao tentar realizar agendamento!"
        );
      }
    },
    OpenAlertDialog(position, bgclass, message) {
      this.Position = position;
      this.BgClass = bgclass;
      this.Message = message;
      this.ShowAlert = true;
      setTimeout(() => {
        this.ShowAlert = false;
        this.$router.go(0)
      }, 2000);
    },
  },

};

</script>
