const os = require("node:os");

if (process.platform === "win32") {
  if (typeof process.geteuid !== "function") {
    Object.defineProperty(process, "geteuid", {
      configurable: true,
      value: () => process.pid,
    });
  }

  try {
    os.userInfo();
  } catch {
    Object.defineProperty(os, "userInfo", {
      configurable: true,
      value: () => ({
        username: process.env.USERNAME ?? "windows-user",
        uid: -1,
        gid: -1,
        shell: null,
        homedir: process.env.USERPROFILE ?? process.cwd(),
      }),
    });
  }
}
