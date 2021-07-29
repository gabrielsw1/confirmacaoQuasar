<template>
  <q-page-sticky position="bottom-right" :offset="fabPos">
    <q-fab icon="add" direction="up" color="light-blue-9" :disable="draggingFab" v-touch-pan.prevent.mouse="moveFab"
           @show="buscarTotalAgendamentos">
      <q-fab-action external-label label-position="left" label="Confirmar" color="primary" icon="event_available"
                    :disable="draggingFab" to="/confirmar">
        <q-badge color="red-4" rounded floating>
          <template v-if="loading == true">
            <q-spinner-pie color="white" size="0.8em"/>
          </template>
          <template v-else>
            {{ totalAgendamentos }}
          </template>
        </q-badge>
      </q-fab-action>
      <q-fab-action external-label label-position="left" label="Agendar" color="primary" icon="event"
                    :disable="draggingFab" to="/agendar"/>
    </q-fab>
  </q-page-sticky>
</template>

<script>
export default {
  name: "FloatButton",
  data() {
    return {
      draggingFab: false,
      fabPos: [18, 18],
      totalAgendamentos: 0,
      loading: false
    }
  },
  methods: {
    moveFab(ev) {
      this.draggingFab = ev.isFirst !== true && ev.isFinal !== true
      this.fabPos = [
        this.fabPos[0] - ev.delta.x,
        this.fabPos[1] - ev.delta.y
      ]
    },
    async buscarTotalAgendamentos() {
      this.loading = true
      const {data} = await this.$axios.get(
        `/agendamentoOnline/agendamentos/pendentes/total/${localStorage.id}`
      );
      this.totalAgendamentos = data[0].totalAgendamentosPendentes
      this.loading = false
    }
  }
}
</script>

<style scoped>

</style>
