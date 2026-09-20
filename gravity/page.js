window.onload=function(){setup();};

function LogSlider(options) {
   options = options || {};
   this.minpos = options.minpos || 0;
   this.maxpos = options.maxpos || 100;
   this.minlval = Math.log(options.minval || 1);
   this.maxlval = Math.log(options.maxval || 100000);

   this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}

LogSlider.prototype = {
   // Calculate value from a slider position
   value: function(position) {
      return Math.exp((position - this.minpos) * this.scale + this.minlval);
   },
   // Calculate slider position from a value
   position: function(value) {
      return this.minpos + (Math.log(value) - this.minlval) / this.scale;
   }
};

function setup(){
	setupColor();
	updateMenuValues();
	var mouseX=0;
	var mouseY=0;
	
	bodyInfo=document.getElementById("body-info");
	container=document.getElementsByClassName("container")[0];
	
	container.style.width=containerScale*100+"%";
	container.style.height=containerScale*100+"%";
	
	container.style.left=-container.getBoundingClientRect().width/2;
	container.style.top=-container.getBoundingClientRect().height/2;
	
	zoomScreen(zoomScale);
	
	spawnRandom(300,100,10,5);
	
	
	//new BlackHole({x:7500,y:3300,color:"ffff00",radius:20,density:1,isGhost:true});
	//new Body({x:6500,y:2500,radius:50,density:10,isGhost:false,speedY:15});
	//new Body({x:6300,y:2500,radius:50,density:10,isGhost:false,speedY:-15,color:"ffff00"});
	
	
	startSim();
	
	
	document.addEventListener("keydown",(ev)=>{
		if(ev.code=="Space"){
			ev.preventDefault();
			if(simLoop==null)
				startSim();
			else
				stopSim();
		}
		if(ev.code=="Period"){
			if(simLoop==null)
				doStep();
		}
		
	});
	
	//zooms on the screen
	container.addEventListener("wheel",(ev)=>{
		var scale=1;

		if(ev.wheelDeltaY>0)
			scale=1;
		else
			scale=-1;
				
		zoomScreen(scale,ev.clientX,ev.clientY);
		updateInfo();
	});
	
	
	
	container.addEventListener("contextmenu",(ev)=>{
		ev.preventDefault();
	});
	
	var draggingContainer; //checks wheter or not user is dragging
	container.addEventListener("mousedown",(ev)=>{
		if (ev.button==0){
			
			if(ev.target==container)
				draggingContainer=true;
			
			if(ev.target.classList[0]=="object"){
				//finds the parent object of the element
				allObjects.forEach((obj)=>{
					if (obj.id==ev.target.attributes.objId)
						draggedObj=obj;
				});

				//sets prev values to be used on mouseover event
				[prevX,prevY]=screenToContanerPoint(ev.clientX, ev.clientY);
				
				draggedObj.moveTo(prevX,prevY);
				draggedObj.beingDragged=true;
				draggedObj.speedX=0;
				draggedObj.speedY=0;
				
				updateInfo();
			}
			else{
				disableInfo();
			}
		}
		
	});
	
	var prevX=0;
	var prevY=0;
	var speedsX=[0,0];
	var speedsY=[0,0];
	var timeStamp=0;
	
	document.addEventListener("mousemove",(ev)=>{
		if (ev.button==0){
			//if dragging the screen
			if(draggingContainer)
			{
				var [newX,newY]=screenToContanerPoint(ev.clientX, ev.clientY);
				dragScreenBy(ev.movementX,ev.movementY);
			}
			
			//if dragging an object
			if(draggedObj!=null&&draggedObj.beingDragged)
			{
				var [newX,newY]=screenToContanerPoint(ev.clientX, ev.clientY);
				
				//stores the last 5 values of deltaX
				speedsX.push(newX-prevX);
				prevX=newX;
				if(speedsX.length>5)
					speedsX=speedsX.slice(1);
				
				
				//stores the last 5 values of deltaY
				speedsY.push(newY-prevY);
				prevY=newY;
				if(speedsY.length>5)
					speedsY=speedsY.slice(1);
				
				timeStamp=ev.timeStamp;
				draggedObj.moveTo(newX,newY);
			}
			else if(ev.target.classList=="object"){
				infoTarget=ev.target;
			}
			updateInfo();
		}
	});
	
	
	container.addEventListener("mouseup",(ev)=>{
		draggingContainer=false;
		if (ev.button==0){
			if(draggedObj!=null){
				draggedObj.beingDragged=false;

				if(ev.timeStamp-timeStamp>50){
					speedsX=[0,0];
					speedsY=[0,0];
				}
				var sortedSpeedsX=speedsX.sort(absoluteSort);
				var sortedSpeedsY=speedsY.sort(absoluteSort);
				
				//uses the average of the two highest values to get the speed
				var speedX=(sortedSpeedsX[0]+sortedSpeedsX[1])/2;
				var speedY=(sortedSpeedsY[0]+sortedSpeedsY[1])/2;

				draggedObj.speedX=speedX;
				draggedObj.speedY=speedY;
				
				draggedObj.activated=true;
				//resets values
				speedsX=[0,0];
				speedsY=[0,0]
				draggedObj=null;
			}
		}
		else if(ev.button==2){
			if(ev.target.classList=="object"){
				ev.target.parentObject.remove();
			}
		}
	});
	
	var sideMenu=document.getElementsByClassName("side-menu")[0];
	var mainMenu=document.getElementById("main-menu");
	var spawnMenu=document.getElementById("spawn-menu");
	var spawnPlanetPop=document.getElementById("spawn-planet-pop");
	
	document.getElementById("spawn").addEventListener("click",menuButtonsActions);
	document.getElementById("spawn-back").addEventListener("click",menuButtonsActions)
	document.getElementById("spawn-planet").addEventListener("click",menuButtonsActions)
		
	
	function menuButtonsActions(ev){
		switch(ev.currentTarget.id){
			case "spawn":
				mainMenu.style.display="none";
				spawnMenu.style.display="block";
			break;
			case "spawn-back":
				mainMenu.style.display="block";
				spawnMenu.style.display="none";
			break;
			case "spawn-planet":
				//if is already displayed
				if(spawnPlanetPop.style.display=="block"&&draggedObj!=null){
					draggedObj.remove()
					spawnPlanetPop.style.display="none";
				}
				else{
					var [newX,newY]=screenToContanerPoint(ev.clientX, ev.clientY);
					draggedObj=new Body(0,0,menuValues.spawn.body.radius,0,0,menuValues.spawn.body.color,menuValues.spawn.body.density);
					
					draggedObj.activated=false;
					draggedObj.beingDragged=true;
					draggedObj.moveTo(newX,newY);
					
					spawnPlanetPop.style.display="block";
					
					updateMenuAndObject();
					
					//loads all color pickers if they havent been loaded
					Array.from(spawnPlanetPop.getElementsByClassName("color-picker")).forEach((colorPicker)=>{
						if(colorPicker.querySelector("canvas").width==300){
							loadColorPicker(colorPicker);
							loadHuePicker(colorPicker);
						}
					});
					
				}
			break;
		}
	}
	
	
	
	Array.from(document.getElementsByClassName("slider")).forEach((elem)=>{
		var inputFor=elem.parentElement.querySelector("label").innerHTML.toLowerCase()
		var maxValue=minMaxValues[inputFor].max;
		var minValue=minMaxValues[inputFor].min;
		
		//for logatithmic slider
		var logsl = new LogSlider({maxpos: 100, minval: minValue, maxval: maxValue});
		var numberElem=elem.parentElement.querySelector(".number");
		
		//when dragging slider
		elem.oninput = function(ev){
			var val = logsl.value(elem.value);
			numberElem.value=val.toFixed(0);
			
			menuValues.spawn.body[inputFor]=val;
			elem.parentElement.attributes.value=val;
			
			updateMenuAndObject();
		};
		
		//when slider released
		elem.onmouseup = function(ev){
			elem.value=logsl.position(elem.value); //applies logarithmic slider value
		};
		
		//when typing on number area
		numberElem.oninput = function(ev){
			//only allows numbers
			numberElem.value=numberElem.value.replace(/[^0-9]/g, '');
			
			elem.value=logsl.position(numberElem.value); //updates slider position
			
			numberElem.parentElement.attributes.value= numberElem.value;
			
			updateMenuAndObject();
		};
	});
	
	Array.from(document.getElementsByClassName("checkbox")).forEach((elem)=>{
		
		elem.onclick= function(ev){
			var inputFor=elem.parentElement.attributes.key;
			elem.parentElement.attributes.value= elem.checked;
			menuValues.spawn.body[inputFor]=elem.checked;
		}
		
	});

	//when moving mouse inside color canvas
	menuElems.spawn.body.color.querySelector(".color-canvas").addEventListener('mousemove',function(ev){
		updateMenuAndObject();
	});
	
	//when clicking inside color canvas
	menuElems.spawn.body.color.querySelector(".color-canvas").addEventListener('mousedown',function(ev){
		updateMenuAndObject();
	});
	
	//when moving mouse inside hue canvas
	menuElems.spawn.body.color.querySelector(".hue-canvas").addEventListener('mousemove',function(ev){
		updateMenuAndObject();
	});
	
	//when clicking inside hue canvas
	menuElems.spawn.body.color.querySelector(".hue-canvas").addEventListener('mousedown',function(ev){
		updateMenuAndObject();
	});
	
};

