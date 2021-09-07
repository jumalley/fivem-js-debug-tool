//////////////////////
/////// CONFIG ///////
//////////////////////

var DefaultCar = 'adder';

//////////////////////
//////// WAIT ////////
//////////////////////

Wait = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

//////////////////////
//// NOTIFICATION ////
//////////////////////

aNotification = function (text) {
  emit('chat:addMessage', {
    color: [85, 85, 85],
    multiline: true,
    args: ['Assynu Debug Tool: ', text],
  });
};

//////////////////////
///// CAR COMMAND ////
//////////////////////

CarCommand = function (source, args, rawCommand) {
  var x, y, z;
  [x, y, z] = GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0.0, 8.0, 0.5);

  var veh = args[0];
  if (veh == null) {
    veh = DefaultCar;
  }
  vehiclehash = GetHashKey(veh);
  RequestModel(vehiclehash);

  const Carloop = setTick(async () => {
    var waiting = 0;
    while (!HasModelLoaded(vehiclehash)) {
      console.log('Loading car model...');
      waiting += 100;
      await Wait(100);
      if (waiting > 2000) {
        asfNotification("That vehicke doesn't exist");
        break;
      }
    }
    if (HasModelLoaded(vehiclehash)) {
      console.log('Model loaded!');
      aNotification('Sucesfully spawned vehicle');
    }
    var vehicle = CreateVehicle(
      veh,
      x,
      y,
      z,
      GetEntityHeading(GetPlayerPed(-1)),
      true,
      true
    );
    TaskWarpPedIntoVehicle(GetPlayerPed(-1), vehicle, -1);
    console.log('Car spawned!');
    clearTick(Carloop);
  });
};

//////////////////////
///// DV COMMAND /////
//////////////////////

DvCommand = function () {
  var ped = GetPlayerPed(-1);
  if (DoesEntityExist(ped) && !IsEntityDead(ped)) {
    var pos = GetEntityCoords(ped);

    if (IsPedSittingInAnyVehicle(ped)) {
      var vehicle = GetVehiclePedIsIn(ped, false);

      if (GetPedInVehicleSeat(vehicle, -1) == ped) {
        DeleteGivenVehicle(vehicle, 5);
      } else {
        asfNotification("You must be in the driver's seat");
      }
    } else {
      var inFrontOfPlayer = GetOffsetFromEntityInWorldCoords(
        ped,
        0.0,
        5.0,
        0.0
      );
      var vehicle = GetVehicleInDirection(ped, pos, inFrontOfPlayer);

      if (DoesEntityExist(vehicle)) {
        DeleteGivenVehicle(vehicle, 5);
      } else {
        asfNotification('You must be near a vehicle to delete it');
      }
    }
  }
};

DeleteGivenVehicle = function (veh, timeoutMax) {
  SetEntityAsMissionEntity(veh, true, true);
  DeleteVehicle(veh);

  if (DoesEntityExist(veh)) {
    aNotification('Failed to delete vehicle');
  } else {
    aNotification('Vehicle deleted');
  }
};

GetVehicleInDirection = function (entFrom, coordFrom, coordTo) {
  var rayHandle = StartShapeTestCapsule(
    coordFrom.x,
    coordFrom.y,
    coordFrom.z,
    coordTo.x,
    coordTo.y,
    coordTo.z,
    5.0,
    10,
    entFrom,
    7
  );
  var _,
    _,
    _,
    _,
    vehicle = GetShapeTestResult(rayHandle);

  if (IsEntityAVehicle(vehicle)) {
    return vehicle;
  }
};

//////////////////////
////// DRAW TEXT /////
//////////////////////

DrawSpecText = function (text, x, y) {
  SetTextFont(4);
  SetTextProportional(0);
  SetTextScale(0.35, 0.35);
  SetTextEntry('STRING');
  AddTextComponentString(text);
  DrawText(x, y);
};

//////////////////////
///////// CTS ////////
//////////////////////

var lasttopspeed = 0;
var topspeed = 0;

ClearTopSpeed = function () {
  lasttopspeed = 0;
  topspeed = 0;
};

//////////////////////
//////// DEBUG ///////
//////////////////////

var debug = false;

EnableDebug = function () {
  if (debug) {
    debug = false;
    aNotification('Debug mode disabled');
  } else {
    debug = true;
    aNotification('Debug mode enabled');
  }
};

GetLocation = function () {
  if (GetEntityCoords(GetPlayerPed(-1))[2] < 1000) {
    location = 'Los Santos';
  } else {
    location = 'Blanie Country';
  }
  return location;
};

gettopspeed = function (speed) {
  if (speed > topspeed) {
    topspeed = speed;
    if (topspeed != null) {
      return topspeed;
    }
  }
};

GetCurrentDirection = function (h) {
  var _cdirection;
  if (337.5 < h || h < 22.5) {
    _cdirection = 'N';
  } else if (h < 67.5) {
    _cdirection = 'NE';
  } else if (h < 112.5) {
    _cdirection = 'E';
  } else if (h < 157.5) {
    _cdirection = 'SE';
  } else if (h < 202.5) {
    _cdirection = 'S';
  } else if (h < 247.5) {
    _cdirection = 'SW';
  } else if (h < 292.5) {
    _cdirection = 'W';
  } else if (h < 337.5) {
    _cdirection = 'NW';
  }
  return _cdirection;
};

