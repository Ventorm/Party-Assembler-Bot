# [Party Manager Bot](https://t.me/deadly_party_bot)

## Цель проекта
Бот задумывался для решения проблемы сборов в небольшом игровом сообществе, у участников которого различные часовые пояса, планы в течение дня и предпочтения по играм.    
Необходимо было существенно упростить организацию сборов без необходимости опрашивать лично в ручном режиме более 10 человек
____

## Технологический стек
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
## Функционал
С помощью бота его участники могут запланировать интересные им игры на нужное время без необходимости лично согласовывать все планы друг с другом.    
Пользователь за несколько кликов заполняет опросы на сегодняшний день. В результате ему выдаётся сводка по голосам, где отображается персональное расписание игр на сегодня, исходя из предпочтений всех участников опросов
____
## Действующий статус
[Написать боту в Telegram](https://t.me/deadly_party_bot) можно в любое время, в том числе найдя его через поиск ___@deadly_party_bot___.    
Полноценный функционал работает только для подтверждённых пользователей.    
На данный момент бот развёрнут на платформе Heroku    
____
## Планы по развитию проекта
1. Упаковка бота и базы данных PostgreSQL в контейнеры, используя Docker-compose, а после перенос на VPS-сервер (Linux)
2. Дополнительные улучшения для пользователей, например уменьшение нажатий в опросах до 1-2 и без потери функционала
3. Адаптация функционала для большого количества пользователей, чтобы система могла удобно и логично распределить, например, 100 и более участников
4. Расширить документацию по проекту, а именно:
    - Проблемы и задачи, которые были решены на момент разработки с указанием подходов и инструментов
    - Предоставление подробной информации об алгоритме работы
