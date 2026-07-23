const csvCell = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<unknown>>
) {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function datedFilename(prefix: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.csv`;
}
