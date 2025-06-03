class ManagementServiceProcess extends BaseService {
  status = Store({
    volume: 0,
    muted: true,
    brightness: {
      device: "",
      className: "",
      current: 0,
      percent: 0,
      max: 0,
    },
  });

  constructor(handler, pid, parentPid, name, host) {
    super(handler, pid, parentPid, name, host);
  }

  async start() {
    this.Log("Starting");
    if (this.client) {
      this.Log("Disconnecting existing client");

      this.client?.disconnect();
      this.client = undefined;
    }

    this.Log("Connecting Socket.IO");
    this.client = io("http://localhost:8291", {
      transports: ["websocket"],
    });
    this.client.on("disconnect", () => {
      this.Log("Connection lost! Reconnecting...");
      this.start();
    });

    this.client.on("sys-status", (status) => {
      this.Log("Got client status");
      this.status.set(status);
    });

    this.client.on("exec-success", (fullName, result) => {
      this.Log(`Execution succeeded for ${fullName}. RESULT=${result}`);
    });

    this.client.on("exec-error", (fullName, e) => {
      daemon.sendNotification({
        title: "System management protocol",
        message: `Failed to execute command '${fullName}': ${JSON.stringify(
          e
        )}`,
        timeout: 3000,
        image: icons.ErrorIcon,
      });

      console.log(e);
    });
  }

  brightnessUp() {
    this.Log("Brightness up");
    this.client.emit("brightness-up");
  }

  brightnessDown() {
    this.Log("Brightness down");

    this.client.emit("brightness-down");
  }

  brightnessSet(brightness) {
    this.Log("Brightness to " + brightness);

    this.client.emit("brightness-set", brightness);
  }

  volumeUp() {
    this.Log("Volume up");

    this.client.emit("sound-volume-up");
  }

  volumeDown() {
    this.Log("Volume down");

    this.client.emit("sound-volume-down");
  }

  setVolume(volume) {
    this.Log("Volume to " + volume);

    this.client.emit("sound-set-volume", volume);
  }

  mute() {
    this.Log("Volume mute");

    this.client.emit("sound-volume-mute");
  }

  sleep() {
    this.Log("Sleep");

    this.client.emit("power-suspend");
  }

  async stop() {
    this.client?.disconnect();
  }
}

/** @type {Service} */
const ManagementService = {
  name: "ArcMac Management",
  description: "System management protocol",
  initialState: "started",
  process: ManagementServiceProcess,
};

return { ManagementService, ManagementServiceProcess };
