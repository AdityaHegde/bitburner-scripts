export const LogLevel = {
  Error: 0,
  Warn: 1,
  Info: 2,
  Debug: 3,
  Verbose: 5,
};

export const Colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  yellow: "\x1b[33m",
  black: "\x1b[30m",
  white: "\x1b[37m",
  default: "\x1b[0m",
};

export const LogLevelToColor = {
  [LogLevel.Error]: Colors.red,
  [LogLevel.Warn]: Colors.red,
  [LogLevel.Info]: Colors.yellow,
  [LogLevel.Debug]: Colors.default,
  [LogLevel.Verbose]: Colors.default,
};

export const LogFile = "log.txt";
export const ServersLogFile = "servers.txt";
export const HackFile = "hack.txt";
