import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('./views/Main.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('./views/Home.vue'),
          children: [
            {
              path: 'community',
              name: 'community',
              component: () => import('./views/Community.vue')
            },
            {
              path: 'friends',
              name: 'friends',
              component: () => import('./views/Friends.vue')
            },
            {
              path: 'profile',
              name: 'profile',
              component: () => import('./views/Profile.vue')
            },
            {
              path: '@me/:uuid',
              name: '@me',
              component: () => import('./views/@me.vue'),
              props: route => ({ id: parseInt(route.params.id, 10) })
            }
          ]
        },
        {
          path: 'groups/:uuid',
          name: 'groups',
          component: () => import('./views/Groups.vue'),
          // props: route => ({ uuid: route.params.uuid })
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/Login.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  console.log(to)
  if (to.name !== 'login') {
    if (!store.state.user) {
      await store.dispatch('fetchUserInfo')
    }

    if (store.state.joinedGroups.length === 0) {
      await store.dispatch('fetchJoinedGroups')
    }
  }

  if (to.name === 'community') {
    await store.dispatch('fetchPublicGroups')
  }

  if (to.name === 'friends') {
    await store.dispatch('fetchFriends')
    await store.dispatch('fetchFriendRequest')
  }

  if (to.name === 'groups') {
    await store.dispatch('fetchGroupInfo', to.params.uuid)
    router.app.$socket.emit('CHAT_CONNECT', { chatType: 'group', chatUuid: to.params.uuid })
  }

  if (to.matched[1] && to.matched[1].path === '/' && store.state.privateChats.length === 0) {
    await store.dispatch('fetchPrivateChats')
  }

  if (to.name === '@me') {
    await store.dispatch('fetchPrivateChatInfo', to.params.uuid)
    router.app.$socket.emit('CHAT_CONNECT', { chatType: 'private_chat', chatUuid: to.params.uuid })
  }

  store.commit('setCurrentView', to)

  next()
})

export default router
