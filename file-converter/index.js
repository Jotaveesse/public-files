const { fetchFile } = FFmpegUtil;
const { FFmpeg } = FFmpegWASM;
let ffmpeg = null;
var filesToConvert = [];

async function transcode(toExt) {
    var file;
    filesFinished = 0;

    if (ffmpeg === null){
        ffmpeg = new FFmpeg();
        ffmpeg.on("log", ({ message }) => {
            console.log(message);
        })
    }

    if (!ffmpeg.loaded) {
        await ffmpeg.load({
            coreURL: "/ffmpeg/core/ffmpeg-core.js",
        });
    }

    while (filesToConvert.length != 0) {
        try {
            // caso tenha avido um terminate da reload
            if (!ffmpeg.loaded) {
                await ffmpeg.load({
                    coreURL: "/ffmpeg/core/ffmpeg-core.js",
                });
            }

            file = filesToConvert.shift();

            function onProgress({ progress, time }) {
                file.updateProgress(progress);
                if (progress < 1)
                    filesFinished = Math.floor(filesFinished) + progress;
                updateBar();
            }
            ffmpeg.on("progress", onProgress);


            const newName = file.name.split(".")[0] + '.' + toExt;
            const inputName = "input-" + file.name;

            await ffmpeg.writeFile("input-" + file.name, await fetchFile(file.file));

            const command = ['-i', inputName, newName];
            console.log(command);

            file.isConverting = true;
            file.isInLine = false;
            file.updateConvertingState();

            await ffmpeg.exec(command);

            filesFinished++;
            ffmpeg.deleteFile(inputName, await fetchFile(file.file));
            ffmpeg.off("progress", onProgress);

            file.isConverting = false;
            file.updateConvertingState();

            var data = await ffmpeg.readFile(newName);
            download(data.buffer, newName);
        }
        catch (error) {
            file.isConverting = false;
            file.updateConvertingState();

            console.log(error);
        }
    }
    filesInBatch = 0;
    filesFinished = 0;
}