var infoTarget=null;
var prevInfoTarget=null;
var infoDelay=null;
function updateInfo(){
	//console.log(infoTarget)
	if(infoTarget!=null&&!infoTarget.parentObject.removed&&window.getComputedStyle(infoTarget).getPropertyValue('z-index')=="11"){
		if (infoDelay!=null){
			clearTimeout(infoDelay);
			infoDelay=null;
		}
		
		prevInfoTarget=infoTarget;
		
		posInfo(prevInfoTarget);
	}
	//else if(infoDelay==null){
		//infoDelay=setTimeout(()=>{
		//	disableInfo();
		//},3000);
	//}
	else if(prevInfoTarget!=null&&!prevInfoTarget.parentObject.removed){
		posInfo(prevInfoTarget);
	}
}

function disableInfo(){
	bodyInfo.style.opacity="0%";
	prevInfoTarget=null;
	infoDelay=null;
}

var positions={
	top:{borderStart:"borderBottomLeftRadius", borderEnd:"borderBottomRightRadius",arrowStart:"borderLeftWidth",arrowEnd:"borderRightWidth",move:moveInfoToTop},
	right:{borderStart:"borderTopLeftRadius", borderEnd:"borderBottomLeftRadius",arrowStart:"borderTopWidth",arrowEnd:"borderBottomWidth",move:moveInfoToRight},
	bottom:{borderStart:"borderTopLeftRadius", borderEnd:"borderTopRightRadius",arrowStart:"borderLeftWidth",arrowEnd:"borderRightWidth",move:moveInfoToBottom},
	left:{borderStart:"borderTopRightRadius", borderEnd:"borderBottomRightRadius",arrowStart:"borderTopWidth",arrowEnd:"borderBottomWidth",move:moveInfoToLeft}
	};

