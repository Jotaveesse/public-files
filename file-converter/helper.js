
function download(data, name) {
	// console.log(file);
	var src;
	if (isDataURL(data))
		src = data;
	else {
		var blob = new Blob([data]);
		src = window.URL.createObjectURL(blob);
	}
	var a = document.createElement('a');
	a.download = name;
	a.href = src
	a.click();
	a.remove();
}

function dataURLtoBlob(dataURL) {
	// Split the Data URL into two parts: metadata (data type and encoding) and the base64-encoded data
	const parts = dataURL.split(';base64,');
	const contentType = parts[0].split(':')[1];
	const raw = window.atob(parts[1]);
	const rawLength = raw.length;
	const uInt8Array = new Uint8Array(rawLength);

	// Convert the base64-encoded binary data to a Uint8Array
	for (let i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}

	// Create a Blob object from the Uint8Array and return it
	return new Blob([uInt8Array], { type: contentType });
}

function toggleElement(element, show = null) {
	if (show === null) {
		if (element.style.display === "none") {
			element.style.display = "block";
		} else {
			element.style.display = "none";
		}
	}
	else {
		element.style.display = show ? "block" : "none";
	}
}

function isDataURL(input) {
	return typeof input === 'string' && /^data:/.test(input);
}