# <a href="https://t.me/deadly_party_bot" target="_blank">Party Manager Bot</a>

## Цели проекта
Бот планировался для решения проблемы в небольшом игровом сообществе - у всех его участников разные часовые пояса, распорядок дня, а также отличающиеся предпочтения по играм (в некоторые можно сыграть исключительно в кампании друзей), в том числе и различные настольные онлайн-игры.    
Примеры доступных игр: Tabletop Simulator, Overwatch 2, SI Game (своя игра) и другие.    
Организовывать на регулярной основе в ручном режиме всех участников - задача не из простых, т.к. нужно опросить лично более 10 человек, во что и когда они хотели бы собраться сыграть. Бот призван решить эти проблемы
____

## При разработке использовались
<p>
  <img src="https://github.com/devicons/devicon/blob/master/icons/nodejs/nodejs-original.svg" title="Node.js" alt="Node.js" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/postgresql/postgresql-original-wordmark.svg" title="PostgreSQL" alt="PostgreSQL" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/heroku/heroku-original-wordmark.svg" title="Heroku"  alt="Heroku" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/trello/trello-plain-wordmark.svg" title="Trello"  alt="Trello" width="40" height="40"/>&nbsp;
  <img src="https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg" title="Postman"  alt="Postman" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/linux/linux-original.svg" title="Linux" alt="Linux" width="40" height="40"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/docker/docker-original-wordmark.svg" title="Docker"  alt="Docker" width="40" height="40"/>&nbsp;
</p>

____
## Результат
С помощью бота его участники могут запланировать интересные им игры на нужное время без необходимости лично согласовывать все планы.    
Достаточно сделать несколько кликов в опросах и получить общую сводку голосов, где будет отображено интересное пользователю событие или же будет отображено, что время, выбранное пользователем, свободно от игр по его предпочтениям
____
## Работоспособность
Бот развёрнут в сервисе Heroku и ежедневно активен в Telegram, <a href="https://t.me/deadly_party_bot" target="_blank">ему можно написать</a> (в том числе через поиск @deadly_party_bot). Полный функционал работает только для подтверждённых пользователей    
____
## Планы по развитию проекта
1. Упаковка бота и базы данных PostgreSQL в контейнеры, используя Docker-compose, а после перенос на VPS-сервер (Linux)
2. Дополнительные улучшения для пользователей, например уменьшение нажатий в опросах, например до 1-2 и без потери функционала
3. Адаптация функционала для большого количества пользователей, чтобы система могла распределить, например, 100 и более участников
4. Расширить документацию по проекту, а именно:
    - Проблемы и задачи, которые были решены на момент разработки с указанием подходов и инструментов
    - Предоставление подробной информации об алгоритме работы
    - Перечисление доступного функционала в боте (со скриншотами)