const debugloop = setTick(async () => {
  while (debug) {
    // Base Player Info

    var playerPed = PlayerPedId();
    var x, y, z;
    [x, y, z] = GetEntityCoords(playerPed, true);
    var h = GetEntityHeading(playerPed);

    var rx = Math.round(x * 1000) / 1000;
    var ry = Math.round(y * 1000) / 1000;
    var rz = Math.round(z * 1000) / 1000 - 0.95;
    var rh = Math.round(h * 1000) / 1000;
    var sp = Math.round(GetEntitySpeed(playerPed) * 1000) / 1000;
    var he = GetEntityHealth(playerPed);

    if (sp <= 0) {
      sp = '0';
    }

    // Car Info
    if (IsPedInAnyVehicle(GetPlayerPed(-1), false)) {
      var currentvehicle = GetVehiclePedIsIn(GetPlayerPed(-1), false);
      var carModels = GetEntityModel(currentvehicle);
      var car = GetDisplayNameFromVehicleModel(carModels);
      var speed = GetEntitySpeed(currentvehicle) * 3.6;
      var topspeed = gettopspeed(speed);
      var weight = GetVehicleHandlingFloat(
        currentvehicle,
        'CHandlingData',
        'fMass'
      );
      var engdurability = (GetVehicleEngineHealth(currentvehicle) + 4000) / 50;
      var cardurability = GetVehicleBodyHealth(currentvehicle) / 10;
      var direction = GetCurrentDirection(h);
      var s1 = GetStreetNameAtCoord(x, y, z);
      var street = GetStreetNameFromHashKey(s1);
      var location = GetLocation();

      if (topspeed != null) {
        lasttopspeed = topspeed;
      }
    } else {
      ClearTopSpeed();
    }

    // Interior Info

    console.log(0);
    IntID = GetInteriorFromEntity(GetPlayerPed(-1));
    console.log(1);

    if (IntID != 0) {
      Rooms = GetInteriorRoomCount(IntID);
      Portals = GetInteriorPortalCount(IntID);
      RoomId = GetInteriorRoomIndexByHash(
        IntID,
        GetRoomKeyFromEntity(GetPlayerPed(-1))
      );
      console.log(5);
    }
    console.log('e');

    // Drawing all informations on screen

    DrawSpecText('~s~X:~r~ ' + rx, 0.01, 0.26);
    DrawSpecText('~s~Y:~r~ ' + ry, 0.01, 0.28);
    DrawSpecText('~s~Z:~r~ ' + rz, 0.01, 0.3);
    DrawSpecText('~s~Heading:~r~ ' + rh, 0.01, 0.32);
    DrawSpecText('~s~Speed:~r~ ' + sp, 0.01, 0.34);
    DrawSpecText('~s~Health:~r~ ' + he, 0.01, 0.36);

    if (IsPedInAnyVehicle(GetPlayerPed(-1), false)) {
      DrawSpecText('~s~Current Speed: ~r~' + Math.floor(speed), 0.01, 0.4);
      DrawSpecText('~s~Top speed: ~r~' + Math.floor(lasttopspeed), 0.01, 0.42);
      DrawSpecText('~s~Current Car: ~r~' + car, 0.01, 0.44);
      DrawSpecText('~s~Car Weight: ~r~' + weight, 0.01, 0.46);
      DrawSpecText(
        '~s~Car Durability: ~r~' + Math.floor(engdurability),
        0.01,
        0.48
      );
      DrawSpecText(
        '~s~Engine Durability: ~r~' + Math.floor(cardurability),
        0.01,
        0.5
      );
      DrawSpecText('~s~Current Direction: ~r~' + direction, 0.01, 0.52);
      DrawSpecText('~s~Current Street: ~r~' + street, 0.01, 0.54);
      DrawSpecText('~s~Current Location: ~r~' + location, 0.01, 0.56);
    }

    if (IntID != 0) {
      DrawSpecText('~s~Interior ID: ~r~' + IntID, 0.01, 0.6);
      DrawSpecText('~s~Rooms count: ~r~' + Rooms, 0.01, 0.62);
      DrawSpecText('~s~Portal count: ~r~' + Portals, 0.01, 0.64);
      DrawSpecText('~s~Current room: ~r~' + RoomId, 0.01, 0.66);
    }

    await Wait(6);
  }
  await Wait(1000);
});

//////////////////////
/////// Fix CAR //////
//////////////////////

FixCurrentCar = function () {
  var playerPed = GetPlayerPed(-1);
  if (IsPedInAnyVehicle(playerPed, false)) {
    var vehicle = GetVehiclePedIsIn(playerPed, false);
    SetVehicleEngineHealth(vehicle, 1000);
    SetVehicleEngineOn(vehicle, true, true);
    SetVehicleFixed(vehicle);
    asfNotification('Vehicle fixed');
  } else {
    asfNotification("You aren't in vehicle");
  }
};

//////////////////////
///// CLEAN CAR //////
//////////////////////

CleanCurrentCar = function () {
  var playerPed = GetPlayerPed(-1);
  if (IsPedInAnyVehicle(playerPed, false)) {
    var vehicle = GetVehiclePedIsIn(playerPed, false);
    SetVehicleDirtLevel(vehicle, 0);
    asfNotification('Vehicle fixed');
  } else {
    asfNotification("You aren't in vehicle");
  }
};