function moveInfoToLeft(target){
	
	infoArrow.className="";
	infoArrow.classList.add("info-arrow-right");
	bodyInfo.style.margin=0;
	bodyInfo.style.marginRight="10px";
	
	leftPos=target.getBoundingClientRect().x-bodyInfo.getBoundingClientRect().width-10;
	topPos=target.getBoundingClientRect().y+target.getBoundingClientRect().height/2-bodyInfo.getBoundingClientRect().height/2;
	
	[topPos,leftPos]=keepElemInsideScreen(topPos,leftPos);
	
	bodyInfo.style.top=topPos;
	bodyInfo.style.left=leftPos;
	
}
function moveInfoToRight(target){
	infoArrow.className="";
	infoArrow.classList.add("info-arrow-left");
	bodyInfo.style.margin=0;
	bodyInfo.style.marginLeft="10px";
	
	leftPos=target.getBoundingClientRect().x+target.getBoundingClientRect().width;
	topPos=target.getBoundingClientRect().y+target.getBoundingClientRect().height/2-bodyInfo.getBoundingClientRect().height/2;
	
	[topPos,leftPos]=keepElemInsideScreen(topPos,leftPos);
	
	bodyInfo.style.top=topPos;
	bodyInfo.style.left=leftPos;
}

function moveInfoToBottom(target){
	infoArrow.className="";
	infoArrow.classList.add("info-arrow-top");
	bodyInfo.style.margin=0;
	bodyInfo.style.marginTop="10px";
	
	leftPos=target.getBoundingClientRect().x+target.getBoundingClientRect().width/2-bodyInfo.getBoundingClientRect().width/2;
	topPos=target.getBoundingClientRect().y+target.getBoundingClientRect().height;
	
	[topPos,leftPos]=keepElemInsideScreen(topPos,leftPos);
	
	bodyInfo.style.top=topPos;
	bodyInfo.style.left=leftPos;
}
function moveInfoToTop(target){
	infoArrow.className="";
	infoArrow.classList.add("info-arrow-bottom");
	bodyInfo.style.margin=0;
	bodyInfo.style.marginBottom="10px";
	
	leftPos=target.getBoundingClientRect().x+target.getBoundingClientRect().width/2-bodyInfo.getBoundingClientRect().width/2;
	topPos=target.getBoundingClientRect().y-bodyInfo.getBoundingClientRect().height-10;
	
	[topPos,leftPos]=keepElemInsideScreen(topPos,leftPos);
	
	bodyInfo.style.top=topPos;
	bodyInfo.style.left=leftPos;
}

