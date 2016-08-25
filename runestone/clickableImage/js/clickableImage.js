/*==========================================
======   Master clickableImage.js    =======
============================================
===   This file contains the JS for the  ===
===  Runestone clickable area component. ===
============================================
===              Created by              ===
===           Isaiah Mayerchak           ===
===                7/11/16                ===
==========================================*/

var CIList = {};    // Object that contains all instances of ClickableImage objects

function ClickableImage (opts) {
    if (opts) {
        this.init(opts);
    }
}

ClickableImage.prototype = new RunestoneBase();

/*=============================================
== Initialize basic ClickableImage attributes ==
=============================================*/

ClickableImage.prototype.init = function (opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;    // entire <div> element that will be replaced by new HTML
    this.origElem = orig;
    this.divid = orig.id;
    this.useRunestoneServices = opts.useRunestoneServices;

    this.clickableElements = [];   // will contain the HTML elements that are "clickable"
    // arrays for correct/incorrect indices of areas in our clickable elements array
    this.correctAreaIndices = [];
    this.incorrectAreaIndices = [];

    this.getQuestion();
    this.getFeedback();
    this.renderNewElements();
};

/*===========================
== Update basic attributes ==
===========================*/

ClickableImage.prototype.getQuestion = function () {
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).is("[data-question]")) {
            this.question = this.origElem.childNodes[i];
            break;
        }
    }
};

ClickableImage.prototype.getFeedback = function () {
    this.feedback = "";
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).is("[data-feedback]")) {
            this.feedback = this.origElem.childNodes[i];
            break;
        }
    }
    if (this.feedback !== "") {  // Get the feedback element out of the container if the user has defined feedback
        $(this.feedback).remove();
        this.feedback = this.feedback.innerHTML;
    }
};

ClickableImage.prototype.getImage = function () {
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).is("[data-source]")) {
            var img = this.origElem.childNodes[i];
            img.height = $(img).attr("data-height") ? $(img).attr("data-height") : img.height;
            img.width = $(img).attr("data-width") ? $(img).attr("data-width") : img.width;
            return this.origElem.childNodes[i];
        }
    }
};

ClickableImage.prototype.getSVG = function () {
    // get original svg, then strip the correct/incorrect attributes, saving the indices in this.correct and this.incorrect
    // also add onclick listeners
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).is("[data-clickareas]")) {
            this.clickableSVG = this.origElem.childNodes[i];
            break;
        }
    }
};

// ClickableImage.prototype.generateImageMap = function () {
//     // get original map, then strip the correct/incorrect attributes, saving the indices in this.correct and this.incorrect
//     var origMap;
//     for (var i = 0; i < this.origElem.childNodes.length; i++) {
//         if ($(this.origElem.childNodes[i]).is("[data-map]")) {
//             origMap = this.origElem.childNodes[i];
//             break;
//         }
//     }
//     var generatedMap = document.createElement("map");
//     var index = 0;   // manual counter, because we cannot rely on the for loop index
//     if (origMap) {
//         for (var j = 0; j < origMap.childNodes.length; j++) {
//             console.log(origMap.childNodes[j]);
//             if (origMap.childNodes[j].nodeName === "AREA") {
//                 var area = document.createElement("area");
//                 $(area).attr("shape", $(origMap.childNodes[j]).attr("shape"));
//                 $(area).attr("coords", $(origMap.childNodes[j]).attr("coords"));
//                 area.id = this.divid + "-" + index;
//                 // attach listener
//                 area.onclick = function () {
//                     if ($(this).hasClass("clickImage-clicked")) {
//                         $(this).removeClass("clickImage-clicked");
//                         $(this).removeClass("clickImage-incorrect");
//                     } else {
//                         $(this).addClass("clickImage-clicked");
//                     }
//                 };
//                 if ($(origMap.childNodes[j]).is("[data-correct]")) {
//                     // log the relative index to correct arrays
//                     this.correctAreaIndices.push(index);
//                 } else {
//                     // we assume that if they don't put data-correct, then it is incorrect
//                     this.incorrectAreaIndices.push(index);
//                 }
//                 generatedMap.appendChild(area);
//                 index += 1;
//             }
//         }
//     }
//     return generatedMap;
// };

// TODO: storage

/*===========================================
====   Functions generating final HTML   ====
===========================================*/

