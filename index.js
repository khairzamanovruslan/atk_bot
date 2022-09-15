require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const keyboard = require("./keyboard.js");
const sequelize = require("./db");
const { User } = require("./models");
const sms = require("./sms");

const TOKEN = process.env.TOKEN;
const API_KEY = process.env.API_KEY;

const bot = new TelegramBot(TOKEN, {
  polling: true,
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log("Ошибка, к базе данных не подключились", e);
  }

  bot.onText(/\/start/, async (msg) => {
    const user = await User.findOne({
      where: {
        idUser: msg.from.id,
      },
    });
    if (!user) {
      await User.create({
        idUser: msg.from.id,
        firstName: msg.from.first_name,
        username: msg.from.username,
      });
    }

    bot.sendMessage(
      msg.chat.id,
      "Здравствуйте. Нажмите на любую интересующую Вас кнопку",
      {
        reply_markup: {
          inline_keyboard: keyboard.main,
        },
      }
    );
    return;
  });

  bot.on("callback_query", async (msg) => {
    const chatId = msg.message.chat.id;

    if (msg.data === "weather") {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=45.411171&lon=-75.69812&appid=${API_KEY}`;
      const response = await axios.get(url);
      const temp = (response.data.main.temp - 273).toFixed(1);
      const humidity = response.data.main.humidity;
      const speed = response.data.wind.speed.toFixed(1);
      const weatherCanada = `Погода в Канаде!\nТемператера: ${temp}°C\nВлажность: ${humidity}%\nСкорость ветра: ${speed}м/с`;
      await bot.sendMessage(chatId, weatherCanada);
      return;
    }

    if (msg.data === "read") {
      await bot.sendPhoto(
        chatId,
        "https://pythonist.ru/wp-content/uploads/2020/03/photo_2021-02-03_10-47-04-350x2000-1.jpg",
        { caption: sms.readSMS }
      );
      await bot.sendDocument(
        chatId,
        "./files/karmaniy_spravochnik_po_piton.zip"
      );
      return;
    }
    if (msg.data === "spam") {
      await bot.sendMessage(
        chatId,
        "Вы выбрали рассылку всем пользователям. Вы уверен что хотите это сделать?",
        {
          reply_markup: {
            inline_keyboard: keyboard.sureCancel,
          },
        }
      );
    }

    let flagSure = false;
    if (msg.data === "cancel") {
      await bot.sendMessage(chatId, "Отмена операции");
      flagSure = false;
      return;
    }

    if (msg.data === "sure") {
      await bot.sendMessage(
        chatId,
        "Введите сообщение, которое хотите отправить всем пользователям."
      );
      flagSure = true;
    }

    bot.on("message", async (msg) => {
      if (flagSure) {
        const users = await User.findAll();

        users.forEach((item) => {
          const id = item.dataValues.idUser;
          if (id !== msg.chat.id) {
            bot.sendMessage(id, msg.text);
          }
        });

        await bot.sendMessage(
          chatId,
          "Всем пользователям сообщения были отправлены!"
        );
      }
      flagSure = false;
    });
  });
};

start();
