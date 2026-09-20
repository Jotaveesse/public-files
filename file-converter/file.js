class FileClass {
    isConverting = false;
    isInLine = false;
    convertingProgress = 0;

    #convertButton;
    #percText;
    #percBar;
    #fileElem;
    #nameElem;
    #removeButton;

    constructor(file, template, list) {
        this.file = file;
        this.name = file.name;
        this.extension = file.name.split('.').pop().toLowerCase();

        this.createElem(template, list);
        this.middleConvertion();
    }

    createElem(template, list) {
        this.#fileElem = template.content.cloneNode(true);
        this.#nameElem = this.#fileElem.querySelector('.file-name span');
        this.#removeButton = this.#fileElem.querySelector(".file-remove");
        this.#convertButton = this.#fileElem.querySelector(".file-convert");
        this.#percBar = this.#fileElem.querySelector('.bar');
        this.#percText = this.#fileElem.querySelector('.file-progress-text span');

        this.#nameElem.innerHTML = this.name;

        list.appendChild(this.#fileElem);

        //quando clica no botao de converter/cancelar
        this.#convertButton.addEventListener("click", () => {
            if (!this.isConverting && !this.isInLine) {
                toExt = generalExtSelect.value;

                if (toExt == "null") {
                    return;
                }

                filesInBatch++;
                filesToConvert.push(this);

                if (!converting) {
                    transcode(toExt);
                }
                else{
                    this.isInLine = true;
                }

                this.updateConvertingState();
                this.updateProgress(0);
            }
            else {
                this.stopConversion();
            }
        });

        // quando clica no botão de remover
        this.#removeButton.addEventListener("click", () => {
            this.remove();
            updateFiles();
        });

        this.elem = list.lastElementChild;
    }

    remove() {
        chosenFiles = chosenFiles.filter(item => item !== this);
        this.elem.remove();
        this.stopConversion();
    }

    stopConversion() {
        //cancelar ffmpeg só se esse for o arquivo que esta sendo covnertido
        if (this.isConverting) {
            ffmpeg.terminate();
            this.isConverting = false;
        }
        //apenas se remove da lista caso contrario
        else if (this.isInLine) {
            var arrInd = filesToConvert.findIndex((file) => file === this);
            filesToConvert.splice(arrInd, 1);
            this.isInLine = false;
        }

        filesInBatch--;
        this.updateConvertingState();
    }

    updateProgress(value) {
        this.convertingProgress = value;
        if (value < 0)
            value = 0;

        this.#percBar.style.width = (100 - 100 * value) + "%";
        this.#percText.innerHTML = Math.round(100 * value) + "%";
    }

    updateConvertingState() {
        this.#convertButton.innerText = this.isInLine || this.isConverting ? "Cancelar" : "Converter";

        //se terminou conversão  nao reseta a barra
        if (this.convertingProgress < 1) {
            this.#percBar.style.width = "100%";
            this.#percText.innerHTML = "0%";
        }

        //atualiza o estado global
        updateConvertingState();
    }

    middleConvertion(){
        if(this.extension=="svg"){
            convertImage(this.file, "png");
        }
    }
}