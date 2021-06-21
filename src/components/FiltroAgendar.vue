<template>
  <div class="row q-col-gutter-sm" style="width: 100%">
    <div class="q-gutter-sm col-12 col-sm-12">
      <q-radio dense v-model="TipoAgendamento" val="consulta" label="Consulta"/>
      <q-radio dense v-model="TipoAgendamento"  val="exame" label="Exame"/>
    </div>
    <div class="col-12 col-sm-3">
      <q-select :label="TipoAgendamento == 'consulta' ? 'Selecione a Especialidade' : 'Selecione o Exame'"
                :options="Especialidades"  dense/>
    </div>
    <div class="col-12 col-sm-3">
      <q-select label="Informe o Convênio" dense/>
    </div>
    <div class="col-12 col-sm-3">
      <q-select label="Informe a Categoria/Plano" dense/>
    </div>
    <div v-show="TipoAgendamento === 'consulta'" class="col-12 col-sm-3">
      <q-select hint="Opcional" label="Informe o Médico(a)" dense/>
    </div>
  </div>
</template>

<script>
export default {
  name: "FiltroAgendar",
  data() {
    return {
      TipoAgendamento: 'consulta',
      Especialidades:[]
    }
  },
  mounted(){
    this.BuscarEspecialidades()
  },
  methods:{
    async BuscarEspecialidades(){
      const { data } = await this.$axios.get(
        "/agendamentos/especialidades"
      );
      console.log(data)
      this.Especialidades = [...data]
    }
  }
}
</script>

<style scoped>

</style>
