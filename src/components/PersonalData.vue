<template>
  <q-card>
    <q-card-actions>
      <!--Inicio do formulario de dados pessoais -->
      <div class="row q-col-gutter-sm" style="width: 100%">
        <div class="col-12 col-sm-6">
          <q-input outlined standout="bg-blue text-white" dense label="Nome" v-model="PacienteData.nmPaciente" />
        </div>
        <div class="col-12 col-sm-6">
          <q-input outlined standout="bg-blue text-white" dense label="Nome Social" v-model="PacienteData.nmSocial" />
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="Sexo" />
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="CPF" v-model="cpf" mask="###.###.###-##"
            @focusout="CpfVerify()" />
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="RG" />
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="CNS" />
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="Tel. Residêncial"
            v-model="PacienteData.telRes" />
        </div>
        <div class="col-12 col-sm-2 ">
          <q-input outlined standout="bg-blue text-white" dense label="Tel. Celular" v-model="PacienteData.telCel" />
        </div>
        <div class="col-12 col-sm-6 ">
          <q-input outlined standout="bg-blue text-white" dense label="Mãe" v-model="PacienteData.nmMae" />
        </div>
        <div class="col-12 col-sm-6 ">
          <q-input outlined standout="bg-blue text-white" dense label="Pai" v-model="PacienteData.nmPai" />
        </div>
        <div class="col-12">

          <!--Inicio da tabela de endereco -->
          <q-table title="Endereços" :data="data" :columns="columns" :selected.sync="selected" :grid="$q.screen.lt.sm"
            selection="single" row-key="cep" :loading="loading" color="primary" no-data-label="Nenhum dado encontrado"
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
                <q-btn color="orange-10" icon="mode_edit" class="col-2 col-sm-1 q-mr-xs q-mb-xs" :disable="Disabled">
                  <q-tooltip>
                    Editar
                  </q-tooltip>
                </q-btn>
                <q-btn color="negative" icon="delete" class="col-2 col-sm-1 q-mr-xs q-mb-xs" :disable="Disabled">
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
                    <q-checkbox dense v-model="props.selected" :label="props.row.name" />
                  </q-card-section>
                  <q-separator />
                  <q-list dense>
                    <q-item v-for="col in props.cols.filter(col => col.name !== 'desc')" :key="col.name">
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
              <q-input outlined standout="bg-blue text-white" dense label="CEP" mask="#####-##" @blur="CepVerify">
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined standout="bg-blue text-white" dense label="Logradouro" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input outlined standout="bg-blue text-white" dense label="Numero" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input outlined standout="bg-blue text-white" dense label="Municipio" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined standout="bg-blue text-white" dense label="Complemento" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input outlined standout="bg-blue text-white" dense label="Referencia" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Salvar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>
<script>
  export default {
    data() {
      return {
        cpf: null,
        show: false,
        loading: false,
        selected: [],
        paciente: {},
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
            field: "bairro_inicial",
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
        if (this.selected.length > 0) {
          return false
        }
        return true
      },
    },
    mounted() {
      this.findPersonalData();
    },
    methods: {
      async findPersonalData() {
        try {
          this.loading = true
          const {
            data
          } = await this.$axios.get(
            `/pacientes/perfil/${localStorage.id}`
          );
          this.values = data.Endereco;
          this.paciente = data;
          this.loading = false
        } catch (error) {
          console.log(error);
        }
      },
      IncludeEnd() {
        this.show = true
        console.log(...this.selected)
      },
      CpfVerify() {
        let Soma;
        let Resto;
        Soma = 0;
        if (this.cpf == "00000000000") return false;

        for (let i = 1; i <= 9; i++) Soma = Soma + parseInt(this.cpf.substring(i - 1, i)) * (11 - i);
        Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11)) Resto = 0;
        if (Resto != parseInt(this.cpf.substring(9, 10))) return false;

        Soma = 0;
        for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(this.cpf.substring(i - 1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11)) Resto = 0;
        if (Resto != parseInt(this.cpf.substring(10, 11))) false;
        return true;
      },
      CepVerify(){
        console.log('entrou na funcao')
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