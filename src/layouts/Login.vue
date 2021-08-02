<template>
  <q-layout class="flex flex-center bg-light-blue-10">
    <template v-if="!FirstAccess">
      <q-card class="shadow-7 card-style">
        <q-card-section>
          <form @submit.prevent="login">
            <div class="row">
              <div class="col-12 flex flex-center">
                <img alt="logo" src="../assets/logo.jpg"/>
              </div>
              <div class="col-12 q-ma-xs">
                <q-input :rules="[ val => val && val.length > 0 || 'Informe o CPF ou E-mail']" no-error-icon dense
                         rounded outlined hide-bottom-space
                         label="Informe o CPF ou E-mail" v-model="Paciente.username">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="person"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 q-ma-xs">
                <q-input :rules="[ val => val && val.length > 0 || 'Informe a Senha']" no-error-icon type="password"
                         dense rounded hide-bottom-space
                         outlined label="Informe a senha" v-model="Paciente.password">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="lock"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 q-ma-xs flex justify-center">
                <q-btn type="submit" :Loading="Loading" :disable="disable" class="full-width shadow-7" dense unelevated
                       rounded color="primary" label="Entrar">
                  <template v-slot:Loading>
                    <q-spinner-facebook/>
                  </template>
                </q-btn>
                <a class="text-light-blue-9" href="#">Esqueceu a senha?</a>
              </div>
            </div>
          </form>
          <q-card-actions class="justify-between">
            <q-btn dense flat label="PRIMEIRO ACESSO? CLIQUE AQUI!" class="full-width" color="primary"
                   @click="FirstAccess = true"/>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </template>
    <template v-else>
      <q-card class="shadow-7 card-style-2">
        <div class="text-light-blue-9 text-h5 flex justify-center">Preencha os dados e realize o seu cadastro.</div>
        <q-card-section>
          <form @submit.prevent="">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input v-model="NewUser.nome" :rules="[ val => val && val.length > 0 || 'Informe seu nome.']"
                         hide-bottom-space no-error-icon outlined standout="bg-blue text-white" dense label="Nome">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="person"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="NewUser.nomeSocial" hide-bottom-space outlined standout="bg-blue text-white"
                         no-error-icon dense label="Nome Social">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="person"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-3 ">
                <q-select v-model="NewUser.sexo" :rules="[ val => val && val.length > 0 || 'Informe seu sexo.']"
                          no-error-icon hide-bottom-space outlined standout="bg-blue text-white" dense label="Sexo"
                          :options="options"/>
              </div>
              <div class="col-12 col-sm-3 ">
                <q-input v-model="NewUser.cpf" :rules="[ val => val && val.length > 0 || 'Informe seu CPF.']"
                         no-error-icon hide-bottom-space outlined standout="bg-blue text-white" dense label="CPF"
                         mask="###.###.###-##"/>
              </div>
              <div class="col-12 col-sm-3 ">
                <q-input v-model="NewUser.dtNasc"
                         :rules="[ val => val && val.length > 0 || 'Informe sua data de nascimento.']" no-error-icon
                         hide-bottom-space label="Dt. Nasc." type="text" mask="##/##/####" outlined
                         standout="bg-blue text-white" dense>
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="event"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-3 ">
                <q-input v-model="NewUser.cel" :rules="[ val => val && val.length > 0 || 'Informe o seu telefone.']"
                         no-error-icon hide-bottom-space type="tel" outlined standout="bg-blue text-white" dense
                         label="Tel. Celular">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="call"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6 ">
                <q-input v-model="NewUser.email" type="email" outlined standout="bg-blue text-white" dense
                         label="E-mail">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="mail"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6 ">
                <q-input v-model="NewUser.confirmEmail"
                         :rules="[val => validadeEmail(val) || 'Os e-mails informados não conferem.']" no-error-icon
                         hide-bottom-space type="email" outlined standout="bg-blue text-white" dense
                         label="Confirmação do E-mail">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="mail"/>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6 ">
                <q-input v-model="NewUser.password" outlined standout="bg-blue text-white" dense
                         :type="IsPwd ? 'password' : 'text'" label="Senha">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="lock"/>
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="IsPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer text-light-blue-9"
                      @click="IsPwd = !IsPwd"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6 ">
                <q-input v-model="NewUser.confirmPassword"
                         :rules="[val => validadePassword(val) || 'As senhas informadas não conferem.']" no-error-icon
                         hide-bottom-space outlined standout="bg-blue text-white" dense
                         :type="IsPwd ? 'password' : 'text'" label="Confirme a senha">
                  <template v-slot:prepend>
                    <q-icon class="text-light-blue-9" name="lock"/>
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="IsPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer text-light-blue-9"
                      @click="IsPwd = !IsPwd"
                    />
                  </template>
                </q-input>
              </div>
            </div>
          </form>
        </q-card-section>

        <q-card-actions class="justify-between">
          <q-btn flat color="primary" icon="arrow_back" @click="FirstAccess = false"/>
          <q-btn label="Cadastrar" color="primary"/>
        </q-card-actions>
      </q-card>
    </template>


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
      IsPwd: true,
      Paciente: {
        username: null,
        password: null
      },
      NewUser: {
        nome: null,
        nomeSocial: null,
        sexo: null,
        cpf: null,
        dtNasc: null,
        cel: null,
        email: null,
        confirmEmail: null,
        password: null,
        confirmPassword: null
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
    validadeEmail(val) {
      return val === this.NewUser.email ? true : false
    },
    validadePassword(val) {
      return val === this.NewUser.password ? true : false
    },
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

.card-style-2 {
  width: 700px;
}

</style>
