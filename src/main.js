// #unsafe
if (!navigator.userAgent.toLowerCase().includes("electron")) return;

const { ManagementService } = await load("js/service.js");
await load("js/socket.io.js");

await serviceHost.stopService("ArcMacMgmtSvc");
serviceHost.Services.update((v) => {
  v.set("ArcMacMgmtSvc", ManagementService);
  return v;
});

await serviceHost.startService("ArcMacMgmtSvc");
