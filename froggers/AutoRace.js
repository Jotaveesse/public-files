window.onload=function(){startGame();};

var gameArea;
var allCars=[];

var obsText="";
var allObstacles=[];
var perf=0;
var ml=new Algorithm();
var player;
function startGame() {
	gameArea = {
		canvas : document.getElementById("race-canvas"),
		start : function() {
			this.canvas.width = document.body.clientWidth;
			this.canvas.height = document.body.clientHeight;
			this.context = this.canvas.getContext("2d");
			
			window.addEventListener('keydown', function (e) {
				gameArea.keys = (gameArea.keys || []);
				gameArea.keys[e.keyCode] = true;
				
				if (e.code=="Space"){
					e.preventDefault();
					resetCars();
				}
			})
			window.addEventListener('keyup', function (e) {
				gameArea.keys[e.keyCode] = false;
			})
			this.canvas.addEventListener('mousedown', function (e) {
				if(e.button==0){
					new Obstacle(e.pageX,e.pageY,50);
					
				}
				
				if(e.button==2){
					var arr=[...allObstacles];
					arr.forEach(obs=>{
						if(distSqrd(new Vector2(e.pageX,e.pageY),obs)<obs.radius**2)
							allObstacles.splice(allObstacles.indexOf(obs),1);
					});
				}
				obsText="";
					allObstacles.forEach(obs=>{
						obsText+="new Obstacle("+obs.x+","+obs.y+","+obs.radius+");\n";
					});
			})
			
			this.interval = setInterval(updateGame, 25);
			this.resetTimeout = setTimeout(resetCars, 6000);
		},
		clear : function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);	
		}
		
	}
	gameArea.start();
	//player=new Car(400,120,"#ff0000",["frog1.png","frog2.png","frog3.png","water-frog.png"]);
	for(var i=0;i<40;i++)
		new Car(400,100,"#ff0000",["frog1.png","frog2.png","frog3.png","water-frog.png"]);
	
new Obstacle(1080,202,120);
new Obstacle(703,355,120);
new Obstacle(591,243,120);
new Obstacle(210,440,80);
new Obstacle(481,541,80);
new Obstacle(1078,403,80);
new Obstacle(174,213,80);
new Obstacle(288,355,80);
new Obstacle(366,300,80);
new Obstacle(460,290,80);
new Obstacle(851,363,80);
new Obstacle(432,242,80);
new Obstacle(332,240,80);
new Obstacle(244,227,80);
new Obstacle(209,328,80);
new Obstacle(818,23,80);
new Obstacle(571,303,80);
new Obstacle(1005,197,80);
new Obstacle(931,226,80);
new Obstacle(837,255,80);
new Obstacle(723,253,80);
new Obstacle(1127,305,80);
new Obstacle(-160,503,200);
new Obstacle(-170,388,200);
new Obstacle(-170,245,200);
new Obstacle(-163,95,200);
new Obstacle(0,-100,200);
new Obstacle(150,-142,200);
new Obstacle(265,-133,200);
new Obstacle(407,-127,200);
new Obstacle(533,-145,200);
new Obstacle(715,-137,200);
new Obstacle(1213,-172,200);
new Obstacle(1107,-183,200);
new Obstacle(985,-167,200);
new Obstacle(862,-122,200);
new Obstacle(1360,-94,200);
new Obstacle(1461,42,200);
new Obstacle(1498,190,200);
new Obstacle(1491,355,200);
new Obstacle(1445,541,200);
new Obstacle(1302,714,200);
new Obstacle(1136,750,200);
new Obstacle(782,746,200);
new Obstacle(544,718,200);
new Obstacle(204,786,200);
new Obstacle(432,722,200);
new Obstacle(0,730,200);
new Obstacle(944,638,120);
new Obstacle(980,324,120);

	
}

