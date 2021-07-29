<template>
  <div class="no-padding">
    <fieldset v-if="$q.platform.is.mobile"
              style="padding: 2px; margin-bottom: 4px; border: 1px solid lightgrey; border-radius: 3px">
      <legend style="padding-left: 5px; padding-right: 10px; color: #0d47a1">Legenda</legend>
      <div style="text-align: center">
        <q-badge color="grey-4">
          <q-icon name="check_box" color="green" size="1.3rem"/>
          <span class="text-black">Selecionar</span>
        </q-badge>
        <q-badge color="grey-4" class="q-ml-sm">
          <q-icon name="event_busy" color="red" size="1.3rem"/>
          <span class="text-black">Cancelar</span>
        </q-badge>
        <q-badge color="grey-4" class="q-ml-sm">
          <q-icon name="update" color="orange-14" size="1.3rem"/>
          <span class="text-black">Transferir</span>
        </q-badge>
      </div>
    </fieldset>

    <div class="row">
      <div v-if="PendingAppointments.length === 0" class="col align-center">
        <q-banner dense class="bg-grey-3">
          <template v-slot:avatar>
            <q-icon name="sentiment_very_dissatisfied" color="primary"/>
          </template>
          Você não possui nenhum agendamento para ser confirmado. Para realizar um agendamento clique
          <q-btn dense flat color="primary" label="Aqui!" to="/agendar"/>
        </q-banner>
      </div>
      <div v-else class="col-auto q-ma-xs" v-for="appointment in PendingAppointments" :key="appointment.idAgendamento">
        <q-card class="my-card shadow-2 q-mb-xs" bordered>
          <q-card-section horizontal>
            <q-card-section vertical>
              <div class="row">
                <div class="row col-12 q-mr-xs justify-center">
                  <span class="text-light-blue-9 text-bold">
                    {{ appointment.descrItemAgendamento || 'Não informado' }}
                  </span>
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
              <q-checkbox v-model="AppointmentsSelecteds" :val="appointment" color="green"/>
              <q-btn flat round color="red" icon="event_busy" @click="OpenDialogCancelAppointment(appointment)">
                <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
                  <strong>Cancelar o agendamento</strong>
                </q-tooltip>
              </q-btn>
              <q-btn flat round color="orange-14" icon="update" @click="AbrirDlgTranferenciaAgendamento(appointment)">
                <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
                  <strong>Transferir o agendamento</strong>
                </q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialogo de Cancelamento do agendamento -->
    <q-dialog v-model="Show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Tem certeza que deseja cancelar o agendamento do dia<b>{{
              AppointmentSelectedForCancel.dtAgendamento
            }}</b>as <b>{{ AppointmentSelectedForCancel.hrAgendamento }}</b> ?
          </span>
        </q-card-section>
        <div class="q-mx-lg">
          <q-select v-model="SelectedReason" :options="Reasons" :Loading="Loading" :Disable="Disable" dense
                    label="Selecione o Motivo"/>
        </div>
        <q-card-actions align="right">
          <q-btn flat label="Voltar" color="primary" v-close-popup @click="ResetAppontmentsAndReasons"/>
          <q-btn label="Confirmar" color="primary" v-close-popup :disable="DisableButton" @click="CancelAppointment"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo de transferencia do agendamento -->
    <q-dialog v-model="ShowDlgTranferencia" persistent>
      <q-card style="width: 100%">
        <q-card-section class="row items-center">
          <SelecionarHorarioAgendamento :transferencia="true"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Voltar" color="primary" v-close-popup/>
          <q-btn label="Transferir" @click="Transferir" color="primary" v-close-popup
                 :disable="this.$store.getters['agendar/HabilitarBotaoAgendar']"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AlertDialog
      :ShowAlert="ShowAlert"
      :Position="Position"
      :BgClass="BgClass"
      :Message="Message"/>
  </div>

</template>

<script>
export default {
  name: "PedingAppointments",
  components: {
    AlertDialog: () => import("./AlertDialog"),
    SelecionarHorarioAgendamento: () => import('./SelecionarHorarioAgendamento')
  },
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
      Message: null,
      ShowDlgTranferencia: false,
      idAgendamentoTranferencia: null
    };
  },
  computed: {
    PendingAppointments() {
      return this.Appointments;
    },
    DisableButton() {
      return !this.SelectedReason;
    }
  },
  watch: {
    AppointmentsSelecteds(val) {
      this.$store.commit("appointments/ChangeAppointment", val);
    }
  },
  methods: {
    AtivarLoading(boolean) {
      this.$store.commit('global/AtivarLoading', boolean)
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
    AbrirDlgTranferenciaAgendamento(appointment) {
      this.idAgendamentoTranferencia = appointment.idAgendamento
      this.$store.commit('agendar/AlterarTipoItemAgendamento', appointment.tipo)
      this.$store.commit('agendar/AlteraridItemAgendamento', appointment.idItemAgendamento)
      this.$store.commit('agendar/AlterarConvenio', appointment.idConvenio)
      this.$store.commit('agendar/AlterarMedico', appointment.idPrestador || null)
      this.ShowDlgTranferencia = true
    },
    async Transferir() {
      this.AtivarLoading(true)
      const idAgendamentoOrigem = this.idAgendamentoTranferencia
      const idAgendamentoDestino = this.$store.getters['agendar/BuscarIdAgendamentoSelecionado']
      try {
        await this.$axios.post("/agendamentoOnline/agendamentos/transferir", {idAgendamentoOrigem, idAgendamentoDestino});
        this.OpenAlertDialog(
          "bottom",
          "bg-green text-white",
          "Agendamento transferido com sucesso"
        );
        this.AtivarLoading(false)
        this.FindAllAppointments();
      } catch (error) {
        console.log(error);
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao transferir o agendamento"
        );
      }
    },
    OpenDialogCancelAppointment(appointment) {
      this.AppointmentSelectedForCancel = appointment;
      this.Show = true;
      this.FindAllReasons();
    },
    async CancelAppointment() {
      try {
        await this.$axios.delete(
          `/agendamentoOnline/agendamentos/cancelar/${this.AppointmentSelectedForCancel.idAgendamento}/${this.SelectedReason.value}`
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
        this.AtivarLoading(true)
        const {data} = await this.$axios.get("/motivos/cancelamentos");
        this.AtivarLoading(false)
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
        this.AtivarLoading(true)
        this.Appointments = [];
        const {data} = await this.$axios.get(`/agendamentoOnline/agendamentos/pendentes/${localStorage.id}`);
        this.Appointments = [...data];
        this.AtivarLoading(false)
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
