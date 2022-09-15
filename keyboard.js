module.exports = {
  main: [
    [
      {
        text: "Погода в Канаде",
        callback_data: "weather",
      },
    ],
    [
      {
        text: "Хочу почитать!",
        callback_data: "read",
      },
    ],
    [
      {
        text: "Сделать рассылку",
        callback_data: "spam",
      },
    ],
  ],
  sureCancel: [
    [
      {
        text: "Уверен",
        callback_data: "sure",
      },
      {
        text: "Отмена",
        callback_data: "cancel",
      },
    ]
  ],
};
