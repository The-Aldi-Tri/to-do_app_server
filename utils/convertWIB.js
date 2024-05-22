function convertDateTimeToWIB(dateTime) {
  // WIB: Waktu Indonesia bagian Barat => GMT+7
  const [date, time] = dateTime
    .toLocaleString("en-GB", { timeZone: "Asia/Jakarta" })
    .replace(",", "")
    .split(" ");
  const revDate = date.split("/").reverse().join("/");
  return `${revDate} ${time} WIB`;
}

module.exports = convertDateTimeToWIB;
