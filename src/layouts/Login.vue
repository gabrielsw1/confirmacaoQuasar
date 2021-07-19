<template>
  <q-layout class="flex flex-center bg-light-blue-10">
    <q-card class="shadow-7 card-style">
      <q-card-section>
        <form @submit.prevent="login">
          <div class="row">
            <div class="col-12 flex flex-center">
              <img alt="logo" src="../assets/logo.jpg"/>
            </div>
            <div class="col-12 q-ma-xs">
              <q-input :rules="[ val => val && val.length > 0 || 'Informe o CPF ou E-mail']" dense rounded outlined
                       label="Informe o CPF ou E-mail" v-model="Paciente.username"/>
            </div>
            <div class="col-12 q-ma-xs">
              <q-input :rules="[ val => val && val.length > 0 || 'Informe a Senha']" type="password" dense rounded
                       outlined label="Informe a senha" v-model="Paciente.password"/>
            </div>
            <div class="col-12 q-ma-xs">
              <q-btn type="submit" :Loading="Loading" :disable="disable" class="full-width shadow-7" dense unelevated
                     rounded color="primary" label="Entrar">
                <template v-slot:Loading>
                  <q-spinner-facebook/>
                </template>
              </q-btn>
            </div>
          </div>
        </form>
      </q-card-section>
      <q-card-actions class="justify-between">
        <template v-if="FirstAccess">
            <q-btn flat label="VOLTAR" color="primary"/>
            <q-btn label="Cadastrar" color="primary"/>
        </template>
        <q-btn v-else  dense flat label="PRIMEIRO ACESSO? CLIQUE AQUI!" class="full-width" color="primary" @click="FirstAccess = true"/>
      </q-card-actions>
    </q-card>

    <!-- Dialog para Alertas de sucesso e erro -->
    <q-dialog v-model="ShowAlert" :position="Position">
      <q-card :class="BgClass">
        <q-card-section>
          <span>{{ Message }}</span>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      FirstAccess: false,
      ShowAlert: false,
      Position: null,
      Message: null,
      BgClass: null,
      Loading: false,
      Paciente: {
        username: null,
        password: null
      }
    };
  },
  created() {
    this.$q.addressbarColor.set('#2E86C1')
  },
  computed: {
    disable() {
      return !this.Paciente.username || !this.Paciente.password;

    }
  },
  methods: {
    async login() {
      try {
        this.Loading = true;
        const {
          data
        } = await this.$axios.post("/login", {
          username: this.Paciente.username,
          password: this.Paciente.password
        });
        this.$store.commit("user/AlterUser", data);
        this.Loading = false;
        localStorage.id = data.id_paciente
        this.$router.push({
          path: "/main"
        });
      } catch (error) {
        this.OpenAlertDialog(
          "bottom",
          "bg-red text-white",
          "ERRO: Usuário ou senha incorretos"
        );
        this.Loading = false;
      }
    },
    OpenAlertDialog(position, bgclass, message) {
      this.Position = position;
      this.BgClass = bgclass;
      this.Message = message;
      this.ShowAlert = true;
      setTimeout(() => {
        this.ShowAlert = false;
      }, 2000);
    }
  }
};

</script>

<style>
.card-style {
  width: 300px;
}

</style>
