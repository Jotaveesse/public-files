const N = 16384;
const r = 8;
const p = 1;
const dkLen = 32; // Key length in bytes

async function derivate(password, salt) {
    var derivatedKey;

    await scrypt.scrypt(
        textEncoder.encode(password),
        new Uint8Array(salt),
        N,
        r,
        p,
        dkLen,
        updateProgressBar
    )
        .then(async function (key) {
            derivatedKey = key;
        })
        .catch(function (err) {
            console.error("Derivation error:", err);
        });

    return derivatedKey;
}

async function encrypt(plaintextData, password, saltValue, ivValue, addiData) {
    const key = await derivate(password, saltValue);

    var encrypted;

    encryptionParams = {
        name: "AES-GCM",
        iv: ivValue,
        tagLength: 128,
        additionalData: addiData
    };

    await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    )
        .then(async function (cryptoKey) {
            await crypto.subtle.encrypt(encryptionParams, cryptoKey, plaintextData)
                .then(function (encryptedData) {
                    encrypted = encryptedData;
                })
                .catch(function (err) {
                    console.error("Encryption error:", err);
                });
        })
        .catch(function (err) {
            console.error("Key import error:", err);
        })

    return encrypted;
}

async function decrypt(dataToDecode, password, saltValue, ivValue, addiData) {
    const key = await derivate(password, saltValue);

    var decrypted;

    decryptionParams = {
        name: "AES-GCM",
        iv: ivValue,
        tagLength: 128,
        additionalData: addiData
    };

    await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    )
        .then(async function (cryptoKey) {
            await crypto.subtle.decrypt(decryptionParams, cryptoKey, dataToDecode)
                .then(function (decryptedData) {
                    decrypted = textDecoder.decode(decryptedData);
                })
                .catch(function (err) {
                    console.error("Decryption error:", err);
                });
        })
        .catch(function (err) {
            console.error("Key import error:", err);
        });

    return decrypted;
}

async function encryptDefault(text, password) {
	var encripted;
	
	const inputStringBuffer = textEncoder.encode(text);

	//generates a random string and iv
	const saltArrBuf = randBytes(16);
	const ivArrBuf = randBytes(16);
	const addiData = new Uint8Array(saltArrBuf.length + ivArrBuf.length);

	//additional data contains the salt and the iv
	addiData.set(saltArrBuf);
	addiData.set(ivArrBuf, saltArrBuf.length);

	await encrypt(inputStringBuffer, password, saltArrBuf, ivArrBuf, addiData)
		.then((encr) => {
			const cipherArrBuf = encr.slice(0, encr.byteLength - 16);
			const tagArrBuf = encr.slice(encr.byteLength - 16);

			encripted = encryptTemplate.replace("salt_value", arrayBufferToBase64(saltArrBuf));
			encripted = encripted.replace("iv_value", arrayBufferToBase64(ivArrBuf));
			encripted = encripted.replace("tag_value", arrayBufferToBase64(tagArrBuf));
			encripted = encripted.replace("cipher_value", arrayBufferToBase64(cipherArrBuf));
		});

	return encripted;
}

async function decryptDefault(text, password) {
	var decrypted;

	//separates the xml aprt from the cipher part
	const xmlString = text.substring(0, text.indexOf("</nppcrypt>") + 11);
	const cipherB64 = text.substring(text.indexOf("</nppcrypt>") + 11);

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlString, "text/xml");

	if (xmlDoc.activeElement.tagName == "parsererror") {
		displayError(Errors.BAD_XML);
	}
	else {
		try {
			//separates the xml nodes
			var keyNode = xmlDoc.getElementsByTagName("key")[0];
			var ivNode = xmlDoc.getElementsByTagName("iv")[0];
			var tagNode = xmlDoc.getElementsByTagName("tag")[0];

			var saltB64 = keyNode.getAttribute("salt");
			var ivB64 = ivNode.getAttribute("value");
			var tagB64 = tagNode.getAttribute("value");
			var addiB64 = joinBase64(saltB64, ivB64);	//additional data contains salt and the iv

			var saltArrBuf = base64ToArrayBuffer(saltB64)
			var ivArrBuf = base64ToArrayBuffer(ivB64)
			var addiArrBuf = base64ToArrayBuffer(addiB64);

			var dataArrBuf = base64ToArrayBuffer(joinBase64(cipherB64, tagB64));

			await decrypt(dataArrBuf, password, saltArrBuf, ivArrBuf, addiArrBuf).then((decr) => {
				decrypted = decr;
			});
		}
		catch {
			displayError(Errors.CORRUPTED_CIPHER);
		}

		return decrypted;
	}
}