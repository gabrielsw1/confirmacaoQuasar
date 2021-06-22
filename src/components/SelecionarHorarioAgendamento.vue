<template>

    <div class="row q-col-gutter-sm" style="width: 100%">
      <div class="q-gutter-sm col-6 col-sm-3">
        <q-date v-model="DataAgendamento" subtitle="Selecione o dia que deseja agendar" today-btn></q-date>
      </div>
      <div class="q-gutter-sm col-12 col-sm-1">
        <q-list bordered separator>
          <q-item clickable v-ripple>
            <q-item-section>12:00</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label>13:00</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label overline>13:30</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

</template>

<script>
export default {
  name: "SelecionarHorarioAgendamento",
  data() {
    return {
      DataAgendamento: '2021/06/22',
    }
  }
}
</script>

<style scoped>

</style>
