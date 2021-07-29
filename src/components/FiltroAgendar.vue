<template>
  <div class="row q-col-gutter-sm" style="width: 100%">
    <div class="q-gutter-sm col-12 col-sm-12">
      <q-radio dense v-model="TipoAgendamento" val="consulta" label="Consulta"/>
      <q-radio dense v-model="TipoAgendamento" val="exame" label="Exame"/>
    </div>
    <div class="col-12 col-sm-3">
      <q-select :label="TipoAgendamento === 'consulta' ? 'Selecione a Especialidade' : 'Selecione o Exame'"
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
                :options="Convenios" :disable="DisableConv" :loading="LoadingConv"/>
    </div>
    <div class="col-12 col-sm-3">
      <q-select label="Selecione a Categoria/Plano" :disable="DisableCat" :options="Categorias"
                v-model="CategoriaSelecionada" dense :loading="LoadingCat"/>
    </div>
    <div v-show="TipoAgendamento === 'consulta'" class="col-12 col-sm-3">
      <q-select hint="Opcional" label="Selecione o(a) Médico(a)" :options="MedicosPorConvenio"
                v-model="MedicoSelecionado" dense>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-italic text-grey">
              <span>Nenhum(a) Médico(a) encontrado(a) para esta especialidade.
                Preencha o convênio e clique em <b>"continuar"</b> para visualizar os dias disponíveis.</span>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
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
      DisableConv: true,
      LoadingCat: false,
      DisableCat: true,
      Message: null,
      Position: null,
      ShowAlert: null,
      BgClass: null,
      Loading: false,
    }
  },
  mounted() {
    this.BuscarItensAgendamentos()
    this.ResetarState()
  },
  watch: {
    TipoAgendamento(val) {
      this.ItemAgendamentoSelecionado = null
      this.ConvenioSelecionado = null
      this.CategoriaSelecionada = null
      this.MedicoSelecionado = null
      this.ResetarState()
      this.$store.commit('agendar/AlterarTipoItemAgendamento', val)
      this.BuscarItensAgendamentos()
    },
    ItemAgendamentoSelecionado(val) {
      if (val) {
        this.BuscarConveniosPorItemAgendamento(this.TipoAgendamento, val.value)
        this.$store.commit('agendar/AlteraridItemAgendamento', val.value)
      } else {
        this.$store.commit('agendar/AlteraridItemAgendamento', null)
        this.MedicoSelecionado = null
        this.ConvenioSelecionado = null
      }
    },
    ConvenioSelecionado(val) {
      this.CategoriaSelecionada = null
      this.MedicoSelecionado = null
      if (val.value) {
        this.BuscarCategorias(val.value)
        this.$store.commit('agendar/AlterarConvenio', this.ConvenioSelecionado.value)
        if (this.TipoAgendamento === 'consulta') {
          this.BuscarMedicosPorConvenio(this.ItemAgendamentoSelecionado.value, this.ConvenioSelecionado.value)
        }
      }
    },
    CategoriaSelecionada(val) {
      if (val.value) {
        this.$store.commit('agendar/AlterarCategoria', val.value)
      } else {
        this.$store.commit('agendar/AlterarCategoria', null)
      }

    },
    MedicoSelecionado(val) {
      if (val.value) {
        this.$store.commit('agendar/AlterarMedico', val.value)
      } else {
        this.$store.commit('agendar/AlterarMedico', null)
      }

    }
  },
  methods: {
    ResetarState() {
      this.$store.commit('agendar/AlterarTipoItemAgendamento', 'consulta')
      this.$store.commit('agendar/AlteraridItemAgendamento', null)
      this.$store.commit('agendar/AlterarConvenio', null)
      this.$store.commit('agendar/AlterarCategoria', null)
      this.$store.commit('agendar/AlterarMedico', null)
    },
    async BuscarMedicosPorConvenio(idItemAgendamento, idConvenio) {
      try {
        const {data} = await this.$axios.get(
          `/agendamentoOnline/agendas/prestador/${idItemAgendamento}/${idConvenio}`
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
        this.DisableConv = true
        const {data} = await this.$axios.get(`/agendamentoOnline/agendamentos/convenios/${tipo}/${idItemAgendamento}`);
        this.Convenios = [...data]
        this.LoadingConv = false
        this.DisableConv = false
      } catch (e) {
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "Erro ao carregar os convênios!"
        );
      }
    },
    async BuscarCategorias(idConvenio) {
      try {
        this.LoadingCat = true
        this.DisableCat = false
        const {data} = await this.$axios.get(`/categorias/${idConvenio}`);
        this.Categorias = [...data]
        this.LoadingCat = false
        this.DisableCat = false
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
        if (this.TipoAgendamento === 'consulta') {
          this.Loading = true
          const {data} = await this.$axios.get("/agendamentoOnline/agendas/especialidadesDisponiveis");
          this.ItensAgendamentos = [...data]
          this.Loading = false
        } else {
          this.Loading = true
          const {data} = await this.$axios.get("/agendamentoOnline/agendas/examesDisponiveis");
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
