import dnd from "./dnd";
import lookup from "./lookup";
import ping from "./ping";

const commands = [dnd, lookup, ping];

export default commands;

// Why not dynamically read command files?
// The command files themselves are read statically, and not dynamically
// at runtime. Hence, dynamically reading command files only means
// that we do not manually import every single command file.

// Dynamic imports would therefore make sense if they worked at runtime
// as then one could "hot-add" (hot-swap but without the removing part)
// commands as the bot is running. That is however not the case, and
// importing the files by discovering them in a folder lessens control
// over what is actually imported.

// One could make the argument that it's a lot of work to manually
// import every single file, or that it's possible to add or remove
// commands without making changes to other files. Yes, that is true,
// however that is not something this bot would make use of. Besides,
// unless someone is using a bare-bones text editor (such as Vim or Emacs),
// there is no additional workload as IDEs and most modern text editors
// have functionalities of automatically adding imports where needed.

// Hence, in my opinion, the benefits of manual explicit imports:
// more control, better code static analysis, ease of bundling, etc, weigh up
// the drawbacks of the approach.
