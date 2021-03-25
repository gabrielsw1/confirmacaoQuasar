<template>
  <q-card>
    <q-card-actions>
      <div class="row" style="width: 100%">
        <div class="col-12 col-sm-3 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Nome" v-model="Patiente.Name" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Nome Social" v-model="Patiente.SocialName" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Sexo" v-model="Patiente.Gender" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="CPF" v-model="Patiente.CPF" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="RG" v-model="Patiente.RG" />
        </div>
        <div class="col-12 col-sm-3 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Mãe" v-model="Patiente.Mother" />
        </div>
        <div class="col-12 col-sm-3 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Pai" v-model="Patiente.Father" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Telefone 1" v-model="Patiente.Fone1" />
        </div>
        <div class="col-12 col-sm-2 q-mr-xs q-mt-xs">
          <q-input standout="bg-blue text-white" dense label="Telefone 2" v-model="Patiente.Fone2" />
        </div>
      </div>
    </q-card-actions>
  </q-card>
</template>
<script>
  export default {
    data() {
      return {
        Patiente: {
          Name: this.$store.state.user.user.nm_paciente,
          SocialName: this.$store.state.user.user.apelido,
          Gender: null,
          CPF: null,
          Rg: null,
          Mother: this.$store.state.user.user.mae,
          Father: this.$store.state.user.user.pai,
          Birthday: this.$store.state.user.user.data_nasc,
          Fone1: this.$store.state.user.user.fone_res_1,
          Fone2: this.$store.state.user.user.fone_res_2
        }
      };
    },
    mounted(){
      this.findPersonalData()
    },
    methods:{
      async findPersonalData(){
        try {
          const {data} = await this.$axios.get(`/pacientes/perfil/${localStorage.id}`)
          console.log(data)
        } catch (error) {
          console.log(error)
        }
      }
    }
  };

</script>
