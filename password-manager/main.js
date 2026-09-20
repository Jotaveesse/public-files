const emptyData = { "Pessoa": { "Conta": [{ "username": "", "password": "" }] } };
const encryptTemplate = `<nppcrypt version="1016">
<encryption cipher="rijndael" key-length="32" mode="gcm" aad="true" encoding="base64" />
<key algorithm="scrypt" N="16384" r="8" p="1" salt="salt_value" />
<iv value="iv_value" method="random" /><tag value="tag_value" />
</nppcrypt>
cipher_value`;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const Errors = {
	WRONG_PASSWORD: "Wrong password",
	CORRUPTED_CIPHER: "Corrupted cipher",
	BAD_XML: "Badly formatted XML",
	BAD_JSON: "Badly formatted JSON",
}

var inputArea;
var passwordArea;
var outputArea;
var jsonArea;
var personTemp;
var accountTemp;
var loginTemp;
var progressBar;
var bar;
var errorMessage;

var busy = false;

window.onload = function () {
	inputArea = document.getElementById("input-area");
	passwordArea = document.getElementById("password-area");
	outputArea = document.getElementById("output-area");
	jsonArea = document.getElementById("json-section")
	fileInput = document.getElementById("file-input");

	bar = document.getElementById("bar");
	progressBar = document.getElementById("progress-bar");
	errorMessage = document.getElementById("error-message");

	personTemp = document.getElementById("person-template");
	accountTemp = document.getElementById("account-template");
	loginTemp = document.getElementById("login-template");

	document.getElementById("save-button").onclick = async function () {
		download(outputArea.value, "data.txt", "txt")
	};

	document.getElementById("encrypt-button").onclick = async function () {
		if (!busy) {
			busy = true;

			errorMessage.style.display = "none";

			var extractedJson = extractJson();
			jsonData = JSON.stringify(extractedJson);

			var encrData = await encryptDefault(jsonData, passwordArea.value);
			outputArea.value = encrData;

			busy = false;
		}
	};

	document.getElementById("display-button").onclick = async function () {
		if (!busy) {
			busy = true;

			errorMessage.style.display = "none";

			var decrData = await decryptDefault(inputArea.value, passwordArea.value);
			var jsonData;

			if (decrData == undefined) {
				displayError(Errors.WRONG_PASSWORD);
			}
			else {
				try {
					jsonArea.innerHTML = "";
					jsonData = JSON.parse(decrData);
					createPersonElems(jsonData, jsonArea);
				}
				catch (error) {
					displayError(Errors.BAD_JSON)
				}
			}

			busy = false;
		}
	};

	document.getElementById("new-person-button").onclick = function () {
		createPersonElems(emptyData, jsonArea);
	};

	document.getElementById("crypt-show-button").onclick = function () {
		togglePassword(this, passwordArea);
	};

	fileInput.onchange = function () {
		this.files[0].text().then(function (data) {
			inputArea.value = data;
		});
	}
};

function createPersonElems(data, parent) {
	Object.keys(data).forEach(person => {
		const personElem = personTemp.content.cloneNode(true);
		const personAccounts = personElem.querySelector(".person-accounts");
		const newAccountButton = personElem.querySelector(".new-button");
		const dropButton = personElem.querySelector(".dropdown-button");
		const removeButton = personElem.querySelector(".remove-button");
		const personTitle = personElem.querySelector(".person-title");

		personTitle.innerHTML = person;
		personTitle.ondblclick = editField;

		//hides the accounts and flips the dropdown
		dropButton.onclick = function () {
			toggleHideElem(personAccounts);
			toggleHideElem(newAccountButton);

			let buttonClasses = this.children[0].classList;
			let isRotated = buttonClasses.contains("rotate180");

			if (isRotated)
				buttonClasses.remove("rotate180");
			else
				buttonClasses.add("rotate180");
		};

		newAccountButton.onclick = function () {
			createAccountElems(emptyData.Pessoa, personAccounts);
		};

		removeButton.onclick = function () {
			this.parentElement.parentElement.remove()
		};

		//clicks to hide the accounts initially
		dropButton.click();

		parent.appendChild(personElem);

		createAccountElems(data[person], personAccounts);
	});
}

