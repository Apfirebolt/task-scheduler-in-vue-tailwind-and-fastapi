import axios from "axios";
import * as types from "./authTypes";
import router from "../../../routes";

const state = {
  token: null,
  isAuthenticated: false,
  profileData: null,
};

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
    const url = "http://localhost:5000/api/auth/register";
    axios
      .post(url, payload)
      .then((response) => {})
      .catch((err) => {});
  },

  // Action for logging in user
  [types.SET_TOKEN_ACTION]: ({ commit }, payload) => {
    const url = "http://localhost:5000/api/auth/login";
    axios
      .post(url, payload)
      .then((response) => {
        commit(types.SET_TOKEN, response.data.token);
        localStorage.setItem("Token", response.data.token);
        localStorage.setItem("userId", response.data._id);
        router.push({ name: "Dashboard" });
      })
      .catch((err) => {
        console.error(err);
      });
  },

  // Log out functionality
  [types.LOG_OUT]: ({ commit }) => {
    commit(types.LOG_OUT_SUCCESS);
    try {
      localStorage.removeItem("Token");
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
