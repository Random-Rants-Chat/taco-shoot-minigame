//This script was auto generated via Gvbvdxx Mod 2 Packager, it's advised not to edit this script if you don't know what you are doing here.
(function () {
  var options = {};
  var colors = GM2Player.colors;
  //////////////////////
  //Tab options.
  document.title = "Cloud game";
  (function () {
    var link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
    link.href = "";
  })();
  //TurboWarp options.
  options.cloneLimit = false;
  options.miscLimits = true;
  options.fps = 32;
  options.fencing = true;
  options.width = 640;
  options.height = 360;
  options.warpTimer = true;
  options.enableCompiler = true;
  options.highQualityPen = true;
  //Player options.
  options.useTurbomode = false;
  options.hideCursor = false;
  options.clickToStart = false;
  //Loading screen options.
  options.loadingImage = "loadingscreen.png";
  options.progressBar = false;
  options.progressBarColors = true;
  options.project = "taco-shoot.gm2";

  //////////////////////

  var projectID = Date.now();
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("id")) {
    projectID = +urlParams.get("id");
  }
  if (urlParams.get("project")) {
    options.project = urlParams.get("project").trim()+".gm2?n=1";
  }
  var userInfo = window.UserInfo;
  if (userInfo) {
    if (userInfo.username) {
      options.username = userInfo.username;
    }
  }
  window.addEventListener("hashchange", () => {
    window.location.reload();
  });
  GM2Player.setOptions({
    fromFile: true,
    ...options
  });
  GM2Player.start(document.getElementById("Player"));

  var vm = GM2Player.runtime.vm;

  var websocketServerURL = "cloud-game-server.onrender.com";
  setInterval(async () => {
    await fetch("https://" + websocketServerURL);
  }, 5000);
  var ws = null;
  var openWs = null;
  var cloudVariables = {};

  function setCloudVar(name, value) {
    if (cloudVariables[name] !== value) {
      cloudVariables[name] = value;
      vm.postIOData("cloud", {
        varUpdate: { name, value },
      });
    }
  }

  function openconnection() {
    ws = new WebSocket("wss://" + websocketServerURL);
    openWs = null;
    ws.onclose = function () {
      ws = null;
      openconnection();
    };
    ws.onopen = function () {
      openWs = ws;
    };
    ws.onmessage = function (event) {
      var json = JSON.parse(event.data);

      if (json.command == "ready") {
        ws.send(
          JSON.stringify({
            command: "changeID",
            id: projectID,
          })
        );
      }
      if (json.command == "update") {
        setCloudVar(json.name, json.value);
      }
    };
  }
  openconnection();
  var gvbvdxxCloudProvider = {
    requestCloseConnection: function () {},
    requestOpenConnection: function () {},
    updateVariable: function (name, value) {

    var stringValue = String(value);    
    if (stringValue.length === 0) {
    } else {
      for (var i = 0; i < stringValue.length; i++) {
        var char = stringValue[i];
        if (char === '-') {
          if (i !== 0) {
            return;
          }
        } 
        else if (char < '0' || char > '9') {
          return;
        }
      }
    }
      
      /*Updates The Variable*/
      if (!openWs) {
        return;
      }
      if (cloudVariables[name] == value) { //Don't send if its already the same value.
        return;
      }
      cloudVariables[name] = value;
      openWs.send(
        JSON.stringify({
          command: "setVariable",
          name: name,
          value: value,
        })
      );
    },
  };
  GM2Player.setOptions({
    cloudProvider: gvbvdxxCloudProvider
  });
})();
