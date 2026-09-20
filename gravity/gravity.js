
const transString="translate(@px, #px)";

var allObjects=[];
var notUpdatedObjects=[];
var allElems=[];

var container;

const containerScale=10;

var zoomScale=1/containerScale;
const maxZoom=2;
const minZoom=1/containerScale;

var simLoop=null;
var createdCount=0;
var draggedObj=null;
var randomColor=true;
defaultStepDelay=20;
var timeSpeed=1;

class CelestialBody{
	id;
	x=0;
	y=0;
	radius=10;
	speedX=0;
	speedY=0;
	accX=0;
	accX=0;
	accY=0;
	forceX=0;
	forceY=0;
	color="eeeeee"
	density=10;
	mass=1;
	activated=true;
	isGhost=false;
	
	removed=false;
	beingDragged=false;
	
	constructor(bodyData){
		var defaultData={
			x:0,
			y:0,
			radius:10,
			speedX:0,
			speedY:0,
			accX:0,
			accX:0,
			accY:0,
			forceX:0,
			forceY:0,
			color:"eeeeee",
			density:10,
			activated:true,
			isGhost:false
		};
		
		var mergedData=Object.assign(defaultData, bodyData);
		
		this.id=createdCount;
		createdCount++;
		
		Object.keys(defaultData).forEach(key=>{
			this[key]=mergedData[key]
		})
		//this.radius=mergedData.radius;
		//this.x=mergedData.x;
		//this.y=mergedData.y;
		//this.speedX=mergedData.speedX;
		//this.speedY=mergedData.speedY;
		
		//this.density=mergedData.density;
		this.mass=mergedData.density*Math.PI*this.radius**2;
		//this.color=mergedData.color;
		//this.isGhost=mergedData.isGhost;
		
		this.createElement();
		
		notUpdatedObjects.push(this);
		allObjects.push(this);
		
		this.moveTo(mergedData.x,mergedData.y);
		
	}
	
	updateValues(){
		this.elem.style.width=2*this.radius;
		this.elem.style.height=2*this.radius;
		this.elem.style.top=0-this.radius;
		this.elem.style.left=0-this.radius;
		this.mass=this.density*Math.PI*this.radius**2;
		this.elem.style.backgroundColor="#"+this.color;
	}
	
	createElement(){
		var elem=document.createElement("div");
		elem.classList.add("object");
		if(this.mass<0)
			elem.classList.add("anti-object");			
		elem.style.width=2*this.radius;
		elem.style.height=2*this.radius;
		elem.style.top=0-this.radius;
		elem.style.left=0-this.radius;
		elem.style.backgroundColor="#"+this.color;
		elem.attributes.objId=this.id;
		elem.parentObject=this;
		
		document.getElementsByClassName("container")[0].appendChild(elem);
		this.elem=elem;
	}
	
	move(){
		if(!this.beingDragged)
			this.moveBy(this.speedX/timeSpeed,this.speedY/timeSpeed);
	}
	
	moveTo(x, y){
		let newX=x;
		let newY=y;
		
		this.elem.style.transform=transString.replace("@",newX).replace("#",newY)	
		
		this.x=newX;
		this.y=newY;
	}
	
	moveBy(x, y){
		this.x=this.x+x;
		this.y=this.y+y;
	}
	
	moveTowards(x, y){
		let dist=this.distFrom(x,y);
		let dirX=0;
		let dirY=0;
		if(dist>this.speedX){
			dirX=this.speedX*(x-this.x)/dist;
		}
		if(dist>this.speedY){
			dirY=this.speedY*(y-this.y)/dist;
		}
		if(dist>this.speedX&&dist>this.speedY){
			this.moveBy(dirX,dirY);
		}
		
	}
	
	updatePosition(){
		this.elem.style.transform="translate("+this.x+"px,"+this.y+"px)";		
	}
	
	update(){
		if(!this.removed&&this.activated){
			this.updateForce();
			
			if(!this.beingDragged){
				this.updateAcceleration();
				this.updateSpeed();
			}
		}
		
	}
	
	updateSpeed(){
		this.speedX+=this.accX/timeSpeed;
		this.speedY+=this.accY/timeSpeed;
	}
	
	
	updateAcceleration(){
		this.accX=this.forceX/Math.abs(this.mass);
		this.accY=this.forceY/Math.abs(this.mass);
	}
	
	updateForce(){
		let dist;
		let dirX;
		let dirY;
		let distSqrd;
		
		//removes this object from not updated list
		notUpdatedObjects=notUpdatedObjects.slice(1);
		
		notUpdatedObjects.forEach((obj)=>{
			if(obj!=this&&!this.removed&&!obj.removed&&obj.activated){
				dist=this.distFrom(obj.x,obj.y);
				
				distSqrd=dist**2;
				
				//checks if it collides with other object
				if(dist>(obj.radius+this.radius)||(this.isGhost||obj.isGhost)){
					
					dirX= (obj.x-this.x)/dist;
					dirY= (obj.y-this.y)/dist;
					
					let expMass=this.mass*obj.mass;

					if (dist<obj.radius||dist<this.radius){
						
						if (obj.radius>this.radius)
							expMass=this.mass*(obj.density*Math.PI*distSqrd)*dist/obj.radius;
						else
							expMass=obj.mass*(this.density*Math.PI*distSqrd)*dist/this.radius;
					}
					
					let force=expMass/(distSqrd+10);
					let forceX=dirX*force;
					let forceY=dirY*force;
					
					this.forceX+=forceX;
					this.forceY+=forceY;
					
					obj.forceX-=forceX;
					obj.forceY-=forceY;
					
				}
				else {
					{
						if (obj.constructor==Body)
							this.mergeWith(obj);
						else
							obj.mergeWith(this);
					}
				}
			}
		});
	}
	
