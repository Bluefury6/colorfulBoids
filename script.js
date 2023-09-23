settings = {
    'agent_num': 3000,
    'v_range': 1,
    'grid_width': 256,
    'max_trail': 0,
    'range': 50,
    'range_cutoff': 2,
    'bounce': true,
    'weighted_v_avg': false,
    'weight_avg_iterations': 30,
    'max_check': 10,
    'trail_intensity': 0.95,
    'teams': 1, // max teams is 5
    'colors': [
      `rgb(0, ${255 / 1.5}, 255)`,
      `rgb(${255 / 1.5}, 0, 255)`,
      `rgb(255, 255, 0)`,
      `rgb(55, 255, 55)`,
      `rgb(255, 55, 55)`
    ]
  }
  
  

  let agents = [];

  let iteration = 0;
  
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  canvas.width = width;
  canvas.height = height;
  
  
  
  const reloadCells = () => {
  
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - settings['trail_intensity']})`;
    ctx.fillRect(0, 0, 5000, 5000);
  }
  
  
  
  class Agent {
      constructor(startVx, startVy, size, type) {
        this.vX = startVx;
        this.vY = startVy;
        this.cellSize = height / size;
        this.xPos = randInt(size)*(width / size);
        this.yPos = randInt(size)*(height / size);
        this.used = false;
        this.type = type;
      }
  
      spreadSpores() {
        ctx.strokeStyle = settings['colors'][this.type];
        //ctx.fillRect(this.xPos, this.yPos, this.cellSize, this.cellSize)
        
        ctx.beginPath();
        ctx.moveTo(this.xPos - this.vX*this.cellSize, this.yPos - this.vY*this.cellSize);
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
            //console.log(this.type, agents[i].type, agents[i].type != this.type)
            break;
          } else if (agents[i].type != this.type) {
            continue;
          }

          let element = agents[i];

          if (Math.round(Math.sqrt((this.xPos - element.xPos)**2 + (this.yPos - element.yPos)**2)) <= settings['range']*this.cellSize && (Math.sqrt((this.xPos - element.xPos)**2 + (this.yPos - element.yPos)**2)) >= settings['range_cutoff']*this.cellSize) {
            let dx = element.xPos - this.xPos;
            let dy = element.yPos - this.yPos;

            let dMagnitude = Math.sqrt(dx**2 + dy**2);
            
            totalX += element.vX*(settings['range'] - dMagnitude)/settings['range'];
            totalY += element.vY*(settings['range'] - dMagnitude)/settings['range'];
            count++;
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

        if (settings['bounce']) {
          if ((Math.round(this.yPos + this.vY) >= (height) - 1) || (Math.round(this.yPos + this.vY) <= 1)) {
            this.vY *= -1;
          }

          if ((Math.round(this.xPos + this.vX) >= (width) - 1) || (Math.round(this.xPos + this.vX) <= 1)) {
            this.vX *= -1;
          }
        } else {
          if (Math.round(this.xPos + this.vX) >= (width) - 1) {
            this.vX = -1*Math.abs(this.vX);
          } else if (Math.round(this.xPos + this.vX) <= 1) {
            this.vX = Math.abs(this.vX);
          }

          if (Math.round(this.yPos + this.vY) >= (height) - 1) {
            this.vY = -1*Math.abs(this.vY);
          } else if (Math.round(this.yPos + this.vY) <= 1) {
            this.vY = Math.abs(this.vY);
          }
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

    for (let i = 0; i < settings['agent_num']; i++) {
      let vx = Math.random()*settings['v_range'] - settings['v_range']/2;
      agents.push(new Agent(vx, (2*Math.random() - 1)*Math.abs(settings['v_range']-vx), settings['grid_width'], randInt(settings['teams'])));
    }
  
    agents.forEach(element => {
      element.spreadSpores();
    });
  
    setInterval(() => {
      agents.forEach(element => {
        element.move();
      });
      
      reloadCells();

      iteration++;
    }, 50);
  }
  
  init();
