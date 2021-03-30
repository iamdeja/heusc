// eslint-disable-next-line import/prefer-default-export
export const parseArguments = (args) => {
  const options = {};
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (arg[0] !== "-" && arg[1] !== "-") return null;

    const values = [];
    while (args[i + 1] && args[i + 1][0] !== "-") {
      i += 1;
      values.push(args[i]);
    }

    options[arg.slice(2)] = values.join(" ");
  }
  return options;
};
