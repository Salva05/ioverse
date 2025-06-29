import axiosInstance from "./axiosInstance";

const usage = {
  get: async ({
    startTime,
    endTime,
    bucketWidth = "1d",
    models = [],
    groupBy = [],
  }) => {
    // Build a query string where each list item repeats the key
    const qs = new URLSearchParams();
    qs.append("start_time", startTime);
    qs.append("end_time", endTime);
    qs.append("bucket_width", bucketWidth);
    models.forEach((m) => qs.append("models", m));
    groupBy.forEach((g) => qs.append("group_by", g));

    const { data } = await axiosInstance.get(`/usage/?${qs.toString()}`);
    return data.results;
  },
};

export default usage;
