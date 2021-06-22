<template>
  <div class="row q-col-gutter-sm" style="width: 100%">
    <div class="q-gutter-sm col-12 col-sm-12">
      <q-radio dense v-model="TipoAgendamento" val="consulta" label="Consulta"/>
      <q-radio dense v-model="TipoAgendamento" val="exame" label="Exame"/>
    </div>
    <div class="col-12 col-sm-3">
      <q-select :label="TipoAgendamento == 'consulta' ? 'Selecione a Especialidade' : 'Selecione o Exame'"
                :options="ItensAgendamentos" v-model="ItemAgendamentoSelecionado" dense :loading="Loading"
                :disable="Loading">
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-italic text-grey">
              Nenhum(a) {{ TipoAgendamento }} disponível
            </q-item-section>
          </q-item>
        </template>

      </q-select>
    </div>
    <div class="col-12 col-sm-3">
      <q-select label="Selecione o Convênio" dense v-model="ConvenioSelecionado"
                :options="Convenios" :disable="ItemAgendamentoSelecionado ? false : true" :loading="LoadingConv"/>
    </div>
    <div class="col-12 col-sm-3">
      <q-select label="Selecione a Categoria/Plano" :disable="ConvenioSelecionado? false : true" :options="Categorias"
                v-model="CategoriaSelecionada" dense/>
    </div>
    <div v-show="TipoAgendamento === 'consulta'" class="col-12 col-sm-3">
      <q-select hint="Opcional" label="Selecione o(a) Médico(a)" :options="MedicosPorConvenio"
                v-model="MedicoSelecionado" dense/>
    </div>

    <!-- Dialog para Alertas de sucesso e erro -->
    <q-dialog v-model="ShowAlert" :position="Position">
      <q-card :class="BgClass">
        <q-card-section>
          <span>{{ Message }}</span>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: "FiltroAgendar",
  data() {
    return {
      TipoAgendamento: 'consulta',
      ItensAgendamentos: [],
      ItemAgendamentoSelecionado: null,
      Convenios: null,
      ConvenioSelecionado: null,
      Categorias: null,
      CategoriaSelecionada: null,
      MedicosPorConvenio: null,
      MedicoSelecionado: null,
      LoadingConv: false,
      Message: null,
      Position: null,
      ShowAlert: null,
      BgClass: null,
      Loading: false,
    }
  },
  mounted() {
    this.BuscarItensAgendamentos()
  },
  watch: {
    TipoAgendamento() {
      this.ItemAgendamentoSelecionado = null
      this.ConvenioSelecionado = null
      this.CategoriaSelecionada = null
      this.MedicoSelecionado = null
      this.BuscarItensAgendamentos()
    },
    ItemAgendamentoSelecionado(val) {
      if (val) {
        this.BuscarConveniosPorItemAgendamento(this.TipoAgendamento, val.value)
      } else {
        this.MedicoSelecionado = null
        this.ConvenioSelecionado = null
      }
    },
    ConvenioSelecionado(val) {
      this.CategoriaSelecionada = null
      this.MedicoSelecionado = null
      if (val) {
        this.BuscarCategorias(val.value)
        if (this.TipoAgendamento === 'consulta') {
          this.BuscarMedicosPorConvenio(this.ItemAgendamentoSelecionado.value, this.ConvenioSelecionado.value)
        }
      }
    }
  },
  methods: {
    async BuscarMedicosPorConvenio(idItemAgendamento, idConvenio) {
      try {
        const {data} = await this.$axios.get(
          `/agendamentos/prestador/${idItemAgendamento}/${idConvenio}`
        );
        this.MedicosPorConvenio = [...data]
      } catch (e) {
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao carregar prestadores por convênio!"
        );
      }
    },
    async BuscarConveniosPorItemAgendamento(tipo, idItemAgendamento) {
      try {
        this.LoadingConv = true
        const {data} = await this.$axios.get(
          `/agendamentos/convenios/${tipo}/${idItemAgendamento}`
        );
        this.Convenios = [...data]
        this.LoadingConv = false
      } catch (e) {
        this.LoadingConv = false
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao carregar os convênios!"
        );
      }
    },
    async BuscarCategorias(idConvenio) {
      try {
        const {data} = await this.$axios.get(
          `/agendamentos/categorias/${idConvenio}`
        );
        this.Categorias = [...data]
      } catch (e) {
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao carregar as categorias!"
        );
      }
    },
    async BuscarItensAgendamentos() {
      try {
        if (this.TipoAgendamento == 'consulta') {
          this.Loading = true
          const {data} = await this.$axios.get(
            "/agendamentos/especialidades"
          );
          this.ItensAgendamentos = [...data]
          this.Loading = false
        } else {
          this.Loading = true
          const {data} = await this.$axios.get(
            "/agendamentos/exames"
          );
          this.ItensAgendamentos = [...data]
          this.Loading = false
        }
      } catch (e) {
        this.Loading = false
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao carregar os Itens de Agendamento!"
        );
      }
    }
    ,
    OpenAlertDialog(position, bgclass, message) {
      this.Position = position;
      this.BgClass = bgclass;
      this.Message = message;
      this.ShowAlert = true;
      setTimeout(() => {
        this.ShowAlert = false;
      }, 2000);
    }
    ,
  }
}
</script>

<style scoped>

</style>
