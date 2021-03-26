<template>
  <q-card>
    <q-card-actions>
      <div class="row" style="width: 100%">
        <div class="col-12 col-sm-4 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Nome" v-model="PacienteData.nmPaciente" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Nome Social" v-model="PacienteData.nmSocial" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="CPF" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="RG" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="CNS" />
        </div>
        <div class="col-12 col-sm-3 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Mãe" v-model="PacienteData.nmMae" />
        </div>
        <div class="col-12 col-sm-3 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Pai" v-model="PacienteData.nmPai" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Tel. Residêncial" v-model="PacienteData.telRes" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Tel. Celular" v-model="PacienteData.telCel" />
        </div>
        <div class="col-12 q-mr-xs q-mt-xs">

          <q-table title="Endereços" :data="data" :columns="columns" :selected.sync="selected" selection="single"
            row-key="cep" :loading="loading" color="primary" no-data-label="Nenhum dado encontrado" dense>

            <template v-slot:top>
              <div class="row">
                <div class="col">
                  <div class="q-table__title">Endereços</div>
                </div>
              </div>
              <div class="row items-end" style="width:100%">
                <q-btn color="light-green-9" icon="add" class="col-12 col-sm-1 q-mr-xs q-mb-xs" :disable="loading"
                  @click="IncludeEnd()" />
                <q-btn color="orange-10" icon="mode_edit" class="col-12 col-sm-1 q-mr-xs q-mb-xs" :disable="Disabled" />
                <q-btn color="negative" icon="delete" class="col-12 col-sm-1 q-mr-xs q-mb-xs" :disable="Disabled" />
              </div>
            </template>

            <template v-slot:body-selection="scope">
              <q-toggle v-model="scope.selected" />
            </template>
          </q-table>
        </div>
      </div>
    </q-card-actions>

      <!-- Card que abrirá para cadastrar e alterar enderecos -->
    <q-dialog v-model="show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">Cadastro de endereço</div>
        </q-card-section>
        <q-card-section>
          teste
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
      }
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
      }
    }
  };

</script>
