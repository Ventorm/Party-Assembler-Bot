const { admin, adminUserName, twinkByAdmin, adminHelper, bot_username } = require("../config");
const start_time = parseInt(require("../config").start_time);
const end_time = parseInt(require("../config").end_time);

const texts = {
    chooseGame: [`Во что тебе хочется сыграть сегодня?\nМожно отметить несколько вариантов  ✅`],
    chooseTime: [`Выбери всё удобное для тебя время (по мск).\nМожно отметить несколько вариантов ✅`],
    prepareNotify: `Скоро время сбора! Успеваешь?`,
    welcome: `Добро пожаловать!\nМоя задача за несколько кликов в простых опросах организовать совместные игры для Всех моих пользователей по двум критериям:\n<b>1. </b>Время, удобное для <b><u>тебя</u></b> (в течение дня)\n<b>2. </b>Только интересующие <b><u>тебя</u></b> игры из списка\n\nНо для начала...`,
    welcomeBack: `С возвращением!\nКак и раньше, я буду присылать тебе необходимую информацию по предстоящим играм`,
    justJoined: `Кстати, на сегодня уже есть активные опросы по играм.\nОтправляю`,
    confirm: `<b>Пожалуйста, отправь мне код того, кто тебя пригласил (его можно найти в моём Меню по команде /invite)</b>`,
    allowed: `<b>Приглашение подтверждено 👍</b>\nТеперь тебе доступен весь функционал, в том числе через небольшое <b>Меню</b> (слева внизу)`,
    forButtonFullReminder: `Ниже ты можешь задать время — за сколько Минут до начала событий тебе будет поступать <code>Общее расписание с уведомлением</code> о предстоящих играх`,
    forButtonPersonalReminder: `Ниже ты можешь задать время — за сколько Минут до начала событий тебе будет поступать <code>Личное расписание с уведомлением</code> о предстоящих играх`,
    no_time_left: `<i>У тебя выбрано время, которое на сегодня уже закончилось.</i>\n\nЕсли ты можешь выбрать актуальное на сегодня время, то выбери <b>"Отменить голос"</b> в опросе времени и проголосуй повторно`,
    not_enough_players: `Нужно больше голосов — ожидаем результаты опросов от других игроков на все выбранные тобой связки Времени и Игр.\n\nРасписание беззвучно обновляется раз в минуту.\n\nУведомления о предстоящих играх поступят тебе в соответствии с твоими <u>Настройками в меню</u>`,
    incorrectly_filled_by_user: `<u>У тебя некорректно заполнены опции времени и/или игр в опросах выше, потому для Тебя Личное расписание не может быть составлено.</u>\n\nПроверка заполнения опросов раз в минуту`,
    cant_play: `Ты указал, что не можешь сыграть сегодня, потому Личное расписание не было составлено.\n\n<b>Если вдруг передумаешь — переголосуй, я покажу тебе актуальное расписание (обновляется раз в минуту)</b>`,
    cantToday: `Если передумаешь в течение дня, то кликни по опросу и выбери <b>"Отменить голос"</b>.\nПосле в нём можно будет проголосовать повторно`,
    sorry: `Извини, но этот функционал доступен только для подтверждённых пользователей.\n\n<b>Пожалуйста, пришли мне код того, кто тебя пригласил (его можно найти в моём меню по команде /invite)</b>`,
    about: `Моя задача за несколько кликов в простых опросах организовать совместные игры для Всех моих пользователей по двум критериям:\n<b>1. </b>Время, удобное для <b><u>тебя</u></b> (в течение дня)\n<b>2. </b>Только интересующие <b><u>тебя</u></b> игры из списка\n\nОтветы на опросы, при необходимости, можно менять в течение дня`,
    admin: `Любые конструктивные вопросы/предложения/проблемы по моему функционалу можно обсудить лично с моим разработчиком`,
    group: `Обсудить предстоящие игры или просто пофлудить — всё это можно сделать в группе`,
    alreadyActive: `На сегодня уже есть <b>активные опросы</b>`, 
    alreadyFinished: `Сегодня опросы уже создавали`,
    time_for_create: `Новые опросы можно создать в промежутке:\n<pre>${start_time}:00 — ${end_time}:00 (по мск)</pre>`,
    schedule_assemble: `<b>Ты можешь запланировать запуск опросов на любой день/время</b>, используя встроенный в Telegram функционал.\nДля этого введи команду <code>/assemble</code> (копируется при нажатии), затем<b>:</b>\n<u>На телефоне</u> — удерживай палец на кнопке отправки сообщения и выбери <code>"Запланировать отправку"</code>\n<u>На компьютере</u> — нажми правой кнопкой мыши по кнопке отправки сообщения и выбери <code>"Запланировать отправку"</code>`,
    too_early: `Давай не будем оповещать всех в такое время 😴`,
    too_late: `Уже слишком поздно 🌒\nПредлагаю попробовать завтра 🌤`,
    too_old: `Это сообщение слишком старое — мне уже технически не позволено его убрать`,
    invitation: `Поделись моими возможностями со своими друзьями!\n\nСсылка на мой чат:\n<b>https://t.me/${bot_username}</b>\n\nПри первом запуске с новым пользователем мне нужно получить от него <b><u>твой код</u></b> — ему достаточно скопировать и отправить его ко мне в чат\n\n<b>Твой код (копируется автоматически при нажатии):</b>\n`,
    forPollsCreator: `Принято! Создаю и рассылаю опросы...`, 
    letsPlay: {
        question: `Хочешь сыграть сегодня?`,
        answers: ['Да!', 'Без меня в этот раз'],
    },
    letsPlayRightNow: {
        question: `Предлагают собраться в ближайшие 30 минут.\nТы в деле?`,
        answers: ['Да!', 'Пас'],
    },
    numbers: {
        0: `0️⃣`,
        1: `1️⃣`,
        2: `2️⃣`,
        3: `3️⃣`,
        4: `4️⃣`,
        5: `5️⃣`,
        6: `6️⃣`,
        7: `7️⃣`,
        8: `8️⃣`,
        9: `9️⃣`,
    },
    //months: [`Январь`, `Февраль`, `Март`, `Апрель`, `Май`, `Июнь`, `Июль`, `Август`, `Сентябрь`, `Октябрь`, `Ноябрь` `Декабрь`],
    months: [`January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`],
    forAllInfoMessage: `У меня сменился адрес в Telegram.\n<u><b>Обязательно</b></u>, чтобы я смог продолжить присылать тебе информацию по играм, <b>начни общение со мной в новом чате:</b>\n<b>https://t.me/${bot_username}</b>\n\nP.S.: команды /start будет достаточно`
}


module.exports = { texts }