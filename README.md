# [Party Assembler Bot](https://t.me/party_assembler_bot)

## **Цель проекта**
Автоматизация организации игровых мероприятий для участников сообщества, учитывая при этом часовые пояса, личные планы и предпочтения по играм каждого пользователя — без необходимости лично в ручном режиме опрашивать и координировать более 10 человек.    
Примеры организуемых игр: SI Game, Overwatch, Tabletop Simulator и другие
____

## **Стек технологий**
  <img src="https://github.com/devicons/devicon/blob/master/icons/nodejs/nodejs-original.svg" title="Node.js" alt="Node.js" width="20" height="20"/>&nbsp;   **Node.js**    
  <img src="https://github.com/devicons/devicon/blob/master/icons/postgresql/postgresql-original-wordmark.svg" title="PostgreSQL" alt="PostgreSQL" width="20" height="20"/>&nbsp;   **PostgreSQL**    
  <img src="https://github.com/devicons/devicon/blob/master/icons/heroku/heroku-original-wordmark.svg" title="Heroku"  alt="Heroku" width="20" height="20"/>&nbsp;   **Heroku**    
  <img src="https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg" title="Postman"  alt="Postman" width="20" height="20"/>&nbsp;   **Postman**      
  <img src="https://github.com/devicons/devicon/blob/master/icons/trello/trello-plain-wordmark.svg" title="Trello"  alt="Trello" width="20" height="20"/>&nbsp;   **Trello**    
  <img src="https://github.com/devicons/devicon/blob/master/icons/docker/docker-original-wordmark.svg" title="Docker"  alt="Docker" width="20" height="20"/>&nbsp;   **Docker**    
  <img src="https://github.com/devicons/devicon/blob/master/icons/linux/linux-original.svg" title="Linux" alt="Linux" width="20" height="20"/>&nbsp;   **Linux**  
____

## **Статус проекта**
Бот развёрнут на платформе Heroku, а [написать боту в Telegram](https://t.me/party_assembler_bot) можно в любое время, в том числе найдя его через поиск ___@party_assembler_bot___   
____

## **Функционал**
При начале общения с новым пользователем бот запрашивает и ожидает реферальный код для активации полного функционала, перечисленного ниже

### ___Ввод команд___
Команды боту можно отправлять через кнопки в ___**Меню**___ бота или ручным вводом    
<img src="https://user-images.githubusercontent.com/107767949/202308290-255f6946-fdb3-4b06-8fd3-61cadbb1b364.png" width="45%">

### ___Опросы___
Бот позволяет участникам по команде ___/assamble___ запустить опросы по игровым мероприятиям, которые автоматически рассылаются всем пользователям.     
Опросы заполняются в несколько кликов и позволяют пользователю выбрать интересующие его время и игры на сегодня.    
    
Примечание:
- Можно изменять свой голос в опросах до конца дня    
- Запустить опросы можно только в промежутке с 9:00 по 22:00 по мск 
- Опросы автоматически завершаются при наступлении 22:30 по мск

#### ____Заполнение опросов____
Изначально бот присылает только Первый опрос - готовность.    
При положительном ответе выдаётся Второй опрос - выбор игр.    
После заполнения Второго опроса выдаётся последний Третий опрос - выбор времени    
<details> 
  <summary>Примеры всех опросов после заполнения пользователем </summary>
  Первый опрос - готовность<br>
  <img src="https://user-images.githubusercontent.com/107767949/202302735-d5133803-58ee-49bf-8295-3d25f6c23082.png" width="40%"><br>
  Второй опрос - выбор игры<br>
  <img src="https://user-images.githubusercontent.com/107767949/202302761-183a9807-eaa8-4a61-abe3-2c434d0da794.png" width="40%"><br>
  Третий опрос - выбор времени<br>
  <img src="https://user-images.githubusercontent.com/107767949/202302792-3c8683fa-c9bf-4bae-a87d-4475bb7905c5.png" width="40%">
</details>


### ___Расписание на сегодня___
Каждый голосующий в опросах влияет на итоговый результат. После заполнения опросов пользователь получает 2 расписания:    
- Личное — отображает информацию только по мероприятиям, которые планируются на выбранные пользователем время и игры
- Общее — отображает все мероприятия, вне зависимости от личных предпочтениях, указанных в опросах
<details> 
  <summary>Примеры расписаний </summary>
  <img src="https://user-images.githubusercontent.com/107767949/202303455-4e9cf6fa-3d5d-4373-bfd1-1dfb5d090bd7.png" width="35%"><br>
  <img src="https://user-images.githubusercontent.com/107767949/202303468-11030a77-661e-4687-9d51-f6ed76b57f56.png" width="35%"><br>
</details>

Расписания обновляются беззвучно каждую минуту.    
Перед началом мероприятия пользователям поступает уведомление о предстоящем событии, если включены соответствующие Настройки

### ___Настройки___
По команде ___/settings___ для пользователей доступны личные настройки, позволяющие:
- Отключить/включить личное/общее расписание
- Изменить время и отображение уведомлений по предстоящим играм

<details> 
  <summary>Пример окна настроек </summary>
  <img src="https://user-images.githubusercontent.com/107767949/202306435-cb7ed686-6242-4d6c-b6cc-506af30dbbe0.png" width="60%"><br>
  <img src="https://user-images.githubusercontent.com/107767949/202306485-e323370e-851c-4711-b7ec-be3a0f09015f.png" width="60%"><br>
</details>

### ___Приглашения___
С помощью команды ___/invite___ можно предоставлять полный доступ к боту другим пользователям Telegram.    
Для подтверждения используется личный автоматически генерируемый код.
<details> 
  <summary>Пример приглашения </summary>
  <img src="https://user-images.githubusercontent.com/107767949/202312540-650d2c84-591c-4004-ba51-fd7bab605dcc.png" width="60%"><br>
</details>

____
## **Планы по развитию проекта**
1. Упаковка бота и базы данных PostgreSQL в контейнеры, используя Docker-compose, а после перенос на VPS-сервер (Linux)
2. Дополнительные улучшения для пользователей, например уменьшение нажатий в опросах до 1-2 и без потери функционала
3. Адаптация функционала для большого количества пользователей, чтобы система могла удобно и логично распределить, например, 100 и более участников
4. Расширить документацию по проекту, а именно:
    - Проблемы и задачи, которые были решены на момент разработки с указанием подходов и инструментов
    - Предоставление подробной информации об алгоритме работы
