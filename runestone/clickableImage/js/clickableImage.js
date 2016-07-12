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

    // arrays for correct/incorrect indices of areas in the image map
    this.correctAreas = [];
    this.incorrectAreas = [];

    this.getQuestion();
    this.getFeedback();
    this.getImage();
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
            this.clickImage = this.origElem.childNodes[i];
            break;
        }
    }
};

ClickableImage.prototype.generateImageMap = function () {
    // get original map, then strip the correct/incorrect attributes, saving the indices in this.correct and this.incorrect
    var origMap;
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).is("[data-map]")) {
            origMap = this.origElem.childNodes[i];
            break;
        }
    }
    var generatedMap = document.createElement("map");
    if (origMap) {
        console.log(origMap);
        for (var i = 0; i < origMap.childNodes.length; i++) {
            var area = document.createElement("area");
            $(area).attr("shape", $(origMap.childNodes[i]).attr("shape"));
            $(area).attr("coords", $(origMap.childNodes[i]).attr("coords"));
            if ($(origMap.childNodes[i]).is("[data-correct]")) {
                console.log(origMap.childNodes[i]);
            }
        }
    }
    return generatedMap;
};

/*===========================================
====   Functions generating final HTML   ====
===========================================*/

ClickableImage.prototype.renderNewElements = function () {
    // wrapper function for generating everything
    this.containerDiv = document.createElement("div");
    this.containerDiv.appendChild(this.question);
    $(this.containerDiv).addClass("alert alert-warning");

    // the image that will be clickable
    this.clickImage = document.createElement("img");
    $(this.clickImage).attr("usemap", "#" + this.divid + "-map");

    // map with correct/incorrect clickable areas
    this.imageMap = this.generateImageMap();
    this.imageMap.name = this.divid + "-map";

    $(this.origElem).replaceWith(this.containerDiv);
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
