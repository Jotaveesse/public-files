window.onload = function () {
	setup();
	//selectMenuSetup();
};

var chosenFiles = [];
var toExt;
var filesFinished = 0;
var filesInBatch = 0;
var converting = false;

var fileElemTemplate;
var fileList;
var generalExtSelect;
var progressArea;
var generalConvertButton;
var percBar;
var percText;

function setup() {
	selectMenuSetup();

	const addButton = document.getElementById('add-button');
	const generalRemoveButton = document.getElementById('general-remove-button');
	const fileArea = document.getElementById('file-area');
	generalConvertButton = document.getElementById('general-convert-button');
	generalExtSelect = document.getElementById('general-ext-select');
	fileElemTemplate = document.getElementById('file-elem-template');
	fileList = document.getElementById('file-list');
	progressArea = document.getElementById('progress-area');
	percBar = progressArea.querySelector('.bar');
	percText = progressArea.querySelector('.progress-text span');

	//TODO trocar funçao pra area de arquivos
	//quando o usuario move um arquivo na area de drop
	fileArea.addEventListener("dragover", function (ev) {
		ev.preventDefault();
	});

	//quando o usuario dropa um arquivo na area drop
	fileArea.addEventListener("drop", function (ev) {
		ev.preventDefault();
		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			var filesArr = [...ev.dataTransfer.items].map(item => item.getAsFile());
			updateFiles(filesArr);
		} else {
			// Use DataTransfer interface to access the file(s)
			updateFiles([...ev.dataTransfer.files]);
		}
	});

	//quando o usuario clica no botao de adicionar arquivo
	addButton.addEventListener("click", function () {
		var input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;

		input.onchange = e => {
			updateFiles(e.target.files);
		}
		input.click();
	});

	//quando o usuario clica no botao de convert
	generalConvertButton.addEventListener("click", function () {
		if (!converting) {
			toExt = generalExtSelect.value;

			if (toExt == "null") {
				return;
			}
			updateBar();

			// adiciona todos os arquivos que nao estao na fila à fila
			chosenFiles.forEach(file => {
				if (!file.isConverting) {
					filesInBatch++;
					filesToConvert.push(file);

					file.isInLine = true;
					file.updateConvertingState();
				}
			});
			//impede que o transcode seja chamado diversas vezes
			converting = true;
			transcode(toExt);
		}
		else {
			stopConversion();
		}
	});

	//quando clica no botão de remover
	generalRemoveButton.addEventListener("click", function () {
		chosenFiles.forEach(chosenFile => {
			chosenFile.remove();
		});
		updateFiles();
	});

}

function convertImage(inputImage, format) {
	const reader = new FileReader();
	console.log(inputImage)

	reader.onload = function (event) {
		const img = new Image();

		img.onload = function () {
			const canvas = document.createElement('canvas');
			document.body.appendChild(canvas);
			const ctx = canvas.getContext('2d');

			// const convertedImage = new Image();
			// convertedImage.src = newImageData;
			
			const svgElement = document.createElement('div');
			svgElement.innerHTML = event.target.result;
			svgElement.style.visibility = "hidden";
			svgElement.style.position = "absolute";
			
			document.body.appendChild(svgElement);
			const  bbox=svgElement.children[0].getBBox();
			// Set canvas dimensions to match the image
			canvas.width = bbox.width;
			canvas.height = bbox.height;
			
			console.log(svgElement.children[0].getBBox());
			//svgElement.remove();

			// Draw the image onto the canvas
			ctx.drawImage(img, 0, 0);
			
			const newImageData = canvas.toDataURL('image/' + format, 1.0);
	
			console.log(newImageData)

			download(newImageData, inputImage.name.split('.')[0] + "." + format);
		};

		img.src = 'data:image/svg+xml;base64,' + btoa(event.target.result);
	};

	reader.readAsText(inputImage);


}

function updateFiles(files = []) {
	const fromExts = [];

	//extrai e adiciona os arquivos a lista
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const fileWrap = new FileClass(file, fileElemTemplate, fileList);

		chosenFiles.push(fileWrap);
	};
	console.log(files);

	//extrai as entensoes de todos os arquivos
	chosenFiles.forEach(chosenFile => {
		fromExts.push(chosenFile.extension);
	});


	if (fromExts.length === 0) {
		changeSelectOptions(generalExtSelect, ["Formatos"], [null]);
	}
	else {
		var avlbConvExts = allFormats;
		//filtra todas as conversoes disponiveis
		fromExts.forEach(ext => {
			const convFormats = FORMATS[ext].convertions;
			avlbConvExts = avlbConvExts.filter(format => convFormats.includes(format));
		});

		console.log(avlbConvExts);

		if (avlbConvExts.length === 0) {

			changeSelectOptions(generalExtSelect, ["Formatos"], [null]);
		}
		else
			changeSelectOptions(generalExtSelect, avlbConvExts);
	}
}

function updateBar() {
	var perc = filesFinished / filesInBatch;

	if (perc < 0)
		perc = 0;

	if (isNaN(perc) || perc >= 1) {
		toggleElement(percBar, false);
		toggleElement(percText, false);
		//updateConvertingState(false)
	}
	else {
		toggleElement(percBar, true);
		toggleElement(percText, true);
	}

	percBar.style.width = (100 - 100 * perc) + "%";
	percText.innerHTML = Math.round(100 * perc) + "%";
}

function changeSelectOptions(sel, options, values = []) {
	sel.innerHTML = "";

	for (i = 0; i < options.length; i++) {
		let elem = document.createElement("option");
		elem.value = values.length > 0 ? values[i] : options[i];
		elem.innerHTML = options[i];
		sel.appendChild(elem);
	}
	selectMenuSetup();
}

function stopConversion() {
	if (ffmpeg != null)
		ffmpeg.terminate();

	filesInBatch = 0;
	filesFinished = 0;

	//itera sobre todos os arquivos na fila
	while (filesToConvert.length != 0) {
		file = filesToConvert[0];
		file.stopConversion();
		ffmpeg.terminate();
	}

	toggleElement(percBar, false);
	toggleElement(percText, false);
	//updateConvertingState();
}

function updateConvertingState() {
	var areConverting = false;
	var areInLine = false;

	//checa os estados de todos os arquivos
	chosenFiles.forEach(file => {
		if (file.isConverting)
			areConverting = true;

		if (file.isInLine)
			areInLine = true;
	});

	converting = areConverting;

	generalConvertButton.innerText = converting || areInLine ? "Cancelar" : "Converter Todos";

	if (!converting && !areInLine) {
		toggleElement(percBar, false);
		toggleElement(percText, false);
	}
}