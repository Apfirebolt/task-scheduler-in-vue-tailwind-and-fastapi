import axios from "axios";
import * as types from "./authTypes";
import router from "../../../routes";

const state = {
  token: null,
  loading: false,
  isAuthenticated: false,
  profileData: null,
};

const apiUrl = "http://localhost:8000/api/auth";

const getters = {
  [types.GET_TOKEN]: (state) => state.token,
  [types.IS_USER_AUTHENTICATED]: (state) => state.isAuthenticated,
  [types.GET_PROFILE_DATA]: (state) => state.profileData,
};

const mutations = {
  [types.SET_TOKEN]: (state, payload) => {
    state.token = payload;
    state.isAuthenticated = true;
  },
  [types.LOG_OUT_SUCCESS]: (state) => {
    state.token = null;
    state.isAuthenticated = false;
    state.profileData = null;
  },
  [types.SET_PROFILE_DATA]: (state, payload) => {
    state.profileData = payload;
  },
};

const actions = {
  [types.REGISTER_USER]: ({ commit }, payload) => {
    const url = `${apiUrl}/register`;
    commit(types.SET_LOADING, true);
    try {
      axios.post(url, payload).then((response) => {
        commit(types.SET_LOADING, false);
        router.push({ name: "Login" });
      });
    } catch (err) {
      commit(types.SET_LOADING, false);
      console.error(err);
    }
  },

  // Action for logging in user
  [types.SET_TOKEN_ACTION]: ({ commit }, payload) => {
    const url = `${apiUrl}/login`;
    try {
      axios.post(url, payload).then((response) => {
        const token = response.data.access_token;
        commit(types.SET_TOKEN, token);
        commit(types.SET_PROFILE_DATA, response.data.user);
        try {
          localStorage.setItem("Token", token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } catch (err) {
          console.error(err);
        }
        router.push({ name: "Home" });
      });
    } catch (err) {
      console.error(err);
    }
  },

  // Log out functionality
  [types.LOG_OUT]: ({ commit }) => {
    commit(types.LOG_OUT_SUCCESS);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
    } catch (err) {
      console.error(err);
    }
    router.push({ name: "Login" });
  },

  // Action to check if the user is authenticated once user refreshes the page.
  [types.CHECK_USER_AUTHENTICATION]: ({ commit }) => {
    try {
      const storedToken = localStorage.getItem("Token");
      if (storedToken) {
        commit(types.SET_TOKEN, storedToken);
      }
    } catch (err) {
      console.error(err);
    }
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
