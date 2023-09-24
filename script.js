settings = {
    'agent_num': 15000,
    'v_range': 3,
    'grid_width': 512,

    'range': 100,
    'range_cutoff': 0,
    'max_check': 15,

    'trail_intensity': 0.975, // recomended 0 or 0.9

    'teams': 5, // max teams is 5
    'comingle': false,

    'colors': [
      `rgb(0, ${255 / 1.5}, 255)`,
      `rgb(${255 / 1.5}, 0, 255)`,
      `rgb(255, 255, 0)`,
      `rgb(255, 55, 55)`,
      `rgb(55, 255, 55)`
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
        this.used = false;
        this.type = type;
        this.xPos = randInt((width/settings['teams'])) + (width/settings['teams'])*(this.type);
        this.yPos = randInt(size)*(height / size);
      }
  
      spreadSpores() {
        ctx.strokeStyle = settings['colors'][this.type];
        ctx.fillStyle = settings['colors'][this.type];
        
        ctx.beginPath();
        ctx.moveTo(this.xPos - this.vX*this.cellSize, this.yPos - this.vY*this.cellSize);
        ctx.lineTo(this.xPos, this.yPos);
        ctx.closePath();
        ctx.stroke();

        // ctx.fillRect((this.cellSizeize/5)*(width / this.cellSize) + (this.type*this.cellSize / (4/3)), 0, 10, 1000);
        // ctx.fillRect((this.cellSize/5)*(width / this.cellSize), 0, 10, 1000);
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
          }

          let element = agents[i];

          if (Math.round(Math.sqrt((this.xPos - element.xPos)**2 + (this.yPos - element.yPos)**2)) <= settings['range']*this.cellSize && (Math.sqrt((this.xPos - element.xPos)**2 + (this.yPos - element.yPos)**2)) >= settings['range_cutoff']*this.cellSize) {
            let dx = element.xPos - this.xPos;
            let dy = element.yPos - this.yPos;

            let dMagnitude = Math.sqrt(dx**2 + dy**2);

            if (element.type === this.type) {
              totalX += element.vX*(settings['range'] - dMagnitude)/settings['range'];
              totalY += element.vY*(settings['range'] - dMagnitude)/settings['range'];
              count++;
            } else {
              totalX -= this.vX*(settings['range'] - dMagnitude)/settings['range'];
              totalY -= this.vY*(settings['range'] - dMagnitude)/settings['range'];
              count++;
            }

            //element.type = this.type;
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

        if (!settings['comingle']) {
          if (Math.round(this.xPos + 10*this.vX) <= (width/settings['teams'])*(this.type) || Math.round(this.xPos + 10*this.vX) >= ((width/settings['teams'])) + (width/settings['teams'])*(this.type)) {
            this.vX *= -1;
          }
        } else {
          if ((Math.round(this.xPos + this.vX) >= (width) - 1) || (Math.round(this.xPos + this.vX) <= 1)) {
            this.vX *= -1;
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
      let vy = (2*Math.random() - 1)*Math.abs(settings['v_range']-vx);
      let team = randInt(settings['teams']);

      agents.push(new Agent(vx, vy, settings['grid_width'], team));
    }
  
    agents.forEach(element => {
      element.spreadSpores();
    });
  
    setInterval(() => {
      reloadCells();
      
      agents.forEach(element => {
        element.move();
      });

      iteration++;
    }, 50);
  }
  
  init();
