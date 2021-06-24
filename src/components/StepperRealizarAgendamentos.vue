<template>
  <div class="no-padding">
    <q-stepper v-model="step" vertical color="primary" animated class="no-padding">
      <q-step :name="1" title="Selecione o que deseja agendar" :done="step > 1">
        <FiltroAgendar/>
        <q-stepper-navigation>
          <q-btn @click="step += 1" color="primary" label="Continuar" :disable="this.$store.getters['agendar/HabilitarEtapaUmAgendamento']"/>
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Selecione os horários" :done="step > 2">
            <SelecionarHorarioAgendamento/>

        <q-stepper-navigation>
          <q-btn flat @click="step -= 1" color="primary" label="Voltar" class="q-ml-sm" />
          <q-btn @click="step += 1" color="primary" label="Agendar" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <q-inner-loading :showing="false">
      <q-spinner-facebook size="85px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
export default {
  name: "Agendar",
  components: {
    FiltroAgendar: () => import('./FiltroAgendar.vue'),
    SelecionarHorarioAgendamento: () => import('./SelecionarHorarioAgendamento')
  },
  data() {
    return {
      step: 1,
      visible: false
    };
  },
};

</script>