function createAccountElems(person, parent) {
	
	var accountElems = []
	
	Object.keys(person).forEach(account => {
		const accountElem = accountTemp.content.cloneNode(true);
		const accountData = accountElem.querySelector(".account-data");
		const newLoginButton = accountElem.querySelector(".new-button");
		const removeButton = accountElem.querySelector(".remove-button");
		const accountTitle = accountElem.querySelector(".account-title");
		accountTitle.innerHTML = account;
		accountTitle.ondblclick = editField;

		newLoginButton.onclick = function () {
			createLoginElems(emptyData.Pessoa.Conta, accountData);
		};

		removeButton.onclick = function () {
			this.parentElement.parentElement.remove()
		};

		accountElems.push({accountElem, account})
	});

	var sorted = accountElems.sort((a, b) => a.account.localeCompare(b.account));
	
	sorted.forEach(elem => {
		const accountData = elem['accountElem'].querySelector(".account-data");
		parent.appendChild(elem['accountElem']);

		createLoginElems(person[elem["account"]], accountData);
	});


}

function createLoginElems(account, parent) {
	account.forEach(login => {
		const loginElem = loginTemp.content.cloneNode(true);

		const removeButton = loginElem.querySelector(".remove-button");
		const showButton = loginElem.querySelector(".show-button");
		const loginField = loginElem.querySelector(".login-field");
		const passwordField = loginElem.querySelector(".password-field");

		const loginInput = loginField.getElementsByTagName("input")[0];
		const passwordInput = passwordField.getElementsByTagName("input")[0];

		loginInput.value = login.username;
		passwordInput.value = login.password;

		removeButton.onclick = function () {
			this.parentElement.remove()
		};

		showButton.onclick = function () {
			togglePassword(this, passwordInput);
		};

		//inserts before the new button
		parent.insertBefore(loginElem, parent.querySelector(".new-button"));
	});
}

function extractJson() {
	const extractedJson = {};

	//extracts each person
	Array.from(jsonArea.children).forEach(personElem => {
		const personAccounts = personElem.querySelector(".person-accounts");
		const personTitle = personElem.querySelector(".person-title").innerHTML;
		extractedJson[personTitle] = {};

		//extracts each account
		Array.from(personAccounts.children).forEach(accountElem => {
			const accountData = accountElem.querySelector(".account-data");
			const accountTitle = accountElem.querySelector(".account-title").innerHTML;
			extractedJson[personTitle][accountTitle] = [];

			//extracts each login
			Array.from(accountData.querySelectorAll(".data-row")).forEach(loginElem => {
				const loginField = loginElem.querySelector(".login-field");
				const passwordField = loginElem.querySelector(".password-field");

				const loginInput = loginField.getElementsByTagName("input")[0];
				const passwordInput = passwordField.getElementsByTagName("input")[0];

				extractedJson[personTitle][accountTitle].push({
					"username": loginInput.value,
					"password": passwordInput.value
				});
			});
		});
	});

	return extractedJson;
}

function toggleHideElem(elem) {
	let isHidden = elem.style.display == "none";
	elem.style.display = isHidden ? "" : "none";
}

function editField() {
	if (this.childElementCount == 0) {
		const input = document.createElement("input");

		input.value = this.innerHTML;
		input.onblur = function () {
			var val = this.value;
			this.parentNode.innerHTML = val;
		}
		this.innerHTML = "";

		this.appendChild(input);
		input.focus();
	}
}

function togglePassword(self, elem) {
	let isShowing = self.attributes.showing.value == "true";
	self.children[0].src = isShowing ? "images/eye-open.svg" : "images/eye-closed.svg";
	elem.type = isShowing ? "password" : "text";

	self.setAttribute("showing", !isShowing);
}

function updateProgressBar(progress) {
	if (progress == 1)
		progressBar.style.display = "none";
	else {
		progressBar.style.display = "block";
		bar.style.width = (progress * 100) + "%";
	}
}

function displayError(err) {
	if (errorMessage.style.display == "none") {
		errorMessage.innerHTML = err;
		errorMessage.style.display = "block";
	}
}

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}