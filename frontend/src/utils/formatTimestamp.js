import { format } from "date-fns";
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return `Created ${format(date, "MMM d, yyyy, h:mm a")}`;
};

export default formatTimestamp;