var prevPerv=0;
function updateGame(){
	gameArea.clear();
	if (gameArea.keys && gameArea.keys[38]) {
		allCars[0].accelerateForward();
	}
	if (gameArea.keys && gameArea.keys[40]) {
		allCars[0].accelerateBackwards();
	}
	if (gameArea.keys && gameArea.keys[37]) {
		allCars[0].turnLeft();
	}
	if (gameArea.keys && gameArea.keys[39]) {
		allCars[0].turnRight();
	}
	
	var start=performance.now();
	allObstacles.concat(allCars).forEach(obj=>{
		obj.update();
	});
	
	//player.draw();
	//player.sensors.forEach(sensor=>{sensor.draw()});
	var end=performance.now();
			
	perf+=end-start;
	
	document.getElementById("title").innerHTML=ml.generation+" "+ml.getScoreAverage().toFixed(0)+" "+(perf+prevPerv)/2;
	prevPerv=perf;
	perf=0;
}

function resetCars(){
	clearTimeout(this.resetTimeout);
	ml.doSelection();
	ml.resetScores();
	allCars.forEach(car=>{
		car.x=400;
		car.y=120;
		car.angle=0;
		car.speed=0;
		car.crashed=false;
	});
	
	this.resetTimeout=setTimeout(resetCars, 6000+ml.generation*500);
}

class Car{
	constructor(x,y,color,images){
		this.x = x;
		this.y = y;
		this.vector=new Vector2(this.x, this.y);
		this.width=25;
		this.height=25;
		this.maxSpeed=8;
		this.speed=0;
		this.acceleration=0.3;
		this.color=color;
		this.drag=0.97;
		this.angle=0;
		this.turnSpeed=12;
		this.crashed=false;
		this.borders=this.getBorders();
		this.sensors=this.getSensors();
		this.entity=new Entity();
		this.sprites=[];
		
		images.forEach(img=>{
			this.sprites.push(new Image());
			this.sprites[this.sprites.length-1].src=img
		});
		
		this.image=this.sprites[0];
		this.inputs=[];
		
		this.createActions();
		
		ml.entities.push(this.entity);
		allCars.push(this)
	}
	
	createActions(){
		
		//this.inputs.push(new Input(this.speed));
		
		this.sensors.forEach(sensor=>{
			this.inputs.push(sensor.input);
		});
		
		
		for(let i=0;i<4;i++)
			this.entity.actions.push(new Action(this.inputs));
		
		
		//this.actions=actions;
	}
	
