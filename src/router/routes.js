const routes = [{
    path: '/',
    component: () => import('layouts/Login.vue')
  },
  {
    path: '/main',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
        path: '',
        component: () => import('components/Agendar.vue')
      },
      {
        path: '/Confirmar',
        component: () => import('components/StepperConfirmacaoAgendamentos.vue')
      },
      {
        path: '/Agendar',
        component: () => import('components/Agendar.vue')
      },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
