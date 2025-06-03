const { ManagementService } = await load("js/service.js");
await load("js/socket.io.js");

await daemon.serviceHost.stopService("ArcMacMgmtSvc");
daemon.serviceHost.Services.update((v) => {
  v.set("ArcMacMgmtSvc", ManagementService);
  return v;
});

await daemon.serviceHost.startService("ArcMacMgmtSvc");
