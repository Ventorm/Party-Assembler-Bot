const MoscowGMT = parseInt(require("../config").MoscowGMT);

const createDateFromGMT = function (targetGMT = MoscowGMT) {
  const nowServerHours = new Date().getHours();
  const nowLocal = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
  const nowLocalHours = parseInt(nowLocal.split(", ")[1].split(":")[0]);

  let now = new Date();
  if (nowLocalHours !== nowServerHours) {
    now.setHours(now.getHours() + targetGMT);
  }
  return now;
};
console.log(createDateFromGMT(3))

module.exports = { createDateFromGMT };
