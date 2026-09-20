// ==UserScript==
// @name         KandiBeads
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds a PNG download button to the KandiBeads website
// @author       Jotaveesse
// @match        https://kandipad.com/pattern/*
// @updateURL    https://raw.githubusercontent.com/Jotaveesse/public-files/refs/heads/main/kandibeads/tamper-monkey.user.js
// @downloadURL  https://raw.githubusercontent.com/Jotaveesse/public-files/refs/heads/main/kandibeads/tamper-monkey.user.js
// @grant        unsafeWindow
// ==/UserScript==

var checkBoardmatrixInteval;

(function () {
    "use strict";

    console.log("Kandipad Script Loaded");
    unsafeWindow.download_img = download_img;
    checkBoardmatrixInteval = setInterval(checkBoardmatrix, 500);
})();

const isEmpty = (obj) =>
    obj && Object.keys(obj).length === 0 && obj.constructor === Object;

function checkBoardmatrix() {
    if (!isEmpty(unsafeWindow.boardmatrix)) {
        clearInterval(checkBoardmatrixInteval);
        console.log(unsafeWindow.boardmatrix);

        getPixelArtSD().then((pixelImage) => {
            console.log("Image Created", pixelImage);
            addButtonUnder(pixelImage);
            addButtonSide(pixelImage);
        });
    }
}

function getPixelArtSD() {
    return getPixelArtScaled(600);
}

function getPixelArtHD() {
    return getPixelArtScaled(2400);
}

function getPixelArtScaled(desiredSize) {
    const pixelArtPromise = createPixelArt(unsafeWindow.boardmatrix);

    if (desiredSize == null) {
        return pixelArtPromise;
    } else {
        const imgPromise = new Promise((resolve) => {
            pixelArtPromise.then((pixelArt) => {
                const scale =
                    pixelArt.width > pixelArt.height
                        ? desiredSize / pixelArt.width
                        : desiredSize / pixelArt.height;
                scaleImageFile(pixelArt, scale).then((scaledImage) => {
                    resolve(scaledImage);
                });
            });
        });

        return imgPromise;
    }
}

/**
 * Creates an image from the pixel matrix object.
 * @param {Object} pixelData The pixel matrix data.
 * @returns {Promise} The promise of the resulting image.
 */
function createPixelArt(pixelData) {
    let maxCol = 0;
    let maxRow = 0;
    let minCol = Infinity;
    let minRow = Infinity;

    for (const key in pixelData) {
        const [col, row] = key.split("_").map(Number);
        if (col > maxCol) maxCol = col;
        if (row > maxRow) maxRow = row;
        if (col < minCol) minCol = col;
        if (row < minRow) minRow = row;
    }

    const canvas = document.createElement("canvas");

    canvas.width = maxCol - minCol + 1;
    canvas.height = maxRow - minRow + 1;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const key in pixelData) {
        const [col, row] = key.split("_").map(Number);
        const color = pixelData[key].c;

        ctx.fillStyle = color;
        ctx.fillRect(col - minCol, row - minRow, 1, 1);
    }

    const img = new Image();
    img.src = canvas.toDataURL("image/png");

    const imgPromise = new Promise((resolve) => {
        img.onload = () => {
            resolve(img);
        };
    });

    return imgPromise;
}

function scaleImageFile(originalImage, scaleMultiplier) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width * scaleMultiplier;
    canvas.height = originalImage.height * scaleMultiplier;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    const scaledImg = new Image();
    scaledImg.src = canvas.toDataURL("image/png");

    const imgPromise = new Promise((resolve) => {
        scaledImg.onload = () => {
            resolve(scaledImg);
        };
    });

    return imgPromise;
}

