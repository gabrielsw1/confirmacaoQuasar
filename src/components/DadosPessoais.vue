<template>
  <q-card>
    <q-card-actions>
      <!--Inicio do formulario de dados pessoais -->
      <div class="row q-col-gutter-sm" style="width: 100%">
        <div class="col-12 col-sm-6">
          <q-input outlined standout="bg-blue text-white" dense label="Nome" v-model="PacienteData.nmPaciente"/>
        </div>
        <div class="col-12 col-sm-6">
          <q-input outlined standout="bg-blue text-white" dense label="Nome Social" v-model="PacienteData.nmSocial"/>
        </div>
        <div class="col-12 col-sm-2 ">
          <q-select outlined standout="bg-blue text-white" dense label="Sexo" :options="options"/>
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="CPF" v-model="cpf" mask="###.###.###-##"
                   @focusout="CpfVerify()"/>
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="RG"/>
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="CNS"/>
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="Tel. Residêncial"
                   v-model="PacienteData.telRes"/>
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="Tel. Celular" v-model="PacienteData.telCel"/>
        </div>
        <div class="col-12 col-sm-6 ">
          <q-input outlined standout="bg-blue text-white" dense label="Mãe" v-model="PacienteData.nmMae"/>
        </div>
        <div class="col-12 col-sm-6 ">
          <q-input outlined standout="bg-blue text-white" dense label="Pai" v-model="PacienteData.nmPai"/>
        </div>
        <div class="col-12">
          <!--Inicio da tabela de endereco -->
          <q-table title="Endereços" :data="data" :columns="columns" :selected.sync="selected" :grid="$q.screen.lt.sm"
                   selection="single" row-key="id" :loading="loading" color="primary"
                   no-data-label="Nenhum dado encontrado"
                   dense>
            <!--Titulo e botoes de acoes de CRUD -->
            <template v-slot:top>
              <div class="row">
                <div class="col">
                  <div class="q-table__title">Endereços</div>
                </div>
              </div>
              <div class="row items-end" style="width:100%">
                <q-btn color="light-green-9" icon="add" class="col-2 col-sm-1 q-mr-xs q-mb-xs" :disable="loading"
                       @click="IncludeEnd()">
                  <q-tooltip>
                    Incluir
                  </q-tooltip>
                </q-btn>
                <q-btn color="orange-10" icon="mode_edit" class="col-2 col-sm-1 q-mr-xs q-mb-xs" :disable="Disabled"
                       @click="EditEnd">
                  <q-tooltip>
                    Editar
                  </q-tooltip>
                </q-btn>
                <q-btn color="negative" icon="delete" class="col-2 col-sm-1 q-mr-xs q-mb-xs" :disable="Disabled"
                       @click="DeleteEnd(selected[0])">
                  <q-tooltip>
                    Excluir
                  </q-tooltip>
                </q-btn>
              </div>
            </template>

            <!--Quando a propriedade grid do q-table estiver ativa o grid se transformara em card utilizando o templete abaixo. -->
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
                   :style="props.selected ? 'transform: scale(0.95);' : ''">
                <q-card :class="props.selected ? 'bg-grey-2' : ''">
                  <q-card-section>
                    <q-checkbox dense v-model="props.selected" :label="props.row.name"/>
                  </q-card-section>
                  <q-separator/>
                  <q-list dense>
                    <q-item v-for="col in props.cols.filter(
                        col => col.name !== 'desc'
                      )" :key="col.name">
                      <q-item-section>
                        <q-item-label>{{ col.label }}:</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label caption>{{ col.value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </div>
            </template>
          </q-table>
        </div>
      </div>
    </q-card-actions>

    <!-- Card que abrirá para cadastrar e alterar enderecos -->
    <q-dialog v-model="show" persistent>
      <q-card class="my-card">
        <q-card-section class="row items-center">
          <div class="text-h6">Cadastro de endereço</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm" style="width:100%">
            <div class="col-12 col-sm-3">
              <q-input outlined standout="bg-blue text-white" dense label="CEP" mask="#####-###" v-model="newEnd.cep"
                       :loading="loadingCep" :rules="[val => !!val || 'CEP Obrigatório']" :disable="disableCEP"
                       @blur="CepVerify">
                <template v-slot:prepend>
                  <q-icon name="search"/>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined standout="bg-blue text-white" dense label="Logradouro" disable
                       v-model="newEnd.logradouro"/>
            </div>
            <div class="col-12 col-sm-3">
              <q-input outlined standout="bg-blue text-white" dense label="Número"
                       :rules="[val => !!val || 'Número Obrigatório']" v-model="newEnd.numero"/>
            </div>
            <div class="col-12 col-sm-3">
              <q-input outlined standout="bg-blue text-white" dense label="Município" disable
                       v-model="newEnd.municipio"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined standout="bg-blue text-white" dense label="Complemento" v-model="newEnd.complemento"/>
            </div>
            <div class="col-12 col-sm-3">
              <q-input outlined standout="bg-blue text-white" dense label="Referencia" v-model="newEnd.referencia"/>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup/>
          <q-btn label="Salvar" color="primary" v-close-popup :disable="DisabledSaveButton" @click="SaveEnd"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>
<script>
export default {
  data() {
    return {
      disableCEP: false,
      cpf: null,
      show: false,
      loading: false,
      loadingCep: false,
      selected: [],
      paciente: {},
      newEnd: {
        id: null,
        cep: null,
        uf: "",
        municipio: "",
        tipo: "",
        logradouro: "",
        numero: "",
        complemento: "",
        referencia: "",
        bairro: ""
      },
      options: [{
        label: "Masculino",
        value: "1"
      },
        {
          label: "Feminino",
          value: "2"
        },
        {
          label: "Não Informado",
          value: "5"
        }
      ],
      columns: [{
        label: "CEP",
        name: "CEP",
        align: "left",
        field: "cep",
        sortable: true
      },
        {
          label: "UF",
          name: "UF",
          align: "left",
          field: "uf",
          sortable: true
        },
        {
          label: "Município",
          name: "Município",
          align: "left",
          field: "municipio",
          sortable: true
        },
        {
          label: "Tipo",
          name: "tp",
          align: "left",
          field: "tpLogradouro",
          sortable: true
        },
        {
          label: "Logradouro",
          name: "Logradouro",
          align: "left",
          field: "logradouro",
          sortable: true
        },
        {
          label: "Número",
          name: "Número",
          align: "left",
          field: "numero",
          sortable: true
        },
        {
          label: "Complemento",
          name: "Complemento",
          align: "left",
          field: "complemento",
          sortable: true
        },
        {
          label: "Referencia",
          name: "Referencia",
          align: "left",
          field: "referencia",
          sortable: true
        },
        {
          label: "Bairro",
          name: "Bairro",
          align: "left",
          field: "bairroInicial",
          sortable: true
        }
      ],
      values: []
    };
  },
  computed: {
    data() {
      return this.values;
    },
    PacienteData() {
      return this.paciente;
    },
    Disabled() {
      return this.selected.length <= 0;
    },
    DisabledSaveButton() {
      return !this.newEnd.cep || !this.newEnd.numero;
    }
  },
  mounted() {
    this.findPersonalData();
  },
  methods: {
    AtivarLoading(boolean) {
      this.$store.commit('global/AtivarLoading', boolean)
    },
    /* função que reseta os campos dos endereços, usada na inclusão para não pegar sujeira da edição */
    ResetEnd() {
      this.newEnd.id = null;
      this.newEnd.cep = null;
      this.newEnd.bairro = "";
      this.newEnd.municipio = "";
      this.newEnd.complemento = "";
      this.newEnd.logradouro = "";
      this.newEnd.tipo = "";
      this.newEnd.numero = "";
      this.newEnd.referencia = "";
      this.newEnd.uf = "";
    },

    /* Função que busca todos os dados dos pacientes */
    async findPersonalData() {
      try {
        this.AtivarLoading(true)
        this.loading = true;
        const {data} = await this.$axios.get(`/agendamentoOnline/paciente/perfil/${localStorage.id}`);
        this.values = data.Endereco;
        this.paciente = data;
        this.loading = false;
        this.AtivarLoading(false)
      } catch (error) {
        console.log(error);
      }
    },
    /* Função que faz o soft delete do endereço do paciente */
    async DeleteEnd({id}) {
      try {
        this.AtivarLoading(true)
        await this.$axios.delete(`/pacientes/endereco/${id}`);
        this.selected = [];
        this.findPersonalData();
        this.AtivarLoading(false)
      } catch (error) {
        console.log(error);
      }
    },
    /*Função que reseta os campos e e abre o DLG para inclusao de um novo endereco*/
    IncludeEnd() {
      this.ResetEnd();
      this.disableCEP = false;
      this.show = true;
    },
    /* Função que atribui para as variáveis os valores que estão sendo editados. Após clicar em salvar a função SaveEnd é chamada.*/
    EditEnd() {
      this.disableCEP = true;
      this.show = true;
      this.newEnd.cep = this.selected[0].cep;
      this.newEnd.id = this.selected[0].id;
      this.newEnd.bairro = this.selected[0].bairroInicial;
      this.newEnd.municipio = this.selected[0].municipio;
      this.newEnd.complemento = this.selected[0].complemento;
      this.newEnd.logradouro = this.selected[0].logradouro;
      this.newEnd.tipo = this.selected[0].tpLogradouro;
      this.newEnd.numero = this.selected[0].numero;
      this.newEnd.referencia = this.selected[0].referencia;
      this.newEnd.uf = this.selected[0].uf;
    },
    /* Função Salva o endereço, tanto na edição quanto na inclusão. */
    async SaveEnd() {
      try {
        /* Faz o post dos dados preenchidos pelo usuario na ROTA,a rota vai tratar se é para atualizar ou inserir um novo endereço. */
        await this.$axios.post(`/agendamentoOnline/paciente/endereco/${localStorage.id}`, this.newEnd);
        /* Atualiza o GRID de Endereços após o retorno da rota. */
        this.loading = true;
        const {data} = await this.$axios.get(`/agendamentoOnline/paciente/perfil/${localStorage.id}`);
        this.values = data.Endereco;
        this.loading = false;
        this.disableCEP = false;
      } catch (error) {
        console.log(error);
      }
    },
    /* Função que busca o CEP no Correio */
    async CepVerify() {
      if (!this.newEnd.cep) {
        return;
      }
      this.loadingCep = true;
      try {
        const {data} = await this.$axios.get(`/utils/correios/consultaCep/${this.newEnd.cep}`);
        const endereco = data.return.end.split(" ");
        endereco.splice(0, 1);
        this.newEnd.bairro = data.return.bairro;
        this.newEnd.cidade = data.return.cidade;
        this.newEnd.complemento = data.return.complemento2;
        this.newEnd.logradouro = endereco.join(" ");
        this.newEnd.tipo = data.return.end.split(" ")[0];
        this.newEnd.uf = data.return.uf;
        this.newEnd.municipio = data.return.cidade;
        this.loadingCep = false;
      } catch (error) {
        console.log(error);
      }
    },

    /* Função que valida se o CPF esta certo */
    CpfVerify() {
      let Soma;
      let Resto;
      Soma = 0;
      if (this.cpf == "00000000000" || !this.cpf) return false;

      for (let i = 1; i <= 9; i++)
        Soma = Soma + parseInt(this.cpf.substring(i - 1, i)) * (11 - i);
      Resto = (Soma * 10) % 11;

      if (Resto == 10 || Resto == 11) Resto = 0;
      if (Resto != parseInt(this.cpf.substring(9, 10))) return false;

      Soma = 0;
      for (let i = 1; i <= 10; i++)
        Soma = Soma + parseInt(this.cpf.substring(i - 1, i)) * (12 - i);
      Resto = (Soma * 10) % 11;

      if (Resto == 10 || Resto == 11) Resto = 0;
      if (Resto != parseInt(this.cpf.substring(10, 11))) false;
      return true;
    }
  }
};

</script>
<style scoped>
.my-card {
  width: 100%;
  min-width: 50%;
}

</style>