ClickableImage.prototype.renderNewElements = function () {
    // wrapper function for generating everything
    this.containerDiv = document.createElement("div");
    this.containerDiv.appendChild(this.question);
    $(this.containerDiv).addClass("alert alert-warning clickImage-container");

    // instead of using an actual image element, we use a div and set it's background-image property
    this.imageDiv = document.createElement("div");
    var sourceImage = this.getImage();
    // configure the url and size
    this.imageDiv.style.backgroundImage = "url('" + sourceImage.src + "')";
    this.imageDiv.style.backgroundSize = sourceImage.height + "px " + sourceImage.width + "px";
    this.imageDiv.style.height = sourceImage.height + "px";
    this.imageDiv.style.width = sourceImage.width + "px";
    this.imageDiv.style.margin = "auto";
    this.containerDiv.appendChild(this.imageDiv);

    this.getSVG();   // defines this.clickableSVG
    this.clickableSVG.style.height = sourceImage.height + "px";
    this.clickableSVG.style.width = sourceImage.width + "px";
    this.imageDiv.appendChild(this.clickableSVG);

    this.createButtons();

    this.feedBackDiv = document.createElement("div");
    this.containerDiv.appendChild(document.createElement("br"));
    this.containerDiv.appendChild(this.feedBackDiv);

    // map with correct/incorrect clickable areas
    // this.imageMap = this.generateImageMap();
    // this.imageMap.name = this.divid + "-map";
    // this.containerDiv.appendChild(this.imageMap);

    $(this.origElem).replaceWith(this.containerDiv);
    this.checkLocalStorage();
};

ClickableImage.prototype.restoreAnswers = function (data) {
    // If we were given data to pre-populate answers, then do so--otherwise, just finish setting up by preparing the SVG

    var index = 0;  // manual counter, because we cannot rely on the for loop index
    for (var j = 0; j < this.clickableSVG.childNodes.length; j++) {
        var child = this.clickableSVG.childNodes[j];
        // check if child node is a child we want
        if ($(child).is("[data-correct]") || $(child).is("[data-incorrect]")) {
            // first, strip the data-correct / data-correct flags and log accordingly
            if ($(child).is("[data-correct]")) {
                $(child).removeAttr("data-correct");
                this.correctAreaIndices.push(index);
            } else if ($(child).is("[data-incorrect]")) {
                $(child).removeAttr("data-incorrect");
                 this.incorrectAreaIndices.push(index);
            }
            if (this.clickedIndexes && this.clickedIndexes.indexOf(index.toString()) !== -1) {
                // Can't use addClass because our version of jQuery doesn't support that usage for SVGs
                // TODO: Figure out better workaround for addClass with SVGs
                //$(child).addClass("clickImage-clicked");
                $(child).attr("class", "clickImage-clicked");
            } else {
                //$(child).addClass("clickImage");
                $(child).attr("class", "clickImage");
            }
            index++;
            // attach onclick listener -- adds CSS to communicate the "clicked" vs "unclicked" status to the user
            child.onclick = function () {
                // if ($(this).hasClass("clickImage-clicked")) {
                //     $(this).removeClass("clickImage-clicked");
                //     $(this).addClass("clickImage");
                //     // $(this).removeClass("clickImage-incorrect");
                //     // $(this).removeClass("clickImage-correct");
                // } else {
                //     $(this).removeClass("clickImage");
                //     $(this).addClass("clickImage-clicked");
                // }
                if ($(this).attr("class") == "clickImage-clicked") {
                    $(this).attr("class", "clickImage");
                } else {
                    $(this).attr("class", "clickImage-clicked");
                }
            };
            this.clickableElements.push(child);
        }

    }
};

ClickableImage.prototype.createButtons = function () {
    this.submitButton = document.createElement("button");    // Check me button
    this.submitButton.textContent = "Check Me";
    $(this.submitButton).attr({
        "class": "btn btn-success",
        "name": "do answer"
    });

    this.submitButton.onclick = function () {
        this.clickableEval(true);
    }.bind(this);

    this.containerDiv.appendChild(this.submitButton);
};

