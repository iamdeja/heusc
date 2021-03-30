export const formatUpdatePCQuery = (rawObject) => {
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
      case "img":
        options.pictureURL = value;
    }
  }

  return options;
};

export const formatUpdateLocationQuery = (rawObject) => {
  const options = {};

  for (const [option, argument] of Object.entries(rawObject)) {
    const value = argument.charAt(0).toUpperCase() + argument.slice(1);

    // eslint-disable-next-line default-case
    switch (option) {
      // The name is mandatory!
      case "name":
        options.name = value ?? "[placeholder]";
        break;
      case "img":
        options.pictureURL = value;
        break;
      case "desc":
        options.description = value;
        break;
    }
  }

  return options;
};
