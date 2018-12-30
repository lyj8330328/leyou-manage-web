import Vue from 'vue'

Vue.prototype.verify = function () {
  return this.$http.get("/auth/verify")
};
