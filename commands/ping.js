const ping = {
  name: "ping",
  execute: async (message) => {
    message.channel.send("Pong");
  },
};

export default ping;
