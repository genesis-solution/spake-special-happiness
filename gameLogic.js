const request = require('request');
const xml2js = require('xml2js');
const { server_url, GAMEID, TOTAL_PLAYERS } = require('./config/config');

let waitingPlayers = []; // Store players waiting to be matched
let rooms = {}; // Store game rooms
let waitingBots = [];
let disConnectedSocketPlayers = {};
let gameResult = {};

const socketIo = require('socket.io');

// Store data per room
const roomData = {};

let ioInstance;

function initializeSocket(server) {
    ioInstance = socketIo(server);
    return ioInstance;
}

function handleSocketEvents(io) {

    if (!io) {
        throw new Error('Socket.IO has not been initialized.');
    }

    io.on('connection', (socket) => {

        socket.on('joinGame', (player) => {

            console.log('New client connected');

            if (player.player.entityId != '' && !isNameTaken(player.player.entityId) && !isRoomTaken(player.player.entityId)) { // && !isNameTakenFromTotalPlayers(player.playerName)
                
                socket.playerName = player.playerName; // Store the player's name in the socket object
                socket.TokenId = player.player.TokenId;
                socket.gameID = GAMEID;
                socket.Status = player.player.Status;
                socket.betUsd = player.player.betUsd;
                socket.CountryName = player.player.CountryName;
                socket.entityId = player.player.entityId;
                socket.isBot = player.isBot; // 0 or 1

                waitingBots = [];
                waitingPlayers.push(socket);

                // Try to match players when there are at least two waiting
                if (waitingPlayers.length >= TOTAL_PLAYERS) {

                    let players = [];

                    for (let index_player = 0; index_player < TOTAL_PLAYERS; index_player++) {
                        players.push(waitingPlayers.shift());
                    }

                    //console.log(players[0].entityId, players[1].entityId)

                    const date = new Date();
                    const roomName = `Room-${date.getTime()}`;
                    console.log("created room", roomName)

                    let Obj_players = [];
                    let Token_IDs = '';
                    for (let index_player = 0; index_player < players.length; index_player++) {
                        Obj_players.push(
                            { 
                                id: players[index_player].id, 
                                name: players[index_player].playerName, 
                                username: players[index_player].playerName, 
                                playerName: players[index_player].playerName, 
                                CountryName: players[index_player].CountryName, 
                                entityId: players[index_player].entityId, 
                                TokenId: players[index_player].TokenId, 
                                gameID: players[index_player].gameID, 
                                Status: players[index_player].Status, 
                                betUsd: players[index_player].betUsd, 
                                CountryName: players[index_player].CountryName, 
                                isBot: players[index_player].isBot 
                            }
                        );

                        Token_IDs = Token_IDs + `<item xsi:type="xsd:string">`+players[index_player].TokenId+`</item>`;
                    }

                    if (Token_IDs != '')
                    try {
                        const url = server_url;
                        const func_name = "Entity_Entry_Update";
                    
                        var soapOptions = {
                          uri: url,
                          headers: {
                              'Content-Type': 'text/xml; charset=utf-8',
                              'Connection': 'keep-alive'
                          },
                          method: 'POST',
                          body: `
                            <env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="urn:Player1.Intf-IPlayer1" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:enc="http://www.w3.org/2003/05/soap-encoding" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="urn:CommonWSTypes">
                            <env:Body>
                            <ns1:Entity_Entry_Update env:encodingStyle="http://www.w3.org/2003/05/soap-encoding">
                            <TokenIds enc:itemType="xsd:string" enc:arraySize="`+TOTAL_PLAYERS+`" xsi:type="ns2:ArrayOfString">
                            `+Token_IDs+`
                            </TokenIds>
                            <gameID xsi:type="xsd:int">`+Obj_players[0].gameID+`</gameID>
                            <games_entryID xsi:type="xsd:int">0</games_entryID>
                            <NamesArray xsi:nil="true" xsi:type="ns2:ArrayOfString"/>
                            <ValuesArray xsi:nil="true" xsi:type="ns2:ArrayOfString"/></ns1:Entity_Entry_Update>
                            </env:Body>
                            </env:Envelope>
                              `
                        };
                    
                        
                        request(soapOptions, function(_err, _resp) {
                          if (_err == null) {
                            if (_resp.statusCode == 200)
                            {
                              xml2js.parseString(_resp.body, async (err, result) => {
                                if (err) {
                                    console.error('Error parsing XML response:', err);
                                    res.status(401).json({ error: 'Invalid credentials' });
                                } else {
                                  if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['NS1:'+func_name+'Response'] != undefined && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['NS1:'+func_name+'Response'].length > 0)
                                  {
                                    const resultValue = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['NS1:'+func_name+'Response'][0]['return'][0]['_'];
                                    var returnValue = JSON.parse(resultValue)
                    
                                    if (returnValue.ResultCode == 0 && returnValue.ResultMessage == 'OK') {

                                        let obj_room = {};

                                        for (let index_obj_player = 0; index_obj_player < Obj_players.length; index_obj_player++) {
                                            Obj_players[index_obj_player]['games_entryID'] = returnValue.games_entryID;
                                            Obj_players[index_obj_player]['prizeUSD'] = returnValue.prizeUSD;

                                            obj_room['player'+(index_obj_player + 1)] = Obj_players[index_obj_player];
                                        }

                                        rooms[roomName] = obj_room;
                    
                                        for (let index_obj_player = 0; index_obj_player < Obj_players.length; index_obj_player++) {
                                            players[index_obj_player].join(roomName);
                                            players[index_obj_player].emit('joinedRoom', roomName);
                                        }

                                        io.to(roomName).emit('startGamebySocket', [Obj_players, TOTAL_PLAYERS]);
                                    }
                                    else {
                                      console.log("startGamebySocket", returnValue.ResultMessage);
                                    }
                                  }
                                  else {
                                    
                                  }
                                }
                              });
                            }
                          } else {
                            console.log(_err)
                          }
                        });
                    } catch (error) {
                        console.error('start game:', error.message);
                    }
                }
                else {
                    socket.emit('userPosition', waitingPlayers.length % TOTAL_PLAYERS == 1);
                }
            } else {
                // Inform client that the name is already taken

                if (player.isBot == 0)
                {
                    console.log("already joined!", player.player.entityId)
                    socket.emit('nameTaken');
                }
            }
        });

        socket.on('joinGameForBot', (bot) => {

            console.log('New Bot connected');

            if (bot.player.entityId != '' && !isBotTaken(bot.player.entityId) && !isRoomTaken(bot.player.entityId)) {
                var virtualSocket = {};
                virtualSocket.playerName = bot.playerName; // Store the player's name in the socket object
                virtualSocket.TokenId = bot.player.TokenId;
                virtualSocket.gameID = GAMEID;
                virtualSocket.Status = bot.player.Status;
                virtualSocket.betUsd = bot.player.betUsd;
                virtualSocket.CountryName = bot.player.CountryName;
                virtualSocket.entityId = bot.player.entityId;
                virtualSocket.isBot = bot.isBot; // 0 or 1
                virtualSocket.id = socket.id + '_bot'; 

                waitingBots.push(virtualSocket);

                var countPlayers = waitingPlayers.length;
                var countBots = waitingBots.length;

                // Try to match players when there are at least two waiting
                if (countPlayers > 0 && countPlayers + countBots >= TOTAL_PLAYERS) {

                    let players = [];

                    for (let index_player = 0; index_player < countPlayers; index_player++) {
                        players.push(waitingPlayers.shift());
                    }

                    for (let index_player = 0; index_player < (TOTAL_PLAYERS - countPlayers); index_player++) {
                        players.push(waitingBots.shift());
                    }

                    const date = new Date();
                    const roomName = `Room-${date.getTime()}`;
                    console.log("created room", roomName)

                    let Obj_players = [];
                    let Token_IDs = '';
                    for (let index_player = 0; index_player < players.length; index_player++) {
                        Obj_players.push(
                            { 
                                id: players[index_player].id, 
                                name: players[index_player].playerName, 
                                username: players[index_player].playerName, 
                                playerName: players[index_player].playerName, 
                                CountryName: players[index_player].CountryName, 
                                entityId: players[index_player].entityId, 
                                TokenId: players[index_player].TokenId, 
                                gameID: players[index_player].gameID, 
                                Status: players[index_player].Status, 
                                betUsd: players[index_player].betUsd, 
                                CountryName: players[index_player].CountryName, 
                                isBot: players[index_player].isBot 
                            }
                        );

                        Token_IDs = Token_IDs + `<item xsi:type="xsd:string">`+players[index_player].TokenId+`</item>`;
                    }

                    if (Token_IDs != '')
                    try {
                        const url = server_url;
                        const func_name = "Entity_Entry_Update";
                    
                        var soapOptions = {
                          uri: url,
                          headers: {
                              'Content-Type': 'text/xml; charset=utf-8',
                              'Connection': 'keep-alive'
                          },
                          method: 'POST',
                          body: `
                            <env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="urn:Player1.Intf-IPlayer1" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:enc="http://www.w3.org/2003/05/soap-encoding" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="urn:CommonWSTypes">
                            <env:Body>
                            <ns1:Entity_Entry_Update env:encodingStyle="http://www.w3.org/2003/05/soap-encoding">
                            <TokenIds enc:itemType="xsd:string" enc:arraySize="`+TOTAL_PLAYERS+`" xsi:type="ns2:ArrayOfString">
                            `+Token_IDs+`
                            </TokenIds>
                            <gameID xsi:type="xsd:int">`+Obj_players[0].gameID+`</gameID>
                            <games_entryID xsi:type="xsd:int">0</games_entryID>
                            <NamesArray xsi:nil="true" xsi:type="ns2:ArrayOfString"/>
                            <ValuesArray xsi:nil="true" xsi:type="ns2:ArrayOfString"/></ns1:Entity_Entry_Update>
                            </env:Body>
                            </env:Envelope>
                              `
                        };
                    
                        
                        request(soapOptions, function(_err, _resp) {
                          if (_err == null) {
                            if (_resp.statusCode == 200)
                            {
                              xml2js.parseString(_resp.body, async (err, result) => {
                                if (err) {
                                    console.error('Error parsing XML response:', err);
                                    res.status(401).json({ error: 'Invalid credentials' });
                                } else {
                                  if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['NS1:'+func_name+'Response'] != undefined && result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['NS1:'+func_name+'Response'].length > 0)
                                  {
                                    const resultValue = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['NS1:'+func_name+'Response'][0]['return'][0]['_'];
                                    var returnValue = JSON.parse(resultValue)
                    
                                    if (returnValue.ResultCode == 0 && returnValue.ResultMessage == 'OK') {

                                        let obj_room = {};

                                        for (let index_obj_player = 0; index_obj_player < Obj_players.length; index_obj_player++) {
                                            Obj_players[index_obj_player]['games_entryID'] = returnValue.games_entryID;
                                            Obj_players[index_obj_player]['prizeUSD'] = returnValue.prizeUSD;

                                            obj_room['player'+(index_obj_player + 1)] = Obj_players[index_obj_player];
                                        }

                                        rooms[roomName] = obj_room;
                    
                                        for (let index_obj_player = 0; index_obj_player < Obj_players.length; index_obj_player++) {
                                            if (players[index_obj_player].isBot == 0)
                                            {
                                                players[index_obj_player].join(roomName);
                                                players[index_obj_player].emit('joinedRoom', roomName);
                                            }
                                        }

                                        io.to(roomName).emit('startGamebySocket', [Obj_players, TOTAL_PLAYERS]);
                                    }
                                    else {
                                      console.log("startGamebySocket", returnValue.ResultMessage);
                                    }
                                  }
                                  else {
                                    
                                  }
                                }
                              });
                            }
                          } else {
                            console.log(_err)
                          }
                        });
                    } catch (error) {
                        console.error('start game:', error.message);
                    }
                }
            } else {
                // Inform client that the name is already taken

                if (bot.isBot == 0)
                {
                    console.log("already joined!", player.player.entityId)
                    socket.emit('nameTaken');
                }
            }
        });

        // Handle player moves
        socket.on('move', (moveData) => {

            const roomName1 = findRoomBySocketId(socket.id);
            if (roomName1) {
                if (rooms.hasOwnProperty(roomName1)) {

                    // Find existing data with the same ID
                    if (!roomData[roomName1]) {
                        roomData[roomName1] = {};
                    }

                    if (moveData != null || moveData != '')
                    {
                        var arrMovement = moveData.split(';')
                        var key = arrMovement[0]
                        // if (!roomData[roomName1][key]) {
                        //     roomData[roomName1][key] = [];
                        // }

                        if (!gameResult[roomName1]) {
                            gameResult[roomName1] = {}
                        }
        
                        if (!gameResult[roomName1][key]) {
                            gameResult[roomName1][key] = {}
                        }
        
                        // if (moveData[key].length > 0)
                        // {
                        //     var lastItemIndex = moveData[key].length;
                            gameResult[roomName1][key] = {
                                score: arrMovement[1],
                                die: parseInt(arrMovement[3]) == 1 ? true : false
                            };
                        // }

                        // roomData[roomName1][key] = roomData[roomName1].concat(moveData[key]);
                        socket.to(roomName1).emit('opponentMove', moveData);
                    }
                }
            }
        });

        // Handle player moves
        socket.on('total_foods', (attrFoods) => {
            const roomName1 = findRoomBySocketId(socket.id);
            if (roomName1 && rooms.hasOwnProperty(roomName1)) {
                io.to(roomName1).emit('total_foods', attrFoods);
            }
        });

        // Handle player moves
        socket.on('sendEmoji', (emojiName) => {
            const roomName1 = findRoomBySocketId(socket.id);
            if (roomName1) {
                if (rooms.hasOwnProperty(roomName1)) {
                    const room = rooms[roomName1];
                    for (let index = 1; index <= TOTAL_PLAYERS; index++) {
                        if (room['player'+index].id == socket.id) {
                            io.to(roomName1).emit('sendEmoji', emojiName);
                        }
                    }
                }
            }
        });


        socket.on('giveup', (playerName) => {
            const index = waitingPlayers.findIndex(obj => obj.id == socket.id);
            if (index !== -1) {
                waitingPlayers.splice(index, 1);
            }

            const index3 = waitingPlayers.findIndex(obj => obj.id == socket.id);
            if (index3 !== -1) {
                waitingPlayers.splice(index3, 1);
            }

            const roomName1 = findRoomBySocketId(socket.id);
            if (roomName1) {
                if (!disConnectedSocketPlayers[roomName1]) { disConnectedSocketPlayers[roomName1] = []}
                disConnectedSocketPlayers[roomName1].push(socket.id)

                if (rooms.hasOwnProperty(roomName1)) {
                    const room = rooms[roomName1];
                    for (let index = 1; index <= TOTAL_PLAYERS; index++) {
                        if (room['player'+index].id == socket.id) {
                            io.to(roomName1).emit('giveup', playerName);
                        }
                    }
                }
            }
        });

        socket.on("final_result", (_result) => {
            const roomName1 = findRoomBySocketId(socket.id);

            if (roomName1) {
                if (!disConnectedSocketPlayers[roomName1]) { disConnectedSocketPlayers[roomName1] = []}
                disConnectedSocketPlayers[roomName1].push(socket.id)

                if (!gameResult[roomName1]) {
                    gameResult[roomName1] = {}
                }

                if (!gameResult[roomName1][_result.type]) {
                    gameResult[roomName1][_result.type] = {}
                }

                gameResult[roomName1][_result.type] = _result;

                if (rooms.hasOwnProperty(roomName1)) {

                    const room = rooms[roomName1];
                    let winnerID = ''
                    let isSubmitResult = true;

                    for (let index_players = 1; index_players <= TOTAL_PLAYERS; index_players++) {

                        if (room['player'+index_players].isBot == 0 && !disConnectedSocketPlayers[roomName1].includes(room['player'+index_players].id)) {
                            isSubmitResult = false;
                        }
                    }

                    if (isSubmitResult == true && gameResult[roomName1]) 
                    {

                        let final_score = 0;
                        for (const type_id in gameResult[roomName1]) {

                            if (gameResult[roomName1][type_id] && final_score <= gameResult[roomName1][type_id].score && gameResult[roomName1][type_id].die == false) {
                                winnerID = type_id;
                                final_score = gameResult[roomName1][type_id].score;
                            }

                        }

                        if (winnerID == '')
                        {
                            final_score = 0;
                            for (const type_id in gameResult[roomName1]) {

                                
                                if (gameResult[roomName1][type_id] && final_score <= gameResult[roomName1][type_id].score && gameResult[roomName1][type_id].die == true) {
                                    winnerID = type_id;
                                    final_score = gameResult[roomName1][type_id].score;
                                }
    
                            }
                        }

                        if (final_score > 0 && winnerID != '' && _result.isBot == 0) {
                          //  io.to(roomName1).emit("winner", winnerID)
                        }

                    }

                }
            }
        })

        socket.on('disconnect', () => {

            const index = waitingPlayers.findIndex(obj => obj.id == socket.id);
            if (index !== -1) {
                waitingPlayers.splice(index, 1);
            }

            const index3 = waitingPlayers.findIndex(obj => obj.id == socket.id);
            if (index3 !== -1) {
                waitingPlayers.splice(index3, 1);
            }

            const roomName1 = findRoomBySocketId(socket.id);

            if (roomName1) {

                if (!disConnectedSocketPlayers[roomName1]) { disConnectedSocketPlayers[roomName1] = []}
                disConnectedSocketPlayers[roomName1].push(socket.id)
                let isSubmitResult = true;
                if (rooms.hasOwnProperty(roomName1)) {

                    const room = rooms[roomName1];
                    let winnerID = ''

                    for (let index_players = 1; index_players <= TOTAL_PLAYERS; index_players++) {
                        if (room['player'+index_players].isBot == 1) {
                            if (winnerID != '')
                            {
                                winnerID = room['player'+index_players].entityId;
                                Player= room['player'+index_players];
                            }
                        } else {
                            if (isSubmitResult == true && !disConnectedSocketPlayers[roomName1].includes(room['player'+index_players].id)) {
                                isSubmitResult = false;
                            }
                        }

                        if (room['player'+index_players].id == socket.id) {
                            console.log("disconnected_user", room['player'+index_players].entityId)
                            io.to(roomName1).emit("disconnected_user", room['player'+index_players].entityId)
                        }
                    }

                    var strTokens = ''
                    for (let index_players = 1; index_players <= TOTAL_PLAYERS; index_players++) {
                        strTokens = strTokens + `<item xsi:type="xsd:string">`+room['player'+index_players].TokenId+`</item>`
                    }
                    
                    if (winnerID != '' && isSubmitResult == true) {
                        try {
                            const url = server_url;
                            const func_name = "Entity_Entry_Update";
                        
                            var soapOptions = {
                              uri: url,
                              headers: {
                                  'Content-Type': 'text/xml; charset=utf-8',
                                  'Connection': 'keep-alive'
                              },
                              method: 'POST',
                              body: `
                                  <env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="urn:Player1.Intf-IPlayer1" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:enc="http://www.w3.org/2003/05/soap-encoding" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="urn:CommonWSTypes">
                                  <env:Body>
                                  <ns1:`+func_name+` env:encodingStyle="http://www.w3.org/2003/05/soap-encoding">
                                  <TokenIds enc:itemType="xsd:string" enc:arraySize="`+TOTAL_PLAYERS+`" xsi:type="ns2:ArrayOfString">
                                  `+strTokens+`
                                  </TokenIds>
                                  <gameID xsi:type="xsd:int">`+GAMEID+`</gameID>
                                  <games_entryID xsi:type="xsd:int">`+Player.games_entryID+`</games_entryID>
                                  <NamesArray enc:itemType="xsd:string" enc:arraySize="1" xsi:type="ns2:ArrayOfString">
                                  <item xsi:type="xsd:string">won_EntityId</item>
                                  </NamesArray>
                                  <ValuesArray enc:itemType="xsd:string" enc:arraySize="1" xsi:type="ns2:ArrayOfString">
                                  <item xsi:type="xsd:string">`+winnerID+`</item>
                                  </ValuesArray>
                                  </ns1:Entity_Entry_Update>
                                  </env:Body>
                                  </env:Envelope>
                                  `
                            };
                            
                            request(soapOptions, function(_err, _resp) {
                              if (_err == null) {
                                if (_resp.statusCode == 200)
                                {
                                    
                                }
                                else {
                                    console.log(_resp)
                                }
                              } else {
                                console.log(_err)
                              }
                            });
                          } catch (error) {
                            console.error('Error:', error.message);
                          }
                    }
                }

                if (isSubmitResult == true)
                {
                    // Remove the room
                    if (roomData[roomName1]) delete roomData[roomName1];
                    if (disConnectedSocketPlayers[roomName1]) delete disConnectedSocketPlayers[roomName1];
                    delete rooms[roomName1];

                    io.to(roomName1).emit('playerDisconnected', roomName1);
                }
            }
        });

        socket.on('disconnect_game', () => {
            const roomName1 = findRoomBySocketId(socket.id);

            const index = waitingPlayers.findIndex(obj => obj.id == socket.id);
            if (index !== -1) {
                waitingPlayers.splice(index, 1);
            }

            const index3 = waitingPlayers.findIndex(obj => obj.id == socket.id);
            if (index3 !== -1) {
                waitingPlayers.splice(index3, 1);
            }

            console.log("roomName", roomName1)

            if (roomName1) {
                // Inform the other player in the room about disconnection
                io.to(roomName1).emit('playerDisconnected', roomName1);
                // Remove the room
                if (roomData[roomName1]) delete roomData[roomName1];
                if (disConnectedSocketPlayers[roomName1]) delete disConnectedSocketPlayers[roomName1];
                delete rooms[roomName1];
            }
        });
    });
}