async function addButtonSide() {
    const pixelImageSD = await getPixelArtSD();
    const pixelImageHD = await getPixelArtHD();

    const container = document.createElement("div");
    container.className = "download-group";

    // expander
    const expander = document.createElement("div");
    expander.className = "group-expander";
    const icon = document.createElement("i");
    icon.className = "kp-down-open-mini";
    expander.appendChild(icon);
    expander.onclick = function () {
        $(this).parent().toggleClass("expanded");
    };

    container.appendChild(expander);
    // HD Button
    const btnHD = document.createElement("button");
    btnHD.type = "button";
    btnHD.className = "btn-ghost";
    btnHD.id = "download_pixelarthd";
    btnHD.title = `Download High Definition Pixel Art @ ${pixelImageHD.width}x${pixelImageHD.height}px`;
    btnHD.setAttribute("onclick", "download_img('pixelarthd', false)");
    btnHD.dataset.kpan = "ZG93bmxvYWRfcmVuZGVyaGR8MTE2NzA%3D";

    const thumbHD = document.createElement("div");
    thumbHD.className = "img-thumb-container";
    thumbHD.style.background = `url("${pixelImageSD.src}") center center no-repeat`;

    const strongHD = document.createElement("strong");
    strongHD.textContent = "Pixel Art";

    btnHD.append(thumbHD, strongHD, "Large");
    container.appendChild(btnHD);

    // SD Button
    const btnSD = document.createElement("button");
    btnSD.type = "button";
    btnSD.className = "btn-ghost child-btn";
    btnSD.id = "download_pixelartsd";
    btnSD.title = `Download Standard Definition Pixel Art @ ${pixelImageSD.width}x${pixelImageSD.height}px`;
    btnSD.setAttribute("onclick", "download_img('pixelartsd', false)");
    btnSD.dataset.kpan = "ZG93bmxvYWRfcmVuZGVyc2R8MTE2NzA%3D";

    const thumbSD = document.createElement("div");
    thumbSD.className = "img-thumb-container";
    thumbSD.style.background = `url("${pixelImageSD.src}") center center no-repeat`;

    const strongSD = document.createElement("strong");
    strongSD.textContent = "Pixel Art";

    btnSD.append(thumbSD, strongSD, "Small");
    container.appendChild(btnSD);

    const sibling = document.getElementById("pattern_download").children[4];
    const parent = document.getElementById("pattern_download");
    parent.insertBefore(container, sibling);
}

async function addButtonUnder(pixelImage) {
    // 1. Create the div element
    const div = document.createElement("div");

    // 2. Add classes and ID
    div.className = "thumb-selection ready";
    div.id = "creation_thumb_render";

    // 3. Set standard attributes
    div.title = "View Pixel Art Display";

    // 4. Set custom data attributes (data-akey and data-dl)
    div.dataset.akey = "ZG93bmxvYWRfcmVuZGVyc2R8MTE2NzA%3D";
    div.dataset.dl = "pixelartsd";

    const base64Data = (await getPixelArtSD()).src;

    div.dataset.src = base64Data;
    div.style.background = `url("${base64Data}") center center no-repeat`;

    let buttonInterval = setInterval(() => {
        let last_child = document.getElementById("creation_thumb_three");
        let parent = document.getElementById("creation_thumb_selector");

        if (last_child != null && parent != null) {
            parent.insertBefore(div, last_child);
            clearInterval(buttonInterval);
        }
    }, 1000);
}

