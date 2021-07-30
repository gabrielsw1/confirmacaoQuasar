<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-grey-3">
        <q-btn flat dense round icon="menu" color="blue" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen"/>
        <q-toolbar-title>
          <b class="text-blue"> MV</b><span class="text-black" @click="$router.push('/main')">
            Hospidata
          </span>
        </q-toolbar-title>
        <q-btn flat round dense icon="power_settings_new" color="blue" @click="logout"/>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" overlay bordered content-class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-grey-8">
          <q-btn flat dense round icon="menu" color="blue" aria-label="Menu"
                 @click="leftDrawerOpen = !leftDrawerOpen"/>
          Menus
        </q-item-label>
        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link"/>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view/>

      <q-page-scroller position="top" :scroll-offset="150" :offset="[18, 18]">
        <q-btn fab icon="keyboard_arrow_up" color="primary"/>
      </q-page-scroller>
    </q-page-container>

    <FloatButton v-if="$q.platform.is.mobile"/>
    <q-inner-loading :showing="this.$store.getters['global/HabilitarLoading']">
      <q-spinner-facebook size="85px" color="primary"/>
    </q-inner-loading>

  </q-layout>
</template>

<script>
import EssentialLink from "components/LinksMenus.vue";
import FloatButton from "components/FloatButton";

const linksData = [{
  title: "Agendar",
  caption: "Realize seu agendamento",
  icon: "event",
  to: "/agendar"
},
  {
    title: "Confirmação",
    caption: "Confirme seus agendamentos",
    icon: "event_available",
    to: "/confirmar"
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
    EssentialLink,
    FloatButton
  },
  data() {
    return {
      leftDrawerOpen: false,
      essentialLinks: linksData
    };
  },
  methods: {
    async logout() {
      try {

        await this.$axios.get('/logout')
        await this.$router.push("/");
      } catch (e) {
        console.log(e)
      }
    }
  }
};

</script>
