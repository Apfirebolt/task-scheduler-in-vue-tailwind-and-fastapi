import { createStore } from 'vuex';
import auth from './modules/auth/auth';

// Create a new store instance.
const store = createStore({
  state() {
    return {
      count: 0,
      appName: 'My Vuex App',
    };
  },

  // Getters
  getters: {
    doubleCount(state) {
      return state.count * 2;
    },
  },

  // Mutations
  mutations: {
    INCREMENT(state, payload = 1) {
      state.count += payload;
    },
    DECREMENT(state, payload = 1) {
      state.count -= payload;
    },
  },

  // Actions: Used for asynchronous operations and committing mutations.
  actions: {
    incrementAsync({ commit }, payload) {
      // Simulate an API call or other asynchronous task
      setTimeout(() => {
        commit('INCREMENT', payload);
      }, 1000);
    },
  },

  // Modules
  modules: {
    auth,
  },
});

export default store;