function emitDataFromFirstElement(io) {
    // if (!io) {
    //     throw new Error('Socket.IO has not been initialized.');
    // }

    // // Emit events every 30ms to a specific room
    // setInterval(() => {
    //     for (const room in rooms) {
    //         if (roomData[room]) {
    //             var isFullData = false;
    //             for (let index = 0; index < TOTAL_PLAYERS; index++) {
    //                 if (roomData[room][index] && roomData[room][index].length >= 1) {
    //                     isFullData = true;
    //                     break;
    //                 }
    //             }
        
    //             if (isFullData == true) {
    //                 var _playersData = {};
        
    //                 // for (let key in roomData[room]) {
    //                 //     _playersData[key] = roomData[room][key];
    //                 //     roomData[room][key] = [];
    //                 // }
        
    //                 // io.to(room).emit('opponentMove', _playersData);
    //             }
    //         } else {
    //           // console.log(`No data in room ${room}`);
    //         }
    //     }
    // }, 1000);
}



// Helper function to find room by socket ID
function findRoomBySocketId(socketId) {
    for (const roomName in rooms) {
        if (rooms.hasOwnProperty(roomName)) {
            const room = rooms[roomName];
            for (let index = 1; index <= TOTAL_PLAYERS; index++) {
                if (room['player'+index].id == socketId) {
                    return roomName;
                }
            }
        }
    }
    return null;
  }
  
  // Helper function to check if the name is already taken
function isNameTaken(playerName) {
    for (const player of waitingPlayers) {
        if (player.entityId === playerName) {
            return true;
        }
    }
    return false;
  }

function isBotTaken(playerName) {
    for (const player of waitingBots) {
        if (player.entityId === playerName) {
            return true;
        }
    }
    return false;
  }

function isRoomTaken(playerName) {
    for (const roomName in rooms) {
      if (rooms.hasOwnProperty(roomName)) {
          const room = rooms[roomName];
          for (let index = 1; index <= TOTAL_PLAYERS; index++) {
            if (room['player'+index].entityId === playerName) {
                return true;
            }
          }
      }
    }
    return false;
  }

module.exports = { initializeSocket, handleSocketEvents, emitDataFromFirstElement};
