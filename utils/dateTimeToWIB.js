const dateTimeToWIB = (dateTime) => {
  // WIB: Waktu Indonesia bagian Barat => GMT+7
  const [date, time] = dateTime
    .toLocaleString("en-GB", { timeZone: "Asia/Jakarta" })
    .replace(",", "")
    .split(" ");
  const revDate = date.split("/").reverse().join("/");
  return `${revDate} ${time} WIB`; // output format: "YYYY/MM/DD HH:mm:ss WIB"
};

module.exports = dateTimeToWIB;