function keepElemInsideScreen(topPos,leftPos){
	var style = bodyInfo.currentStyle || window.getComputedStyle(bodyInfo),
    width = bodyInfo.offsetWidth, // or use style.width
	height = bodyInfo.offsetHeight,
    marginHor = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
	marginVer = parseFloat(style.marginTop) + parseFloat(style.marginBottom),
    padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
    border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
		
	var maxTop=document.body.clientHeight-(height+marginVer);
	var maxLeft=document.body.clientWidth-(width-marginHor);
	//keeps info inside screen vertically
	if (topPos<0)
		topPos=0;
	if (topPos>maxTop)
		topPos=	maxTop;
	//keeps info inside screen horizontally
	
	if (leftPos<0)
		leftPos=0;
	if (leftPos>maxLeft)
	{
		leftPos=maxLeft;
	}
	
	return [topPos,leftPos]
}

function pointIconTowards(icon,x,y,minValue=0.1){
	let totalSpeed=((x**2+y**2)**0.5);
	if(totalSpeed>=minValue/2){
		icon.style.transform="rotate("+Math.atan2(y,x)+"rad)";
		icon.classList.add("triangle");
	}
	else
	{
		icon.classList.add("square");
	}
}

function posInfo(target){
	var topPos;
	var leftPos;
	infoText=document.getElementById("info-text");
	infoArrow=document.getElementById("info-arrow");
	var infoPosToObj=positions.right;	
	
	if (target.getBoundingClientRect().y+target.getBoundingClientRect().height/2>document.body.clientHeight)
	{
		infoPosToObj=positions.top;
		
	}
	else if (target.getBoundingClientRect().y+target.getBoundingClientRect().height<0)
	{
		infoPosToObj=positions.bottom;
	}
	//moves info to the left if too much to the right
	else if (target.getBoundingClientRect().x+target.getBoundingClientRect().width+bodyInfo.getBoundingClientRect().width+11>document.body.clientWidth)
	{
		infoPosToObj=positions.left;		
	}
	//moves info to the right if theres enough space
	else{
		infoPosToObj=positions.right;
	}
	
	infoPosToObj.move(target);
	
	bodyInfo.style.top=topPos;
	bodyInfo.style.left=leftPos;
	
	
	infoText.innerHTML="Mass: "+parseInt(target.parentObject.mass)/1000+
	"<br>Radius: "+parseInt(target.parentObject.radius)+
	"<br>Density: "+parseInt(target.parentObject.density)+
	"<br>Speed: "+((target.parentObject.speedX**2+target.parentObject.speedY**2)**0.5).toFixed(1)+"  "+
	"<div id='info-icon-speed' class='info-icon'></div>"+
	"<br>Accel.: "+((target.parentObject.accX**2+target.parentObject.accY**2)**0.5).toFixed(2)+"  "+
	"<div id='info-icon-acc' class='info-icon'></div>";
	
	//bodyInfo.innerHTML+="<div id='info-triangle'></div>";
	//infoText.innerHTML+="<div id='info-icon'></div>";
	
	//infoTriangle=document.getElementById("info-triangle");
	infoIconSpeed=document.getElementById("info-icon-speed");
	infoIconAcc=document.getElementById("info-icon-acc");
	
	//infoTriangle.style.backgroundColor=target.parentObject.color;
	bodyInfo.style.borderColor=target.parentObject.color;

	//points icons to correct place
	pointIconTowards(infoIconSpeed,target.parentObject.speedX,target.parentObject.speedY);
	pointIconTowards(infoIconAcc,target.parentObject.accX,target.parentObject.accY,0.01);
	
	
	var arrowTop=target.getBoundingClientRect().y+target.getBoundingClientRect().height/2-infoText.getBoundingClientRect().y-3.5;
	var arrowLeft=target.getBoundingClientRect().x+target.getBoundingClientRect().width/2-infoText.getBoundingClientRect().x-1;
		
	var infoBottomBorder=infoPosToObj.name=="right"?"borderBottomLeftRadius":"borderBottomRightRadius";
	var infoTopBorder=infoPosToObj.name=="right"?"borderTopLeftRadius":"borderTopRightRadius";
	var infoLeftBorder=infoPosToObj.name=="top"?"borderBottomLeftRadius":"borderTopLeftRadius";
	var infoRightBorder=infoPosToObj.name=="top"?"borderBottomRightRadius":"borderTopRightRadius";
		
	infoBorderStart=infoPosToObj.borderStart
	
	infoArrow.style.left="";
	infoArrow.style.top="";
	infoArrow.style.borderWidth="";
	bodyInfo.style.borderRadius="10px";
	
	var maxVal;
	
	var arrowPos;
	if(infoPosToObj==positions.right||infoPosToObj==positions.left){
		maxVal=bodyInfo.getBoundingClientRect().height-15.5;
		arrowPos=arrowTop;
		
	}
	
	if(infoPosToObj==positions.top||infoPosToObj==positions.bottom){
		maxVal=bodyInfo.getBoundingClientRect().width-15.5;
		arrowPos=arrowLeft;
	}
	
	
	var minVal=-14.5;
	
	//if arrow is above maxVal
	if (arrowPos<=maxVal){
		
		//starts to square the border of the info
		if(arrowPos>maxVal-20){
			bodyInfo.style[infoPosToObj.borderEnd]=((maxVal-arrowPos)/2)+"px";
		}
		//starts to change the shape of the triangle 
		if(arrowPos>maxVal-10){
			infoArrow.style[infoPosToObj.arrowEnd]=13-(arrowPos-(maxVal-10))*1.3;
		}
		
	}
	//if its trying to go beying minVal
	else{
		arrowPos=maxVal;
		infoArrow.style[infoPosToObj.arrowEnd]=0;
		bodyInfo.style[infoPosToObj.borderEnd]=0;
	}
	
	if (arrowPos>=minVal){
		//starts to square the border
		if(arrowPos<minVal+20){
			bodyInfo.style[infoPosToObj.borderStart]=(-(minVal-arrowPos)/2)+"px";
		}
		//starts to change the shape of the triangle
		if(arrowPos<-3){
			infoArrow.style[infoPosToObj.arrowStart]=13+(arrowPos+3)*0.9;
			arrowPos=-3;
		}
		
	}
	//if its going beyong minVal
	else{
		arrowPos=-3;
		infoArrow.style[infoPosToObj.arrowStart]=0;
		bodyInfo.style[infoPosToObj.borderStart]=0;
	}
	
	if(infoPosToObj==positions.right||infoPosToObj==positions.left){
		infoArrow.style.top=arrowPos;
	}
	
	if(infoPosToObj==positions.top||infoPosToObj==positions.bottom){
		infoArrow.style.left=arrowPos;
	}
	
	
	bodyInfo.style.opacity="100%";
		
}

function updateMenuAndObject(){
	if(draggedObj!=null){
		updateMenuValues();
		updateDraggedObject(menuValues.spawn.body);
	}
}

function updateMenuValues(){
	Array.from(document.getElementsByClassName("input-section")).forEach((elem)=>{
		var key1=elem.attributes.key.value;
		var key2=elem.parentElement.attributes.key.value;
		var key3=elem.parentElement.parentElement.attributes.key.value;
		menuElems[key3][key2][key1]=elem;
		let foundValue=menuElems[key3][key2][key1].attributes.value;
		if (foundValue!=undefined)
			menuValues[key3][key2][key1]=foundValue;
		
	});
}

function updateDraggedObject(values){
	Object.keys(values).forEach((key)=>{
		draggedObj[key]=values[key];
	});
	draggedObj.updateValues();
	
}

var menuValues={spawn:{body:{mass:50, radius:50, density:10, color:"eeeeee"},isGhost:false}};
var menuElems={spawn:{body:{}}};
const minMaxValues={mass:{min:1,max:1000000},radius:{min:1,max:1000},density:{min:1,max:1000}};