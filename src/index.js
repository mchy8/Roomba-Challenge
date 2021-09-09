//test cases
let testInputs = [
  {
    input: `7 10
1 2
1 0
2 2
2 3
NNESEESWNWW`,
    output: { position: { x: 1, y: 3 }, count: 1 },
  },
  {
    input: `8 8
1 4
2 0
2 3
4 3
NNEEWWWWSSNWE`,
    output: { position: { x: 1, y: 5 }, count: 0 },
  },
];
async function runTestCases(testCases) {
  for (let { input, output } of testCases) {
    let testOutput = await interpretFile(input);
    if (
      output.count !== testOutput.count ||
      output.position.x !== testOutput.position.x ||
      output.position.y !== testOutput.position.y
    ) {
      console.log('Test Case Failed', input);
    }else{
      console.log('Test Case Succeeded');
    }
  }
}

// runTestCases(testInputs);
//run uploaded contents of input.txt
function runInput(){
  interpretFile(document.getElementById("input").value)
}
// top level program to run the file
async function interpretFile(file) {
  const delayed = document.getElementById("delay").checked;
  //defining inputs from file
  const [roomDims, startPos, ...temp] = file.split("\n");
  const dirtLocations = temp.slice(0, temp.length - 1);
  const instructions = temp[temp.length - 1].split("").map(translateDirection);
  //roomba object
  let roomba = { position: parseLocation(startPos), count: 0 };
  let dirtPiles = initializeGrid(parseLocation(roomDims), dirtLocations);
  //draws initial roomba at starting position and considers if dirt pile is at that position
  updateRoomba(roomba, { x: 0, y: 0 }, dirtPiles);

  //run each direction
  for (let instruction of instructions) {
    await new Promise((r) => setTimeout(r, delayed?500:0));
    updateRoomba(roomba, instruction, dirtPiles);
  }
  //final position
  console.log(serializeLocation(roomba.position));
  //final dirt patch count
  console.log(roomba.count);
  //for testing
  return roomba;
}

// Execute a single move instruction
function updateRoomba(roomba, nextMove, dirtPiles) {
  //clear previous roomba position
  document.getElementById(serializeLocation(roomba.position)).innerHTML = "";
  //clamping new roomba position to room dimensions
  roomba.position.x = Math.min(
    Math.max(nextMove.x + roomba.position.x, 0),
    dirtPiles.dimensions.x - 1
  );
  roomba.position.y = Math.min(
    Math.max(nextMove.y + roomba.position.y, 0),
    dirtPiles.dimensions.y - 1
  );
  const serializedLocation = serializeLocation(roomba.position);
  //display current roomba position
  document.getElementById(serializedLocation).innerHTML =
    '<img src="roomba.jpg">';

  if (dirtPiles.piles[serializedLocation]) {
    roomba.count++;
    delete dirtPiles.piles[serializedLocation];
  }
}

// Populate room, dirt pile object and insert images into HTML
function initializeGrid(dimensions, dirtLocations) {
  let str = "";
  for (let y = 0; y < dimensions.y; y++) {
    let row = "";
    for (let x = 0; x < dimensions.x; x++) {
      //building table top down, but zero index bottom up
      row += `<td id="${x} ${dimensions.y - y - 1}"></td>`;
    }
    str += "<tr>" + row + "</tr>";
  }
  document.getElementById("grid").innerHTML = str;

  let dirtPiles = {
    dimensions,
    piles: {},
  };
  for (let dirtLocation of dirtLocations) {
    dirtPiles.piles[dirtLocation] = true;
    document.getElementById(dirtLocation).innerHTML = '<img src="dirt.png">';
  }
  return dirtPiles;
}

function parseLocation(location) {
  let [x, y] = location.split(" ");
  return { x: parseInt(x), y: parseInt(y) };
}
function serializeLocation(location) {
  return `${location.x} ${location.y}`;
}
function translateDirection(direction) {
  if (direction === "N") return { x: 0, y: 1 };
  else if (direction === "S") return { x: 0, y: -1 };
  else if (direction === "E") return { x: 1, y: 0 };
  else if (direction === "W") return { x: -1, y: 0 };
}
