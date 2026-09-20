
function setupColor(){
	Array.from(document.getElementsByClassName("color-picker")).forEach((colorPicker)=>{
		var colorCanvas = colorPicker.querySelector(".color-canvas");
		var hueCanvas = colorPicker.querySelector(".hue-canvas");
		
		var lastColorX=0;
		var lastColorY=0;
		
		var draggingOnCanvas=false;
		var draggingOnHueCanvas=false;
		
		//when user clicks on color canvas
		colorCanvas.addEventListener('mousedown',function(ev){
			draggingOnCanvas=true;
			
			lastColorX = ev.clientX-colorCanvas.getBoundingClientRect().x;  // Get X coordinate and save its position
			lastColorY = ev.clientY-colorCanvas.getBoundingClientRect().y;  // Get Y coordinate and save its position
			
			clickOnColorCanvas(colorPicker,ev.clientX, ev.clientY);
		});
		
		//when user drags on color canvas
		colorCanvas.addEventListener('mousemove',function(ev){
			if(draggingOnCanvas){
				lastColorX = ev.clientX-colorCanvas.getBoundingClientRect().x;  // Get X coordinate and save its position
				lastColorY = ev.clientY-colorCanvas.getBoundingClientRect().y;  // Get Y coordinate and save its position
				
				clickOnColorCanvas(colorPicker,ev.clientX, ev.clientY);
				
			}
		 });
		 
		//when user presses down on hue canvas
		hueCanvas.addEventListener('mousedown',function(ev){
			draggingOnHueCanvas=true;
			
			clickOnHueCanvas(colorPicker,ev.clientX, ev.clientY);
			colorCanvas.parentElement.attributes.value=getColorAtPoint(colorCanvas,lastColorX,lastColorY);
		});
		
		//when user drags on hue canvas
		hueCanvas.addEventListener('mousemove',function(ev){
			if(draggingOnHueCanvas){
				clickOnHueCanvas(colorPicker,ev.clientX, ev.clientY);
				colorCanvas.parentElement.attributes.value=getColorAtPoint(colorCanvas,lastColorX,lastColorY);
			}
		});
		
		//when user releases mouse button
		window.addEventListener('mouseup',function(ev){
			draggingOnHueCanvas=false;
			draggingOnCanvas=false;
		});
	});

}

function clickOnColorCanvas(colorPicker,x,y){
	var marker = colorPicker.querySelector(".color-marker");
	var colorCanvas = colorPicker.querySelector(".color-canvas");
	
	x = x-colorCanvas.getBoundingClientRect().x;  // corrects x coordinate to be inside canvas
	y = y-colorCanvas.getBoundingClientRect().y;  // corrects y coordinate to be inside canvas
	
	//moves marker to the mouse position
	marker.style.left=x-marker.getBoundingClientRect().width/2;
	marker.style.top=y-marker.getBoundingClientRect().height/2;

	let rgb = getColorAtPoint(colorCanvas,x,y);
	
	colorPicker.attributes.value=rgb;
}

function clickOnHueCanvas(colorPicker,x,y){
	var marker = colorPicker.querySelector(".hue-marker");
	var hueCanvas = colorPicker.querySelector(".hue-canvas");
	var colorCanvas = colorPicker.querySelector(".color-canvas");
	
	x = x-hueCanvas.getBoundingClientRect().x;  // corrects x coordinate to be inside canvas
	
	//hueCanvasY - parentY + half height of hueCanvas gives a point in the middle of the hueCanvas
	let markerY=hueCanvas.getBoundingClientRect().y-hueCanvas.parentElement.getBoundingClientRect().y+hueCanvas.getBoundingClientRect().height/2;
	
	marker.style.left=x-marker.getBoundingClientRect().width/2; //moves marker x to the same mouse x
	marker.style.top=markerY-marker.getBoundingClientRect().height/2; //keeps marker in the middle
	
	rgb = getColorAtPoint(hueCanvas,x,0);
	//updates the color canvas
	loadColorPicker(colorPicker, rgb);
}