	updatePosition(){
		var ctx = gameArea.context;
		
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);
		ctx.fillStyle = this.color;
		//ctx.fillRect(this.width/-2, this.height/-2 , this.width, this.height);
		//ctx.translate(this.x, this.y);
		ctx.rotate(45*Math.PI/180);
		ctx.drawImage(this.image,this.width/-2-9, this.height/-2-9 , 40, 40);
		ctx.restore(); 
	}
	
	update(){
		this.move();
		this.applyDrag();
		this.updateSprite();
		//if(!this.crashed){
			this.borders=this.getBorders();
			this.checkCollision();
			this.updateSensors();
		//}
		this.updatePosition();
		//this.crashed=false;
		
		//this.inputs[0].value=this.speed*100;
		let goForward=this.entity.actions[0].getOutput();
		let goBack=this.entity.actions[1].getOutput();
		let goLeft=this.entity.actions[2].getOutput();
		let goRight=this.entity.actions[3].getOutput();
		
		if(this.entity.actions[0].getBool()&&goForward>goBack)
			this.accelerateForward();
		if(this.entity.actions[1].getBool()&&goBack>goForward)
			this.accelerateBackwards();
		if(this.entity.actions[2].getBool()&&goLeft>goRight)
			this.turnLeft();
		if(this.entity.actions[3].getBool()&&goRight>goLeft)
			this.turnRight();
		
		//this.checkSensors();
		//this.draw()
		if(this.going==true)
			this.go();
	}
	
	updateSprite(){
		if(this.crashed)
			this.image=this.sprites[3];
		else{
			if(this.entity.score%80<20)
				this.image=this.sprites[0];
			else if(this.entity.score%80<40)
				this.image=this.sprites[1];
			else if(this.entity.score%80<60)
				this.image=this.sprites[0];
			else
				this.image=this.sprites[2];
		}
	}
	
	move(){
		if(!this.crashed)
			this.entity.score+=Math.round(this.speed);
		else
			this.entity.score-=Math.abs(Math.round(this.speed));
		
		this.x+=Math.cos(this.angle)*this.speed;
		this.y+=Math.sin(this.angle)*this.speed;
		
		this.vector.x=this.x;
		this.vector.y=this.y;
	}
	
	accelerateForward(){
		//if(!this.crashed){
			if(this.speed<this.maxSpeed)
				this.speed+=this.acceleration;
		//}
	}
	
	accelerateBackwards(){
		//if(!this.crashed){
			if(this.speed>-this.maxSpeed)
				this.speed-=this.acceleration;
		//}
	}
	
	turnLeft(){
		//if(!this.crashed){
			let realTurnSpeed=(this.turnSpeed *Math.PI/180)*(-((Math.abs(this.speed)/2.12)**3-this.speed**2)/25);
			if(realTurnSpeed>8)
				realTurnSpeed==8;

			this.angle-=realTurnSpeed;
		//}
	}
	
	turnRight(){
		//if(!this.crashed){
			let realTurnSpeed=(this.turnSpeed *Math.PI/180)*(-((Math.abs(this.speed)/2.12)**3-this.speed**2)/25);
			if(realTurnSpeed>8)
				realTurnSpeed==8;
			
			this.angle+=realTurnSpeed;
		//}
	}
	
	
	applyDrag(){
		if(Math.abs(this.speed)>0.2){
			if (this.crashed)
				this.speed*=this.drag-0.1;
			else
				this.speed*=this.drag;
		}
		else
			this.speed=0;
	}
	
	
	
	go(){

		if(this.sensors[3].colDist!=null&&this.sensors[3].colDist>60)
			this.accelerateForward();
		if(this.sensors[3].colDist!=null&&this.sensors[3].colDist<40)
			this.accelerateBackwards();
		if(this.sensors[4].colDist!=null&&this.sensors[4].colDist<40)
			this.turnLeft();
		if(this.sensors[2].colDist!=null&&this.sensors[2].colDist<40)
			this.turnRight();
		if(this.sensors[1].colDist!=null&&this.sensors[1].colDist>160)
			this.turnLeft();
		if(this.sensors[5].colDist!=null&&this.sensors[5].colDist>160)
			this.turnRight();
		if(this.sensors[2].colDist!=null&&this.sensors[2].colDist>160)
			this.turnLeft();
		if(this.sensors[4].colDist!=null&&this.sensors[4].colDist>160)
			this.turnRight();
	}
	
	checkCollision(){
		//let collided=false;
		let collided=allObstacles.some(obs=>{
			if (this.collidesWith(obs))
				return true;
		});
		
		if (collided){
			//this.color="#0000ff";
			this.crashed=true;
		}
		else{
			//this.color="#ff0000";
			this.crashed=false;
		}
	}
	
	collidesWith(obs){
		var dist=this.distFrom(obs.x,obs.y)
		var sqrdRadius=obs.radius**2;
		var collided = false;
		
		if(distSqrd(this,obs)<sqrdRadius+5200){
			this.borders.forEach(border => {
				if(distSqrd(border,obs)<sqrdRadius)
					collided=true;
			});
		}
		
		return collided;
	}
	
	distFrom(x,y){
		return Math.sqrt((this.x-x)**2+(this.y-y)**2);
	}
	
	getBorders(){
		var left={x:this.x-(this.width/2)*Math.cos(this.angle),y:this.y-(this.width/2)*Math.sin(this.angle)};
		var top={x:this.x+(this.height/2)*Math.sin(this.angle),y:this.y-(this.height/2)*Math.cos(this.angle)};
		var right={x:this.x+(this.width/2)*Math.cos(this.angle),y:this.y+(this.width/2)*Math.sin(this.angle)};
		var bottom={x:this.x-(this.height/2)*Math.sin(this.angle),y:this.y+(this.height/2)*Math.cos(this.angle)};
		
		var topLeft={x:left.x+(top.x-this.x),y:left.y+(top.y-this.y)};
		var topRight={x:right.x+(top.x-this.x),y:right.y+(top.y-this.y)};
		var bottomRight={x:right.x+(bottom.x-this.x),y:right.y+(bottom.y-this.y)};
		var bottomLeft={x:left.x+(bottom.x-this.x),y:left.y+(bottom.y-this.y)};
		
		return [left,topLeft,top,topRight,right,bottomRight,bottom,bottomLeft];
	}
	
	getSensors(){
		var sensors=[];
		this.borders.forEach((border,index)=>{
			if(index!=1&&index!=7)
				sensors.push(new Sensor(border));
		});
		
		return sensors;
	}
	
	updateSensors(){
		
		var impPoints=this.borders;
		
		var sensorNum=0;
		this.borders.forEach((border,index)=>{
			if(index!=1&&index!=7){
				this.sensors[sensorNum].updateVector(border,new Vector2((border.x-this.x), (border.y-this.y),true));
				this.sensors[sensorNum].update();
				sensorNum++;
			}
		});
		
	}
	draw(){
		var ctx = gameArea.context;
		this.borders.forEach(corner => {
			
			ctx.beginPath();
			ctx.arc(corner.x,corner.y,3,0*Math.PI,2*Math.PI)
			ctx.fillStyle = "#aaee00";
			ctx.fill();
		});
		
	}
	
}

