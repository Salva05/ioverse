export function formatFileSize(size) {
    if (size <= 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const rawSize = size / Math.pow(1024, i);

    let formattedSize;
    const remainder = rawSize - Math.floor(rawSize);
    if (remainder === 0 || remainder === 0.1 || remainder === 0.9) {
        formattedSize = Math.round(rawSize).toString();
    } else {
        formattedSize = rawSize.toFixed(1);
    }

    return `${formattedSize} ${units[i]}`;
}
