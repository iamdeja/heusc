export default class Command {
  #name;

  #description;

  constructor(options) {
    if (!options.name || !options.description) {
      throw new Error("Configuration options are incomplete.");
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

  execute() {
    throw new Error(`Missing execution in ${this.constructor.name}!`);
  }
}
