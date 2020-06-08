$ = (query) => document.querySelector(query);

// GPU
const gpu = new GPU();

// Canvas settings
let cnv;
const canvasSize = 400;
let cellSize = 1;
let cellNum = canvasSize/cellSize;
let loadState = "none";
let drawing = false;

// Neighborhoods settings
let network; // contains the networkk state
let density = 0.4; // density of black and white in the initial network

//Epoch settings
let animate = false;
let epochinterval;

// Sliders
let intervalSlidersLife = [];
let intervalPLife = [];
let intervalSlidersDeath = [];
let intervalPDeath = [];

// Intervals
const intervalNum = 2; // number of intervals for each neighborhood
let intervalLife = [];
let intervalDeath = [];

intnh = [[[0,-1],[1,0],[0,1],[-1,0],[1,-2],[2,-1],[2,1],[1,2],[-1,2],[-2,1],[-3,0],[-2,-1],[-1,-2],[3,0],[5,0],[-5,0],[0,-3],[0,3],[0,-5],[0,5],[1,4],[-1,4],[-4,-1],[-4,1],[-1,-4],[1,-4],[4,-1],[4,1]],[[0,-1],[0,-3],[0,-5],[0,-7],[0,-9],[0,-8],[0,-6],[0,-4],[0,-2],[0,1],[0,2],[0,3],[0,4],[0,6],[0,5],[0,7],[0,9],[0,8],[1,0],[2,0],[2,0],[3,0],[4,0],[5,0],[6,0],[-1,0],[-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[0,0],[1,-1],[2,-2],[-1,1],[-2,2],[-2,-2],[-1,-1],[1,1],[2,2],[2,-1],[3,-1],[4,-1],[3,-2],[3,-3],[2,-3],[1,-2],[1,-2],[1,-3],[-1,-3],[-2,-3],[-3,-3],[-3,-2],[-3,-1],[-2,-1],[-1,-2],[-1,-4],[-4,-1],[1,-4],[3,1],[3,3],[3,2],[2,3],[1,3],[1,2],[2,1],[4,1],[1,4],[-1,4],[-1,3],[-2,3],[-3,3],[-3,2],[-1,2],[-2,1],[-4,1],[-3,1],[-1,-8],[-1,-7],[-1,-6],[-1,-5],[1,-8],[1,-8],[1,-7],[1,-6],[1,-5],[-2,-5],[-2,-4],[2,-5],[2,-4],[1,5],[1,6],[1,8],[1,7],[-1,5],[-1,6],[-1,7],[-1,8],[2,4],[2,5],[-2,4],[-2,5],[-5,-1],[-5,0],[-5,1],[5,-1],[5,1]],[[0,-7],[0,-6],[0,-5],[0,-4],[0,-3],[0,-2],[0,-1],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,-8],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[-1,0],[-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[-7,0],[-8,0],[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[-1,1],[6,-6],[-6,-6],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-1,-2],[1,-2],[2,-1],[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-3,-2],[-4,-1],[-4,1],[-3,2],[-2,-3],[-1,-4],[1,-4],[2,-3],[3,-2],[4,-1],[4,1],[3,2],[2,3],[1,4],[-1,4],[-2,3],[-3,4],[-2,5],[-1,5],[-2,4],[1,5],[2,5],[3,4],[2,4],[4,2],[4,3],[5,2],[5,1],[4,-2],[4,-3],[5,-2],[5,-1],[2,-4],[3,-4],[2,-5],[1,-5],[-2,-4],[-3,-4],[-2,-5],[-1,-5],[-4,-2],[-4,-3],[-5,-3],[-5,-2],[-5,-1],[-4,2],[-5,1],[-5,2],[-4,3],[-4,-5],[-3,-5],[3,-5],[4,-5],[5,-4],[5,-3],[5,3],[5,4],[4,5],[3,5],[-3,5],[-4,5],[-5,4],[-5,3],[-5,-4],[-1,-7],[-2,-6],[1,-7],[2,-6],[1,-6],[-1,-6],[5,-6],[6,-5],[6,5],[5,6],[7,1],[6,2],[6,1],[7,-1],[6,-1],[6,-2],[-6,-2],[-6,-1],[-7,-1],[-7,1],[-6,1],[-6,2],[-6,5],[-5,6],[-6,-5],[-5,-6],[1,7],[2,6],[1,6],[-1,6],[-1,7],[-2,6],[5,-7],[6,-7],[7,-7],[7,-6],[7,-5],[-5,-7],[-6,-7],[-7,-7],[-7,-6],[-7,-5],[-7,5],[-7,6],[-7,7],[-6,7],[-5,7],[5,7],[6,7],[7,7],[7,6],[7,5],[6,-8],[7,-8],[8,-8],[8,-7],[8,-6],[8,6],[8,7],[8,8],[7,8],[6,8],[-6,-8],[-7,-8],[-8,-8],[-8,-7],[-8,-6],[-8,6],[-8,7],[-8,8],[-7,8],[-6,8],[7,-9],[8,-9],[9,-9],[9,-8],[9,-7],[-7,-9],[-8,-9],[-9,-9],[-9,-8],[-9,-7],[-9,7],[-9,8],[-9,9],[-8,9],[-7,9],[7,9],[8,9],[9,9],[9,8],[9,7],[9,0],[-9,0],[0,-9],[0,9]]];

function populateIntervals() {
	for (let i=0;i<intnh.length;i++) {
		intervalLife[i] = [];
		intervalDeath[i] = [];
		for (let j=0;j<intervalNum;j++) {
			intervalLife[i][j] = [0,0];
			intervalDeath[i][j] = [0,0];
		}
	}
}

const randomNetworkGpu = gpu.createKernel(function(d) {
	// Create a random network 
	let tempVal = 0;
	if (Math.random(1)<d){tempVal=1} else {tempVal=0}
	return tempVal;
}).setOutput([cellNum,cellNum]);

const clearNetworkGpu = gpu.createKernel(function() {
	return 0;
}).setOutput([cellNum,cellNum]);

function setup() {
	cnv = createCanvas(canvasSize,canvasSize);
	cnv.parent('#interval_canvas');
  setTimeout(()=>{
    network  = randomNetworkGpu(density);
    populateIntervals();
    displayCells();
    rightMenu();
    select('#seed').mouseClicked(()=>{network=randomNetworkGpu(density);displayCells()});
    select('#save_img').mouseClicked(()=>{saveCanvas("MiAutomata","png")});
    select('#epoch').mouseClicked(newEpoch);
    select('#animate').mouseClicked(function() {
      animate = !animate;
      if (animate) {this.html("...Parar");epochinterval = setInterval(newEpoch,100)} 
      else {this.html("Animar");clearInterval(epochinterval)}
    });
  },1);
  let slidersarray = selectAll(".rangeslider").map(d=>d.elt);
  let options = {start:[20,80],step:1,connect:true,range:{'min':0,'max':100}}
  for (let i=0;i<slidersarray.length;i++) {
	noUiSlider.create(slidersarray[i],options,true);
	slidersarray[i].noUiSlider.on('update', function (values,handle) {
    //console.log(values);
	});
  }
}

function rightMenu() {
  // GUI sliders
  for (let ld=0;ld<2;ld++) {
    const id = ld==0 ? "#life_sliders" : "#death_sliders";
    let interval = ld==0 ? intervalLife : intervalDeath;
    let p = ld==0 ? intervalPLife : intervalPDeath;
    let sliders = ld==0 ? intervalSlidersLife : intervalSlidersDeath;
    const type = ld==0 ? "life" : "death";
    for (let i=0;i<intnh.length;i++) {
      sliders[i] = [];
      p[i] = [];
      for (let j=0;j<intervalNum;j++) {
        const cont = createDiv().parent(id).class("#double_slider_div");
        sliders[i][j] = [];
        for (let k=0;k<2;k++) {
          let interval_slider = createDiv("").elt;
          let options = {start:[20,80],step:1,connect:true,range:{'min':0,'max':100}}
          noUiSlider.create(interval_slider,options,true);



          sliders[i][j][k] = createSlider(0,intnh[i].length,interval[i][j][k],1).parent(id).class("slider");
          sliders[i][j][k].input(function() {
            sliderChange(i,j,type);
          });
        }
        const v1 = interval[i][j][0];
        const v2 = interval[i][j][1];
        p[i][j] = createSpan(`${v1}-${v2}/${intnh[i].length}`).parent(cont).class('interval_span');
      }
    }
  }
}

function sliderChange(i,j,type) {
  // Changes intervals in response to sliders
  let interval = type=="life" ? intervalLife : intervalDeath;
  let p = type=="life" ? intervalPLife : intervalPDeath;
  let sliders = type=="life" ? intervalSlidersLife : intervalSlidersDeath;
  let v1 = sliders[i][j][0].value();
  let v2 = sliders[i][j][1].value();
  p[i][j].html(`${v1}-${v2}/${intnh[i].length}`);
  interval[i][j] = [v1,v2];
}

function displayCells() {
	// Displays cells of current network in canvas
	background(255);
	let d = pixelDensity();
	loadPixels();
	for (let x=0;x<cellNum;x++) {
		for (let y=0;y<cellNum;y++) {
			let index = 4 * (y*width+x);
			if (network[x][y] == 0) {
				pixels[index] = 255;
				pixels[index+1] = 255;
				pixels[index+2] = 255;
				pixels[index+3] = 255;
			} else if (network[x][y] == 1) {
				pixels[index] = 0;
				pixels[index+1] = 0;
				pixels[index+2] = 0;
				pixels[index+3] = 255;
			}
		}
	}
	updatePixels();
}

const neighborsAliveGpu_nh1 = gpu.createKernel(function(nh_,nhl_,n_,cn_) {
	// Returns the number of all alive neighbors for each cell in the network
	let sum = 0;
	for (let i=0;i<nhl_;i++) {
		let xn = this.thread.x+nh_[i][0]; 
 		let yn = this.thread.y+nh_[i][1];
		if (xn<0) {
			xn = cn_+xn;
		} else if (xn>cn_-1) {
			xn = xn-cn_;
		}
		if (yn<0) {
			yn = cn_+yn;
		} else if (yn>cn_-1) {
			yn = yn-cn_;
		}
		sum+=n_[xn][yn];
	}
	return sum;
}).setOutput([cellNum,cellNum]);

const neighborsAliveGpu_nh2 = gpu.createKernel(function(nh_,nhl_,n_,cn_) {
	// Returns the number of all alive neighbors for each cell in the network
	let sum = 0;
	for (let i=0;i<nhl_;i++) {
		let xn = this.thread.x+nh_[i][0]; 
 		let yn = this.thread.y+nh_[i][1];
		if (xn<0) {
			xn = cn_+xn;
		} else if (xn>cn_-1) {
			xn = xn-cn_;
		}
		if (yn<0) {
			yn = cn_+yn;
		} else if (yn>cn_-1) {
			yn = yn-cn_;
		}
		sum+=n_[xn][yn];
	}
	return sum;
}).setOutput([cellNum,cellNum]);

const neighborsAliveGpu_nh3 = gpu.createKernel(function(nh_,nhl_,n_,cn_) {
	// Returns the number of all alive neighbors for each cell in the network
	let sum = 0;
	for (let i=0;i<nhl_;i++) {
		let xn = this.thread.x+nh_[i][0]; 
 		let yn = this.thread.y+nh_[i][1];
		if (xn<0) {
			xn = cn_+xn;
		} else if (xn>cn_-1) {
			xn = xn-cn_;
		}
		if (yn<0) {
			yn = cn_+yn;
		} else if (yn>cn_-1) {
			yn = yn-cn_;
		}
		sum+=n_[xn][yn];
	}
	return sum;
}).setOutput([cellNum,cellNum]);

const applyRuleGpu = gpu.createKernel(function(n_,na_,inum_,il_,id_) {
	// Applies a set interval rules to all elements in the network
	let tempVal = n_[this.thread.y][this.thread.x];
	for (let i=0;i<inum_;i++) {
		if (il_[i][0]<=na_[this.thread.y][this.thread.x]
			&&na_[this.thread.y][this.thread.x]<=il_[i][1]) {
			tempVal = 1;
		}
		if (id_[i][0]<=na_[this.thread.y][this.thread.x]
			&&na_[this.thread.y][this.thread.x]<=id_[i][1]) {
			tempVal = 0;
		}
	}
	return tempVal;
}).setOutput([cellNum,cellNum]);

function newEpoch() {
	// Creates a new generation of the network 
	// based on the parameter rules and all the neighborhoods
  const neighbors1 = neighborsAliveGpu_nh1(intnh[0],intnh[0].length,network,cellNum);
  const nextNetwork = applyRuleGpu(network,neighbors1,intervalNum,intervalLife[0],intervalDeath[0]);
  network = nextNetwork;
  const neighbors2 = neighborsAliveGpu_nh2(intnh[1],intnh[1].length,network,cellNum);
  const nextNetwork2 = applyRuleGpu(network,neighbors2,intervalNum,intervalLife[1],intervalDeath[1]);
  network = nextNetwork2;
  const neighbors3 = neighborsAliveGpu_nh3(intnh[2],intnh[2].length,network,cellNum);
  const nextNetwork3 = applyRuleGpu(network,neighbors3,intervalNum,intervalLife[2],intervalDeath[2]);
  network = nextNetwork3;
  displayCells();
}