	mergeWith(obj) {
		let newX = mergeValues(this.x, obj.x, this.mass, obj.mass);
		let newY= mergeValues(this.y, obj.y, this.mass, obj.mass);
		
		let higherDensity=Math.abs(this.mass)>Math.abs(obj.mass)?this.density:obj.density;
		let newRadius=Math.abs((this.mass+obj.mass)/(higherDensity*Math.PI))**(1/2);
		
		let newSpeedX=mergeValues(this.speedX, obj.speedX, this.mass, obj.mass);
		let newSpeedY=mergeValues(this.speedY, obj.speedY, this.mass, obj.mass);
		
		let newAccX=mergeValues(this.accX, obj.accX, this.mass, obj.mass);
		let newAccY=mergeValues(this.accY, obj.accY, this.mass, obj.mass);

		let newColor=mergeColors(this.color,obj.color,Math.abs(this.mass),Math.abs(obj.mass));
		
		
		if (newRadius!=0){
			
			let mergedObj=new Body({
				x:newX,
				y:newY,
				speedX:newSpeedX,
				speedY:newSpeedY,
				accX:newAccX,
				accY:newAccY,
				radius:newRadius,
				density:higherDensity,
				color:newColor
			});
			
			if(this.beingDragged||obj.beingDragged){
				mergedObj.beingDragged=true;
				draggedObj=mergedObj;
			}
			
			if(this.elem==prevInfoTarget||obj.elem==prevInfoTarget){
				prevInfoTarget=mergedObj.elem;
			}
		}
		
		obj.remove();
		this.remove();
	}
	
	distFrom(x,y){
		return Math.sqrt((this.x-x)**2+(this.y-y)**2);
	}
	
	distSqrdFrom(x,y){
		return (this.x-x)**2+(this.y-y)**2;
	}
	
	doesItCollide(obj) {
		return this.distSqrdFrom(obj.x,obj.y)<(obj.radius+this.radius)**2;
	}
	
	
	resetForce(){
		this.forceX=0;
		this.forceY=0;
	}
	
	remove(){
		this.removed=true;
		allObjects=allObjects.filter(e => e !== this)
		notUpdatedObjects=notUpdatedObjects.filter(e => e !== this)
		this.elem.remove();
	}
}

class Body extends CelestialBody{
	constructor(bodyData){
		super(bodyData);
		
	}
	
	
}

class BlackHole extends Body{
	constructor(bodyData){
		super(bodyData);
	}
	update(){
		if(!this.removed&&this.activated){
			this.updateForce();
		}
	}
	move(){
		
	}
	mergeWith(obj) {
		let newDensity=(this.mass+obj.mass)/(Math.PI*this.radius**2);

		let newColor=mergeColors(this.color,obj.color,Math.abs(this.mass),Math.abs(obj.mass));
		
		obj.remove();
		this.remove();
		
		let mergedObj=new BlackHole({
			x:this.x,
			y:this.y,
			radius:this.radius,
			density:this.density,
			color:newColor
		});
		
		if(this.beingDragged||obj.beingDragged){
			mergedObj.beingDragged=true;
			draggedObj=mergedObj;
		}
		
		if(this.elem==prevInfoTarget||obj.elem==prevInfoTarget){
			prevInfoTarget=mergedObj.elem;
		}
	
	}
	
}

function startSim(stepDelay=defaultStepDelay){
	if (simLoop==null){
		simLoop=setInterval(()=>
		{
			doStep();
			
		},stepDelay);
	}
}

function stopSim(){
	if (simLoop!=null){
		clearInterval(simLoop);
		simLoop=null;
	}
}

function doStep(){
	var startTime=performance.now();
	//dupes the objects list
	notUpdatedObjects=allObjects.slice(0);
	//updates the values
	allObjects.forEach((obj)=>{
		obj.update();
	});
	//moves and resets the forces
	allObjects.forEach((obj)=>{
		obj.move();
		obj.resetForce();
		obj.updatePosition();
		
	});
	updateInfo();
	
	var endTime=performance.now();
	
	document.getElementById("title").innerHTML=allObjects.length+" "+(endTime-startTime);
	
}

