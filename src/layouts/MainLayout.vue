<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-grey-3">
        <q-btn flat dense round icon="menu" color="blue" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title >
          <b class="text-blue"> MV</b><span class="text-black" @click="$router.push('/main')">Hospidata </span>
        </q-toolbar-title>
        <q-btn flat round dense icon="power_settings_new" color="blue" @click="logout"/>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" overlay bordered content-class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8">
          <q-btn flat dense round icon="menu" color="blue" aria-label="Menu"
            @click="leftDrawerOpen = !leftDrawerOpen" />
          Menus
        </q-item-label>
        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
  import EssentialLink from "components/EssentialLink.vue";

  const linksData = [{
      title: "Agendamentos",
      caption: "Agendamentos não confirmados",
      icon: "event",
      to: "/StepperAppointments"
    },
    {
      title: "Histórico de Agendamentos",
      caption: "Status dos agendamentos",
      icon: "event_note",
      link: "https://github.com/quasarframework"
    },
    {
      title: "Histórico de Pagamentos",
      caption: "Informações de Pagamentos",
      icon: "credit_score",
      link: "https://chat.quasar.dev"
    },
    {
      title: "Perfil",
      caption: "Dados Pessoais",
      icon: "account_box",
      link: "https://forum.quasar.dev"
    }
  ];

  export default {
    name: "MainLayout",
    components: {
      EssentialLink
    },
    data() {
      return {
        leftDrawerOpen: false,
        essentialLinks: linksData
      };
    },
    methods:{
      logout(){
        this.$router.push('/')
      }
    }
  };

</script>
