settings = {
  'agent_num': 10000,
  'v_range': 2,
  'grid_width': 512
}



const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let spores = [];



class Spore {
  constructor(theX, theY, theSize) {
    this.x = theX;
    this.y = theY;
    this.size = theSize;
    this.intensity = 255;

    ctx.fillStyle = `rgb(0, ${this.intensity / 1.5}, ${this.intensity})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    this.intensity -= 5;
  }
}



const reloadCells = () => {
  spores.forEach(element => {
    element.update();
  })

  if (spores.length > 150000) {
    spores = spores.slice(spores.length - 150000, spores.length);
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, 5000, 5000);
}



class Agent {
    constructor(startVx, startVy, size) {
      this.vX = startVx;
      this.vY = startVy;
      this.cellSize = height / size;
      this.xPos = randInt(size)*(width / size);
      this.yPos = randInt(size)*this.cellSize;
    }

    spreadSpores() {
      spores.push(new Spore(this.xPos, this.yPos, this.cellSize));
    }

    move() {
      if ((Math.round(this.xPos + this.vX) >= (width) - 1) || (Math.round(this.xPos + this.vX) <= 0)) {
        this.vX *= -1;
      } else if ((Math.round(this.yPos + this.vY) >= (height) - 1) || (Math.round(this.yPos + this.vY) <= 0)) {
        this.vY *= -1;
      }

      this.xPos += this.vX*this.cellSize;
      this.yPos += this.vY*this.cellSize;

      this.spreadSpores();
    }
}



const randInt = (max) => {
  return Math.floor(Math.random() * max)
}

const init = () => {

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
    
  let agents = [];
  
  for (let i = 0; i < settings['agent_num']; i++) {
    let vx = Math.random()*settings['v_range'] - settings['v_range']/2;
    agents.push(new Agent(vx, settings['v_range']-vx, settings['grid_width']));
  }

  agents.forEach(element => {
    element.spreadSpores();
  });

  setInterval(() => {
    agents.forEach(element => {
      element.move();
    });
    reloadCells();
  }, 0);
}

init();