function spawnRandom(amount,screenPerc,maxSize,maxSpeed){
	var posMultiplier=screenPerc*containerScale/100;
	
	for(let i=0;i<amount;i++){
		let randomX=parseInt(Math.random()*window.innerWidth)*posMultiplier;
		let randomY=parseInt(Math.random()*window.innerHeight)*posMultiplier;
		let randomSize=10+parseInt(Math.random()*maxSize);
		let randomSpeedX=((Math.random()*2)-1)*maxSpeed;
		let randomSpeedY=((Math.random()*2)-1)*maxSpeed;
		let color=randomColor?getRandomColor():"eeeeee";
		let randomDensity=Math.random()>0.5?10:10
				
		new Body({
			x:randomX,
			y:randomY,
			size:randomSize,
			speedX:randomSpeedX,
			speedY:randomSpeedY,
			color:color,
			density:randomDensity,
			isGhost:false
		});
	}
}

function zoomScreen(scale,pointX=0,pointY=0){
	var prevScale=zoomScale;
	
	//changes zoom by 10% of actual value
	zoomScale+=zoomScale/10*scale;
	zoomScale=Math.round(zoomScale*containerScale*10)/(containerScale*10);
	
	//limits the zoom value
	if(zoomScale>maxZoom)
		zoomScale=maxZoom;
	else if(zoomScale<minZoom)
		zoomScale=minZoom;
	
	var [oldLeft,oldTop]=getScreenPos();
	
	//coords of zoomed screen to keep the point of zooming in the same position on screen
	var newLeft=((pointX-oldLeft)/prevScale)*(prevScale-zoomScale)+oldLeft;
	var newTop=((pointY-oldTop)/prevScale)*(prevScale-zoomScale)+oldTop;
	
	container.style["-moz-transform"]="scale("+zoomScale+")";
	
	//moves the screen to keep mousepoint on the same spot
	if(newLeft<=0){
		container.style.left=newLeft+"px";
	}
	if(newTop<=0){
		container.style.top=newTop+"px";
	}
	
	//gets screen pos
	oldLeft=parseInt(container.style.left.slice(0,-2));
	oldTop=parseInt(container.style.top.slice(0,-2));
			
	//if zooming out puts screen out of bounds then puts the screen back in to place
	if(oldLeft<window.innerWidth-container.getBoundingClientRect().width)
		container.style.left=window.innerWidth-container.getBoundingClientRect().width+"px";
	if(oldTop<window.innerHeight-container.getBoundingClientRect().height)
		container.style.top=window.innerHeight-container.getBoundingClientRect().height+"px";
}

function dragScreenBy(x,y){

	var [oldLeft,oldTop]=getScreenPos();
	
	var newLeft=oldLeft+x;
	var newTop=oldTop+y;
	
	//prevents screen from going beyond bounds and sets the new coord values
	if(newLeft<=0&&newLeft>window.innerWidth-container.getBoundingClientRect().width)
		container.style.left=newLeft+"px";
	
	if(newTop<=0&&newTop>window.innerHeight-container.getBoundingClientRect().height)
		container.style.top=newTop+"px";
}

function screenToContanerPoint(x,y){
	
	var [oldLeft,oldTop]=getScreenPos();
	
	//coords of zoomed screen to keep the point of zooming in the same position on screen
	var newX=((x-oldLeft)/zoomScale);
	var newY=((y-oldTop)/zoomScale);
	
	return [newX,newY]
}

function getScreenPos(){

	var oldLeft=parseInt(container.style.left.slice(0,-2));
	var oldTop=parseInt(container.style.top.slice(0,-2));
	
	oldLeft=isNaN(oldLeft)?0:oldLeft;
	oldTop=isNaN(oldTop)?0:oldTop;
	
	return [oldLeft,oldTop];
}

//sorts from highest absolute to lowest
function absoluteSort(a,b){return Math.abs(b)-Math.abs(a);}
	
function getRandomColor() {
  var letters = '0123456789abcdef';
  var color = '';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function mergeValues(value1, value2, weight1=1, weight2=1){
	weight1=Math.abs(weight1);
	weight2=Math.abs(weight2);
	let totalWeight=weight1+weight2;
	let mergedValue=(value1*weight1+value2*weight2)/totalWeight;
	
	return mergedValue;
}

function getRGB(color){
	let red=parseInt(color.slice(0,2),16);
	let green=parseInt(color.slice(2,4),16);
	let blue=parseInt(color.slice(4),16);

	return [red, green, blue];
}

function mergeColors(color1, color2, weight1=1, weight2=1){
	let totalWeight=weight1+weight2;
	
	let rgb1=getRGB(color1);
	let rgb2=getRGB(color2);
	
	let red=parseInt(mergeValues(rgb1[0],rgb2[0],weight1,weight2));
	let green=parseInt(mergeValues(rgb1[1],rgb2[1],weight1,weight2));
	let blue=parseInt(mergeValues(rgb1[2],rgb2[2],weight1,weight2));
	
	//converts to hexa string, if value is under 16 adds a 0 to the beginning to keep it as a 2 digit
	red=red<=15?"0"+red.toString(16):red.toString(16);
	green=green<=15?"0"+green.toString(16):green.toString(16);
	blue=blue<=15?"0"+blue.toString(16):blue.toString(16);
	
	return (red+green+blue);
}