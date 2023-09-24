settings = {
    'agent_num': 5000,
    'v_range': 3,
    'grid_width': 512,

    'range': 100,
    'max_check': 15,

    'trail_intensity': 0.975, // recomended 0 or 0.975

    'teams': 5, // max teams is 5
    'comingle': false,

    'colors': [
      `rgb(0, ${255 / 1.5}, 255)`,
      `rgb(${255 / 1.5}, 0, 255)`,
      `rgb(255, 255, 0)`,
      `rgb(255, 0, 0)`,
      `rgb(0, 255, 0)`
    ]
  }

const reloadSettings = () => {
  settings['trail_intensity'] = document.getElementById('trail').value;
  settings['v_range'] = document.getElementById('velocity').value;
  settings['range'] = document.getElementById('range').value;
  settings['comingle'] = !document.getElementById('mingle').checked;
}



let agents = [];

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const width = 0.8*window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let intervalID;



const reloadCells = () => {
  ctx.fillStyle = `rgba(10, 9, 24, ${(1 - settings['trail_intensity'])*(settings['v_range'])*0.8})`;
  ctx.fillRect(0, 0, 5000, 5000);
}



class Agent {
    constructor(startVx, startVy, size, type) {
      this.vX = startVx;
      this.vY = startVy;
      this.cellSize = height / size;
      this.used = false;
      this.type = type;
      this.xPos = randInt((width/settings['teams'])) + (width/settings['teams'])*(this.type);
      this.yPos = randInt(size)*(height / size);
    }

    spreadSpores() {
      ctx.strokeStyle = settings['colors'][this.type];
      ctx.fillStyle = settings['colors'][this.type];
      
      ctx.beginPath();
      ctx.moveTo(this.xPos - this.vX*this.cellSize**settings['v_range'], this.yPos - this.vY*this.cellSize**settings['v_range']);
      ctx.lineTo(this.xPos, this.yPos);
      ctx.closePath();
      ctx.stroke();
    }

    move() {
      // variable declaration
      let totalX = 0;
      let totalY = 0;
      let count = 0;

      // finds total x and y velocity components
      for (let i = 0; i < agents.length; i++) {
        if (count > settings['max_check']) {
          break;
        } else if (agents[i].type != this.type) {
          continue;
        }

        let element = agents[i];

        if (Math.round(Math.sqrt((this.xPos - element.xPos)**2 + (this.yPos - element.yPos)**2)) <= settings['range']*this.cellSize) {
          let dx = element.xPos - this.xPos;
          let dy = element.yPos - this.yPos;

          let dMagnitude = Math.sqrt(dx**2 + dy**2);

          if (element.type === this.type) {
            totalX += element.vX*(settings['range'] - dMagnitude)/settings['range'];
            totalY += element.vY*(settings['range'] - dMagnitude)/settings['range'];
            count++;
          }
        }
      }

      // normalizes vectors and redistributes velocities
      if (count > 0) {
        totalX /= count;
        totalY /= count;

        // vector normalization done with chatGPT (because I forgot how to math)
        let magnitude = Math.sqrt(this.vX**2 + this.vY**2);
        let avgMagnitude = Math.sqrt(totalX**2 + totalY**2);

        let vFX = this.vX;
        let vFY = this.vY;

        vFX = totalX * magnitude / avgMagnitude;
        vFY = totalY * magnitude / avgMagnitude;

        this.vX = vFX;
        this.vY = vFY;

        magnitude = Math.sqrt(this.vX**2 + this.vY**2);
      }

      // Collisions
      if (!settings['comingle']) {
        if (Math.round(this.xPos + 10*this.vX) <= (width/settings['teams'])*(this.type)) {
          this.vX = Math.abs(Math.sqrt(this.vX**2 + this.vY**2));
          this.vY = 0;
        } else if (Math.round(this.xPos + 10*this.vX) >= ((width/settings['teams'])) + (width/settings['teams'])*(this.type)) {
          this.vX = -Math.abs(Math.sqrt(this.vX**2 + this.vY**2));
          this.vY = 0;
        }
      } else {
        if ((Math.round(this.xPos + this.vX) >= (width) - 1)) {
          this.vX = -Math.abs(this.vX);
        } else if ((Math.round(this.xPos + this.vX) <= 1)) {
          this.vX = Math.abs(this.vX);
        }
      }

      if (this.yPos + 10*this.vY < 1) {
        this.vY = Math.abs(this.vY);
      } else if (this.yPos + 10*this.vY > height - 1) {
        this.vY = -Math.abs(this.vY);
      }

      this.xPos += this.vX*this.cellSize*settings['v_range'];
      this.yPos += this.vY*this.cellSize*settings['v_range'];

      this.spreadSpores();
    }
}



const randInt = (max) => {
  return Math.floor(Math.random() * max)
}

const reset = () => {
  clearInterval(intervalID);
  agents = [];
  init();
}

const play = () => {
  if (!intervalID) {
    intervalID = setInterval(() => {
      reloadCells();

      reloadSettings();
      
      agents.forEach(element => {
        element.move();
      });
    }, 10);
  }
}

const init = () => {

  settings['teams'] = document.getElementById('teams').value;
  settings['agent_num'] = document.getElementById('agent-num').value;
  intervalID = null;

  ctx.fillStyle = 'rgb(10, 9, 24)';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < settings['agent_num']; i++) {
    let vx = 2*Math.random() - 1;
    let vy = 2*Math.random() - 1;
    let team = randInt(settings['teams']);

    agents.push(new Agent(vx, vy, settings['grid_width'], team));
  }

  agents.forEach(element => {
    element.spreadSpores();
  });
}

init();
