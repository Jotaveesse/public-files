
function randBytes(len) {
    var buffer = new Uint8Array(len);
    crypto.getRandomValues(buffer);
    return buffer;
}

function splitBase64(base64String, midpoint) {
    var binaryString = atob(base64String);

    if (midpoint < 0)
        midpoint = binaryString.length - Math.abs(midpoint);

    // Split the binary representation into two halves
    var firstHalfBinary = binaryString.substring(0, midpoint);
    var secondHalfBinary = binaryString.substring(midpoint);

    // Convert each half back to Base64
    var firstHalfBase64 = btoa(firstHalfBinary);
    var secondHalfBase64 = btoa(secondHalfBinary);

    return [firstHalfBase64, secondHalfBase64];
}

function joinBase64(string1, string2) {
    const decodedStr1 = atob(string1);
    const decodedStr2 = atob(string2);
    const joinedStr = decodedStr1 + decodedStr2;
    const encodedJoinedStr = btoa(joinedStr);
    return encodedJoinedStr;
}

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; ++i) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function stringToBase64(str) {
    // Convert the string to a UTF-8 encoded byte array
    var data = textEncoder.encode(str);

    // Convert the byte array to a Base64 string
    var base64 = btoa(String.fromCharCode.apply(null, data));

    return base64;
}

function base64ToString(base64) {
    // Convert the Base64 string to a byte array
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; ++i) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert the byte array to a UTF-8 encoded string
    var str = textDecoder.decode(bytes);

    return str;
}