class Obstacle{
	constructor(x,y,radius){
		this.x = x;
		this.y = y;
		this.radius=radius;
		this.sqrdRadius=radius**2;
		this.color="#2299aa";
		allObstacles.push(this);
	}
	
	update(){
		var ctx = gameArea.context;
		
		ctx.beginPath();
		
		ctx.arc(this.x,this.y,this.radius,0*Math.PI,2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

class Sensor{
	constructor(startVector=new Vector2(0,0),vector=new Vector2(0,0),maxLength=10000){
		this.maxLength=maxLength;
		this.startVector=startVector;
		this.vector=vector;
		this.line=new Line(this.startVector,Vector2.sum(this.startVector,this.vector.multiplied(this.maxLength)));
		this.colDist=null;
		this.input=new Input();
	}
	
	update(){
		this.colDist=this.getCollisionDist();
		this.input.value=this.colDist;
		//this.draw();
	}
	
	updateVector(startVector,vector){
		this.startVector=startVector;
		this.vector=vector;
		this.line=new Line(this.startVector,Vector2.sum(this.startVector,this.vector.multiplied(this.maxLength)))
	}
	
	draw(){
		var ctx = gameArea.context;
		ctx.beginPath();
		ctx.moveTo(this.startVector.x, this.startVector.y);
		
		var rayLength=this.colDist==null?this.maxLength:this.colDist;
		var endPoint=Vector2.sum(this.startVector,this.vector.multiplied(rayLength));
		ctx.lineTo(endPoint.x, endPoint.y);
		ctx.stroke(); 
	}
	
	isColliding(){
		var collided=false;
		
		collided=allObstacles.some((obs, index)=>{
			for(var i=0;i<=this.maxLength;i+=10){
				var measuredCoords=Vector2.sum(this.startVector,this.vector.multiplied(i));
				var dist=distSqrd(measuredCoords,obs);
				
				if (dist<obs.radius**2){
					return true;
				}
			}
			return false;
		});
		
		
		return collided;
	}
		
	collidesWith(){
		var closest=null;
		var closestDistance;
		var obsDistance;
		var distToLine;
		var collidedObs=[];
		
		allObstacles.forEach((obs)=>{
			distToLine=distToSegmentSquared(obs,this.startVector,this.line.end);
			if(distToLine<obs.sqrdRadius){
				collidedObs.push(obs)
			}
		});		
		
		return collidedObs;
	}
	
	getCollisionDist(){
		
		var collidedObs=this.collidesWith();
		
		var closestDistance=this.maxLength**2;

		collidedObs.forEach((obs)=>{
			var obsDistance=distSqrd(inteceptCircleLineSeg(obs,this.line)[0],this.startVector);
			var distToLine=distSqrd(obs,this.line.start);
			
				if(distToLine<obs.sqrdRadius){
					closestDistance=1;
				}
				if(obsDistance<closestDistance){
					closestDistance=obsDistance;
				}
		});
		
		
		
		return Math.sqrt(closestDistance);
	}
}

class Vector2{
	constructor(x,y, normal=false){
		this.x=x;
		this.y=y;
		this.length=this.getLength();
		
		if (normal)
			this.normalize();
	}
	
	getLength(){
		return Math.sqrt(this.x**2+this.y**2);
	}
	
	normalize(){
		this.x=this.x/this.length;
		this.y=this.y/this.length;
		this.length=this.getLength();
	}
	
	normalized(){
		let x=this.x/this.length;
		let y=this.y/this.length;
		
		return new Vector2(x,y);
	}
	
	static sum(vector1,vector2){
		return new Vector2(vector1.x+vector2.x,vector1.y+vector2.y);
	}
	
	multiply(num){
		this.x*=num;
		this.y*=num;
		this.length=this.getLength();
		
	}
	
	multiplied(num){
		let x=this.x*num;
		let y=this.y*num;
		
		return new Vector2(x,y);
		
	}
}

class Line{
	constructor(start,end){
		this.start=start;
		this.end=end;
	}
}

function distSqrd(obj1,obj2){
		return (obj1.x-obj2.x)**2+(obj1.y-obj2.y)**2;
}

function shortestDistPointToLine(a, b, c, x, y){
	return Math.abs(a*x + b*y + c)/Math.sqrt(a**2+b**2);
}

function pointsToLineEq(x1,y1,x2,y2){
	var a=y1-y2;
	var b=x2-x1;
	var c=(x1-x2)*y1+(y2-y1)*x1;
	
	return [a,b,c];
}

function vectorsToLineEq(v1,v2){
	var [x1,y1]=[v1.x,v1.y];
	var [x2,y2]=[v2.x,v2.y];
	
	var a=y1-y2;
	var b=x2-x1;
	var c=(x1-x2)*y1+(y2-y1)*x1;
	
	return [a,b,c];
}

function distToSegmentSquared(p, v, w) {
  var l2 = distSqrd(v, w);
  if (l2 == 0) return distSqrd(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distSqrd(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) { 
	return Math.sqrt(distToSegmentSquared(p, v, w)); 
}

function ccw(A,B,C){
    return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);
}

function intersect(A,B,C,D){
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D);
}

function inteceptCircleLineSeg(circle, line){
    var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
    v1 = {};
    v2 = {};
    v1.x = line.end.x - line.start.x;
    v1.y = line.end.y - line.start.y;
    v2.x = line.start.x - circle.x;
    v2.y = line.start.y - circle.y;
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if(isNaN(d)){ // no intercept
        return [];
    }
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;    
    retP1 = {};   // return points
    retP2 = {}  
    ret = []; // return array
    if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
        retP1.x = line.start.x + v1.x * u1;
        retP1.y = line.start.y + v1.y * u1;
        ret[0] = retP1;
    }
    if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
        retP2.x = line.start.x + v1.x * u2;
        retP2.y = line.start.y + v1.y * u2;
        ret[ret.length] = retP2;
    }       
    return ret;
}

window.onresize=function(ev){
	gameArea.canvas.width = document.body.clientWidth;
	gameArea.canvas.height = document.body.clientHeight;
};