ClickableImage.prototype.clickableEval = function () {
    // Evaluation is done by iterating over the correct/incorrect arrays and checking by class
    this.correct = true;
    this.correctNum = 0;
    this.incorrectNum = 0;
    for (var i = 0; i < this.clickableElements.length; i++) {
        var area = this.clickableElements[i];
        // if it's correct and they clicked it, increment correctNum -- if incorrect and clicked, increment incorrectNum
        if (this.correctAreaIndices.indexOf(i) !== -1 && $(area).attr("class") == "clickImage-clicked") {
        //if (this.correctAreaIndices.indexOf(i) !== -1 && $(area).hasClass("clickImage-clicked")) {
            // $(area).addClass("clickImage-correct");
            this.correctNum++;
        } else if (this.incorrectAreaIndices.indexOf(i) !== -1 && $(area).attr("class") == "clickImage-clicked") {
        // } else if (this.incorrectAreaIndices.indexOf(i) !== -1 && $(area).hasClass("clickImage-clicked")) {
            // $(area).addClass("clickImage-incorrect");
            this.incorrectNum++;
        }
    }
    if (this.correctNum != this.correctAreaIndices.length || this.incorrectNum !== 0) {
        this.correct = false;
    }
    this.setLocalStorage({"correct": (this.correct ? "T" : "F")});
    this.renderFeedback();
};

ClickableImage.prototype.renderFeedback = function () {
    if (this.correct) {
        $(this.feedBackDiv).html("You are Correct!");
        $(this.feedBackDiv).attr("class", "alert alert-success");

    } else {
        $(this.feedBackDiv).html("Incorrect. You clicked on " + this.correctNum + " of the " + this.correctAreaIndices.length.toString() + " correct elements and " + this.incorrectNum + " of the " + this.incorrectAreaIndices.length.toString() + " incorrect elements. " + this.feedback);

        $(this.feedBackDiv).attr("class", "alert alert-danger");
    }
};

ClickableImage.prototype.setLocalStorage = function (data) {
    // Array of the indices of clicked elements is passed to local storage
    var answer;
    if (data.answer !== undefined) {   // If we got data from the server, we can just use that
        //answer = this.clickedIndexArray.join(";");
    } else {
        this.clickedIndexes = [];
        for (var i = 0; i < this.clickableElements.length; i++) {
            // if ($(this.clickableElements[i]).hasClass("clickImage-clicked")) {
            if ($(this.clickableElements[i]).attr("class") == "clickImage-clicked") {
                this.clickedIndexes.push(i);
            }
        }
        answer = this.clickedIndexes.join(";");
    }

    var timeStamp = new Date();
    var correct = data.correct;
    var storageObject = {"answer": answer, "correct": correct, "timestamp": timeStamp};
    // localStorage.setItem(eBookConfig.email + ":" + this.divid + "-given", JSON.stringify(storageObject));
    // NOTE: Uncomment the above line when this is using Runestone to build
    localStorage.setItem(this.divid + "-given", JSON.stringify(storageObject));
};

ClickableImage.prototype.checkLocalStorage = function () {
    // Gets previous answer data from local storage if it exists
    var len = localStorage.length;
    if (len > 0) {
        // NOTE: replace later
        // var ex = localStorage.getItem(eBookConfig.email + ":" + this.divid + "-given");
        var ex = localStorage.getItem(this.divid + "-given");
        if (ex !== null) {
            // TODO: add safety try/catch
            var storageObj = JSON.parse(ex);
            this.clickedIndexes = storageObj.answer.split(";");
            // TODO: Uncomment & modify this for Runestone build
            // if (this.useRunestoneServices) {
            //     // log answer to server
            //     this.givenIndexArray = [];
            //     for (var i = 0; i < this.clickableArray.length; i++) {
            //         if ($(this.clickableArray[i]).hasClass("clickable-clicked")) {
            //             this.givenIndexArray.push(i);
            //         }
            //     }
            //     this.logBookEvent({"event": "clickableArea", "act": this.clickedIndexArray.join(";"), "div_id": this.divid, "correct": storageObj.correct});
            // }
        }
    }
    this.restoreAnswers({});   // pass empty object
};

/*=================================
== Find the custom HTML tags and ==
==   execute our code on them    ==
=================================*/
$(document).bind("runestone:login-complete", function () {
    $("[data-component=clickableimage]").each(function (index) {
        if ($(this.parentNode).data("component") !== "timedAssessment") { // If this element exists within a timed component, don't render it here
            CIList[this.id] = new ClickableImage({"orig": this, "useRunestoneServices":eBookConfig.useRunestoneServices});
        }
    });
});

$(document).ready(function () {
    $("[data-component=clickableimage]").each(function (index) {
        if ($(this.parentNode).data("component") !== "timedAssessment") { // If this element exists within a timed component, don't render it here
            CIList[this.id] = new ClickableImage({"orig": this});
        }
    });
});