function loadColorPicker(colorPicker, color="f00"){
	var marker = colorPicker.querySelector(".color-marker");
	var colorCanvas = colorPicker.querySelector(".color-canvas");
	
	colorCanvas.width=colorCanvas.getBoundingClientRect().width;
	colorCanvas.height=colorCanvas.getBoundingClientRect().height;
	
	var ColorCtx = colorCanvas .getContext('2d');  // This create a 2D context for the canvas

	//creates a vertical gradient(white to black)
	gradientV = ColorCtx.createLinearGradient(0, 0, 0, ColorCtx.canvas.height);
	gradientV.addColorStop(0, 'rgba(0,0,0,0)');
	gradientV.addColorStop(1, '#000');
	//creates a horizontal gradient with the specified color
	gradientB = ColorCtx.createLinearGradient(0, 0, ColorCtx.canvas.width, 0);
	gradientB.addColorStop(0, 'rgba(0,0,0,0)');
	gradientB.addColorStop(1, '#'+color);
	//makes background white
	ColorCtx.fillStyle = "white";
	ColorCtx.fillRect(0, 0, ColorCtx .canvas.width, 
	ColorCtx.canvas.height); 
	
	ColorCtx.fillStyle = gradientB;
	ColorCtx.fillRect(0, 0, ColorCtx .canvas.width, 
	ColorCtx.canvas.height); 
	
	ColorCtx.fillStyle = gradientV;
	ColorCtx.fillRect(0, 0, ColorCtx .canvas.width, 
	ColorCtx.canvas.height); 
}

function loadHuePicker(colorPicker){
		var marker = colorPicker.querySelector(".hue-marker");
		var hueCanvas = colorPicker.querySelector(".hue-canvas");
		
		let x = 2;
		//hueCanvasY - parentY + half height of hueCanvas gives a point in the middle of the hueCanvas
		let y = hueCanvas.getBoundingClientRect().y-hueCanvas.parentElement.getBoundingClientRect().y+hueCanvas.getBoundingClientRect().height/2;
		
		marker.style.left=x-marker.getBoundingClientRect().width/2; //centers the marker x
		marker.style.top=y-marker.getBoundingClientRect().height/2; //centers the marker y
		
		hueCanvas.width=hueCanvas.getBoundingClientRect().width;
		hueCanvas.height=hueCanvas.getBoundingClientRect().height;

		var hueCtx = hueCanvas .getContext('2d');  // This create a 2D context for the canvas
		
		//creates a hue gradient
		var gradientV = hueCtx.createLinearGradient(0, 0, hueCtx.canvas.width,0);
		gradientV.addColorStop(0, '#f00');
		gradientV.addColorStop(1/6, '#ff0');
		gradientV.addColorStop(2/6, '#0f0');
		gradientV.addColorStop(3/6, '#0ff');
		gradientV.addColorStop(4/6, '#00f');
		gradientV.addColorStop(5/6, '#f0f');
		gradientV.addColorStop(1, '#f00');
		
		hueCtx.fillStyle = gradientV;
		hueCtx.fillRect(0, 0, hueCtx.canvas.width, 
		hueCtx.canvas.height); 
	}

function getColorAtPoint(canvas, x,y){
	var ColorCtx = canvas.getContext('2d');  // This create a 2D context for the canvas
		
	pixel = ColorCtx.getImageData(x,y,1,1)['data'];   // Read pixel Color
	
	let red=pixel[0]<=15?"0"+pixel[0].toString(16):pixel[0].toString(16);
	let green=pixel[1]<=15?"0"+pixel[1].toString(16):pixel[1].toString(16);
	let blue=pixel[2]<=15?"0"+pixel[2].toString(16):pixel[2].toString(16);
	
	return red+green+blue;
}