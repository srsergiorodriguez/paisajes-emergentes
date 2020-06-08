const c = {};
const cnames = ['colbg','colmain','colblack','col1','col2'];
function setup() {
  for (cn of cnames) {
    c[cn] = select('body').style('--'+cn).trim();
  }
}

const sketch = function(s) {
  let cnv;
  let x = 0;
  let y;
  s.setup = function() {
    cnv = s.createCanvas(400, 400);
    cnv.parent('#cnv1');
    y = s.height/2;
  };
  s.draw = function() {
    x = x >= s.width ? 0: x + 1;
    s.background(c.col1);
    s.noStroke();
    s.fill(c.colmain);
    s.rect(x, y, 50, 50);
  };
};
let cnv1 = new p5(sketch);