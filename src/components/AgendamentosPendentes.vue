<template>
  <div class="no-padding">
    <div class="row">
      <div v-if="PendingAppointments.length == 0">
        Nenhum agendamento localizado
      </div>
      <div
        v-else
        class="col-auto q-ma-xs"
        v-for="appointment in PendingAppointments"
        :key="appointment.idAgendamento"
      >
        <q-card class="my-card shadow-2 q-mb-xs" bordered>
          <q-card-section horizontal>
            <q-card-section vertical>
              <div class="row">
                <div class="row col-12 q-mr-xs justify-center">
                  <q-btn style="width: 100%" dense flat color="light-blue-10">{{ appointment.descrProcedimento || appointment.descrEspecialidade || 'Não informado' }}</q-btn>
                </div>
                <div class="col-auto q-mr-xs" v-if="appointment.dtAgendamento">
                  <b>Data:</b> {{ appointment.dtAgendamento }}
                </div>
                <div class="col-auto q-mr-xs" v-if="appointment.hrAgendamento">
                  <b>Hora:</b> {{ appointment.hrAgendamento }}
                </div>
                <div class="col-auto q-mr-xs">
                  <b>Médico(a):</b> {{ appointment.nmPrestador || 'Não informado(a)' }}
                </div>
                <div class="col-auto q-mr-xs">
                  <b>Convênio:</b> {{ appointment.nmConvenio || 'Não informado' }}
                </div>
                <div class="col-auto q-mr-xs">
                  <b>Plano:</b> {{ appointment.nmCategoria || 'Não informado' }}
                </div>
                <div class="col-auto q-mr-xs">
                  <b>Instituição:</b> {{ appointment.nmHospital || 'Não informada' }}
                </div>
                <div class="col-auto q-mr-xs">
                  <b>Logradouro:</b> {{ appointment.logradouro || 'Não informada' }}
                </div>
              </div>
            </q-card-section>

            <q-separator vertical/>

            <q-card-actions vertical class="justify-around">
              <q-checkbox
                v-model="AppointmentsSelecteds"
                :val="appointment"
                color="green"
              />
              <q-btn
                flat
                round
                color="red"
                icon="event_busy"
                @click="OpenDialogCancelAppointment(appointment)"
              />
              <q-btn flat round color="orange-14" icon="update"/>
            </q-card-actions>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialogo de Cancelamento do agendamento -->
    <q-dialog v-model="Show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
          >Tem certeza que deseja cancelar o agendamento do dia
            <b>{{ AppointmentSelectedForCancel.dtAgendamento }}</b>
            as <b>{{ AppointmentSelectedForCancel.hrAgendamento }}</b> ?
          </span>
        </q-card-section>
        <div class="q-mx-lg">
          <q-select
            v-model="SelectedReason"
            :options="Reasons"
            :Loading="Loading"
            :Disable="Disable"
            dense
            label="Selecione o Motivo"
          />
        </div>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Voltar"
            color="primary"
            v-close-popup
            @click="ResetAppontmentsAndReasons"
          />
          <q-btn
            label="Confirmar"
            color="primary"
            v-close-popup
            :disable="DisableButton"
            @click="CancelAppointment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AlertDialog :ShowAlert="ShowAlert" :Position="Position" :BgClass="BgClass" :Message="Message"/>
  </div>
</template>

<script>
export default {
  name: "PedingAppointments",
  components: {AlertDialog: () => import("./AlertDialog")},
  created() {
    this.FindAllAppointments();
  },
  data() {
    return {
      AppointmentsSelecteds: [],
      AppointmentSelectedForCancel: {},
      Appointments: [],
      SelectedReason: null,
      Show: false,
      BgClass: null,
      Loading: false,
      Disable: false,
      Reasons: [],
      ShowAlert: false,
      Position: null,
      Message: null
    };
  },
  computed: {
    PendingAppointments() {
      return this.Appointments;
    },
    DisableButton() {
      if (this.SelectedReason) {
        return false;
      }
      return true;
    }
  },
  watch: {
    AppointmentsSelecteds(newValue) {
      this.$store.commit("appointments/ChangeAppointment", newValue);
    }
  },
  methods: {
    CommitAppointmentLoading(val) {
      this.$store.commit("appointments/ActiveLoading", val);
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
    ResetAppontmentsAndReasons() {
      this.AppointmentSelectedForCancel = [];
      this.SelectedReason = null;
      this.Reasons = [];
    },
    DisableAndLoadingActive() {
      this.Loading = true;
      this.Disable = true;
    },
    DisableAndLoadingInative() {
      this.Loading = false;
      this.Disable = false;
    },
    OpenDialogCancelAppointment(appointment) {
      this.AppointmentSelectedForCancel = appointment;
      this.Show = true;
      this.FindAllReasons();
    },
    async CancelAppointment() {
      try {
        const {status} = await this.$axios.delete(
          `/agendamentos/cancelar/${this.AppointmentSelectedForCancel.idAgendamento}/${this.SelectedReason.value}`
        );
        this.ResetAppontmentsAndReasons();
        this.OpenAlertDialog(
          "bottom",
          "bg-green text-white",
          "Agendamento cancelado com sucesso!"
        );
        await this.FindAllAppointments();
      } catch (error) {
        console.log(error)
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao cancelar o agendamento!"
        );
      }
    },
    async FindAllReasons() {
      try {
        this.DisableAndLoadingActive();
        const {data} = await this.$axios.get(
          "/agendamentos/motivos/Cancelamentos"
        );
        this.Reasons = [...data];
        this.DisableAndLoadingInative();
      } catch (error) {
        console.log(error);
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao buscar os motivos de cancelamentos!"
        );
      }
    },
    async FindAllAppointments() {
      try {
        this.CommitAppointmentLoading(true);
        this.Appointments = [];
        const {data} = await this.$axios.get(
          `/agendamentos/consultaAgendamentos/${localStorage.id}`
        );
        this.Appointments = [...data];
        this.CommitAppointmentLoading(false);
      } catch (error) {
        console.log(error);
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao buscar agendamentos!"
        );
      }
    }
  }
};
</script>
<style scoped>
.my-card {
  width: 100%;
  max-width: 390px;
  min-height: 160px;
  max-height: 300px;
}
</style>
