export default class Command {
  #name;
  #description;

  constructor(options) {
    if (!options.name || !options.description) {
      throw new Error("One of the configuration options is missing.");
    }

    this.#name = options.name;
    this.#description = options.description;
  }

  get name() {
    return this.#name;
  }

  get description() {
    return this.#description;
  }

  execute(message, args) {
    throw new Error(`Run function not overwritten in ${this.constructor.name}`);
  }
}
