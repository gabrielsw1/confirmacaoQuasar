<template>
  <div class="no-padding">
    <q-stepper v-model="step" vertical color="primary" animated class="no-padding">
      <q-step :name="1" title="Selecione o Agendamento" :done="step > 1">
        <PendingAppointments />

        <q-stepper-navigation>
          <q-btn @click="step += 1" color="primary" label="Continuar" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Confirmação do Agendamento" :done="step > 2">
        <ConfirmAppointments />

        <q-stepper-navigation>
          <q-btn flat @click="step -= 1" color="primary" label="Voltar" class="q-ml-sm" />
          <q-btn @click="step += 1" color="primary" label="Continuar" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="3" title="Confirmação dos Dados Pessoais" :done="step > 3">
        <PersonalData />

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

    <q-inner-loading :showing="ActiveLoading">
      <q-spinner-facebook size="85px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
  export default {
    name: "StepperAppointments",
    components: {
      PendingAppointments: () => import("./AgendamentosPendentes"),
      ConfirmAppointments: () => import("./ConfirmarAgendamentos"),
      PersonalData: () => import("./DadosPessoais")
    },
    data() {
      return {
        step: 1,
        visible: false
      };
    },
    computed: {
      ActiveLoading() {
        return this.$store.state.appointments.loading;
      }
    }
  };

</script>
