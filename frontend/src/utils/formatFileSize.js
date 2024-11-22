export function formatFileSize(size) {
    if (size <= 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const rawSize = size / Math.pow(1024, i);

    let formattedSize = rawSize % 1 === 0 ? rawSize.toString() : rawSize.toFixed(1);

    // Remove trailing ".0" if present
    if (formattedSize.includes(".0")) {
        formattedSize = formattedSize.replace(".0", "");
    }

    return `${formattedSize} ${units[i]}`;
}