async function download_img(size, dims = false) {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    $("#download_loader").show();
    if (
        userAgent.indexOf("FBAN") <= -1 &&
        userAgent.indexOf("FBAV") <= -1 &&
        userAgent.indexOf("Instagram") <= -1 &&
        userAgent.indexOf("musical_ly") <= -1 &&
        !$("html").hasClass("in-app-browser") &&
        !$("body").hasClass("instagram-browser")
    ) {
        let dlsize = 600;
        if (size == "hd" || size == "renderhd") {
            dlsize = 2400;
        }

        //Basic pattern image details
        const details = {
            matrix: matrix,
            width: 270 >= 251 ? dlsize : (dlsize / 251) * 270,
            height: 251 > 270 ? dlsize : (dlsize / 270) * 251,
            style: "pegboard",
            render:
                size == "renderhd" || size == "rendersd"
                    ? "realism"
                    : "pattern",
            watermark: "",
            pattern: {
                shape: creationshape,
                size: "29x29",
            },
            referer: "details",
            secondary: stripeSecondaryColors,
        };

        //hexagon
        if (creationshape.indexOf("hex") >= 0) {
            if (creationshape == "hex-v") {
                details["width"] = dlsize;
                details["height"] = dlsize / 1.154;
            } else {
                details["height"] = dlsize;
                details["width"] = dlsize / 1.154;
            }
        }

        //DO IMAGE CREATION
        if (size == "pixelartsd") {
            const imageId = window.location.pathname.split("/")[2];
            const imageName = imageId + "-" + size + "_kandipad";
            const image = (await getPixelArtSD()).src;
            downloadImage(image, imageName);
            $("#download_loader").hide();
        } else if (size == "pixelarthd") {
            const imageId = window.location.pathname.split("/")[2];
            const imageName = imageId + "-" + size + "_kandipad";
            const image = (await getPixelArtHD()).src;
            downloadImage(image, imageName);
            $("#download_loader").hide();
        } else if (
            size == "hd" ||
            size == "sd" ||
            size == "renderhd" ||
            size == "rendersd"
        ) {
            //Basic pattern image
            let bypass_watermark = false;

            if (bypass_watermark) {
                details["watermark"] = "bypass";
            }

            if (typeof Worker !== "undefined" && bypass_watermark) {
                if (typeof crw == "undefined") {
                    crw = new Worker(
                        "/assets/js/webworkers/pattern_render.js?v=5.7",
                    );
                }
                crw.postMessage(JSON.stringify(details));

                crw.onmessage = function (event) {
                    const watermarkedImg = event.data;
                    $("#download_loader").hide();
                    do_download(
                        watermarkedImg,
                        "purple-cat-4570533-" + size + "_kandipad.png",
                    );
                };
            } else {
                generate_image_from_matrix(details, function (watermarkedImg) {
                    $("#download_loader").hide();
                    do_download(
                        watermarkedImg,
                        "purple-cat-4570533-" + size + "_kandipad.png",
                    );
                });
            }
        } else if (size == "ppp" || size == "pp") {
            //Pattern + Palette
            details["watermark"] = "bypass";

            generate_image_from_matrix(details, function (patImg) {
                const primary_details = {
                    title: "purple cat",
                    type: "pegboard",
                    thumb: patImg,
                    beads: beadcounts,
                    size: "28x26",
                    totalbeads: parseInt(388),
                    username: "qsmp_designs",
                    btype: "square",
                    preview: size == "ppp" ? true : false,
                };

                const pr = size == "ppp" ? "-pr" : "";

                generate_primary_image(primary_details, function (projectFull) {
                    $("#download_loader").hide();
                    do_download(
                        projectFull,
                        "purple-cat-4570533-with-palette" +
                            pr +
                            "_kandipad.png",
                    );
                });
            });
        } else if (size == "pdf") {
            $("#download_" + size).addClass("disabled");
            details["watermark"] = "bypass";

            generate_image_from_matrix(details, function (patImg) {
                const pattern_details = {
                    title: "purple cat",
                    slug: "purple-cat-4570533",
                    thumb: patImg,
                    matrix: matrix,
                    bsize: size,
                    psize: "28x26",
                    pshape: "square",
                    size: "29x29",
                    bdims: dims,
                    totalbeads: parseInt(388),
                    username: "qsmp_designs",
                };

                generate_pattern_pdf(pattern_details, function () {
                    $("#download_loader").hide();
                    $("#download_" + size).removeClass("disabled");
                });
            });
        }
    } else {
        $("#download_loader").hide();
        if (userAgent.indexOf("FBAN") > -1 || userAgent.indexOf("FBAV") > -1) {
            $("#modal_file_download_msg .browser-app-name").text("Facebook");
        } else if (userAgent.indexOf("Instagram") > -1) {
            $("#modal_file_download_msg .browser-app-name").text("Instagram");
        } else if (userAgent.indexOf("musical_ly") > -1) {
            $("#modal_file_download_msg .browser-app-name").text("Tik Tok");
        } else {
            $("#modal_file_download_msg .browser-app-name").text("This app");
        }

        if (/android/i.test(userAgent)) {
            $("#modal_file_download_msg .app-browser-example").text(
                "Google Chrome",
            );
        } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            $("#modal_file_download_msg .app-browser-example").text("Safari");
        } else {
            $("#modal_file_download_msg .app-browser-example").text(
                "Safari or Google Chrome",
            );
        }

        const a = document.createElement("a");
        a.href = "#";
        a.setAttribute("data-toggle", "modal");
        a.setAttribute("data-target", "#modal_file_download_msg");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    setTimeout(function () {
        $("#download_loader").hide();
    }, 30000);
}

function downloadImage(source, name) {
    const link = document.createElement("a");
    link.download = name;
    link.href = source;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
