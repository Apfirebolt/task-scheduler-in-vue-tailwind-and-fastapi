import axios from "axios";
import * as types from "./authTypes";
import router from "../../../routes";
import Cookie from "js-cookie";

const state = {
  loading: false,
  isAuthenticated: (() => {
    try {
      const userData = Cookie.get("user");
      return userData ? true : false;
    } catch (err) {
      return false;
    }
  })(),
  profileData: (() => {
    try {
      const userData = Cookie.get("user");
      return userData ? JSON.parse(userData) : null;
    } catch (err) {
      return null;
    }
  })(),
  profile: null,
};

const apiUrl = "http://localhost:8000/api/auth";

const getters = {
  [types.IS_USER_AUTHENTICATED]: (state) => state.isAuthenticated,
  [types.GET_PROFILE_DATA]: (state) => state.profileData,
  [types.GET_PROFILE]: (state) => state.profile,
};

const mutations = {
  [types.LOG_OUT_SUCCESS]: (state) => {
    state.isAuthenticated = false;
    state.profileData = null;
  },
  [types.SET_PROFILE_DATA]: (state, payload) => {
    state.profileData = payload;
  },
  [types.SET_PROFILE_API]: (state, payload) => {
    state.profile = payload;
  }
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
  [types.SET_PROFILE_DATA]: ({ commit }, payload) => {
    const url = `${apiUrl}/login`;
    try {
      axios.post(url, payload).then((response) => {
        commit(types.SET_PROFILE_DATA, response.data);
        try {
          // store complete response in cookies
          Cookie.set("user", JSON.stringify(response.data));
        } catch (err) {
          console.error(err);
        }
        router.push({ name: "Home" });
      });
    } catch (err) {
      console.error(err);
    }
  },

  // Action for logging in user
  [types.GET_PROFILE_API_ACTION]: ({ commit, state }) => {
    const url = `${apiUrl}/profile`;
    try {
      const token = state.profileData?.access_token;
      axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
        commit(types.SET_PROFILE_API, response.data);
      });
    } catch (err) {
      console.error(err);
    }
  },

  // Log out functionality
  [types.LOG_OUT]: ({ commit }) => {
    commit(types.LOG_OUT_SUCCESS);
    try {
      Cookie.remove("user");
    } catch (err) {
      console.error(err);
    }
    router.push({ name: "Login" });
  },

  // Action to check if the user is authenticated once user refreshes the page.
  [types.CHECK_USER_AUTHENTICATION]: ({ commit }) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        commit(types.SET_PROFILE_DATA, JSON.parse(storedUser));
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
