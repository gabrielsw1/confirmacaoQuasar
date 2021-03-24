<template>
  <div class="q-pa-md">
    <q-banner class="bg-primary text-white">
      <div class="row">
        <div class="col-auto q-mr-xl">
          <b>Agendamentos Selecionados: </b> {{this.$store.getters['appointments/GetCountAppointmentsSelected']}}
        </div>
        <div class="col-auto">
          <b>Valor Total: </b> [deve ser colocado o valor total]
        </div>
      </div>
    </q-banner>
    <div class="row">
      <div class="col-12" v-for="appointment in this.$store.getters['appointments/GetAppointmentsSelected']" :key="appointment.idAgendamento">
        <q-list bordered class="rounded-borders">
          <q-expansion-item  expand-separator
            header-class="text-blue text-bold" icon="event_available" :label="appointment.descrProcedimento" :caption="'Data: ' + appointment.dtAgendamento +' Hora: ' + appointment.hrAgendamento">
            <q-card>
              <q-card-section>
                <div class="row">
                  <div class="col-auto q-mr-xl">
                    <b>Paciente: </b> {{ appointment.nmPaciente }}
                  </div>
                  <div class="col-auto q-mr-xl">
                    <b>Convênio: </b>
                    {{ appointment.nmConvenio || "Não informado" }}
                  </div>
                  <div class="col-auto q-mr-xl">
                    <b>Categoria: </b>
                    {{ appointment.nmCategoria || "Não informada" }}
                  </div>
                  <div class="col-auto q-mr-xl">
                    <b>Médico: </b>
                    {{ appointment.nmPrestador || "Não informado" }}
                  </div>
                  <div class="col-auto q-mr-xl">
                    <b>Instituição: </b> {{ appointment.nmHospital }}
                  </div>
                  <div class="col-auto q-mr-xl">
                    <b>Endereço: </b> {{ appointment.logradouro }}
                  </div>
                  <div class="col-auto q-mr-xl">
                    <b>Observação: </b>
                    {{ appointment.observacaoAgendamento || "Não possui" }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        expanded: false,
      };
    },
    created(){

    }
  };

</script>
