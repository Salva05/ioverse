import axiosInstance from "./axiosInstance";
import config from "../config";

const adminKey = {
  set: (key) =>
    axiosInstance
      .patch(
        "/account/admin-key/",
        { admin_key: key },
        { baseURL: config.VITE_BASE_DOMAIN_URL } // override, default is /api
      )
      .then((r) => r.data),
};

export default adminKey;
