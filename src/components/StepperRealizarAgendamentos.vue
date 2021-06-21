<template>
  <div class="no-padding">
    <q-stepper v-model="step" vertical color="primary" animated class="no-padding">
      <q-step :name="1" title="Selecione os agendamentos" :done="step > 1">
        <FiltroAgendar/>
        <q-stepper-navigation>
          <q-btn @click="step += 1" color="primary" label="Continuar" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Selecione os horários" :done="step > 2">
        etapa 2

        <q-stepper-navigation>
          <q-btn flat @click="step -= 1" color="primary" label="Voltar" class="q-ml-sm" />
          <q-btn @click="step += 1" color="primary" label="Continuar" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="3" title="Confirmar agendamentos" :done="step > 3">
       etapa 3

        <q-stepper-navigation>
          <q-btn flat @click="step -= 1" color="primary" label="Voltar" class="q-ml-sm" />
          <q-btn @click="step += 1" color="primary" label="Continuar" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="4" title="Conclusão" :done="step > 4">
        teste 4
        <q-stepper-navigation>
          <q-btn flat @click="step -= 1" color="primary" label="Voltar" class="q-ml-sm" />
          <q-btn color="primary" label="Concluir" />
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
    FiltroAgendar: () => import('./FiltroAgendar.vue')
  },
  data() {
    return {
      step: 1,
      visible: false
    };
  },
};

</script>
