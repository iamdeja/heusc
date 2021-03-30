// eslint-disable-next-line import/prefer-default-export
export const formatPCUpdateQuery = (rawObject) => {
  const options = {};

  for (const [option, argument] of Object.entries(rawObject)) {
    const value = argument.charAt(0).toUpperCase() + argument.slice(1);

    // Invalid options are simply dropped.
    // eslint-disable-next-line default-case
    switch (option) {
      case "name":
        options.name = value;
        break;
      case "race":
        options.race = value;
        break;
      case "class":
        options.class = value;
        break;
      case "bio":
        options.bio = value;
        break;
      case "image":
      case "pic":
        options.pictureURL = value;
    }
  }

  return options;
};
