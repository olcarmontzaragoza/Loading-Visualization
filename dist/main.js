var lv = /** @class */ (function () {
    function lv() {
        this.elements = {
            "lv-bars": 8,
            "lv-squares": 4,
            "lv-bordered_line": 1,
            "lv-circles": 12,
            "lv-line": 1,
            "lv-dots": 4,
            "lv-determinate_line": 2,
            "lv-determinate_bordered_line": 2,
            "lv-determinate_circle": 4,
            "lv-spinner": 1,
            "lv-dashed": 1
        };
        this.observer = new MutationObserver(this.callback);
    }
    lv.prototype.fillElement = function (element, elementClass, divNumber) {
        for (var i = 0; i < divNumber; i += 1) {
            element.appendChild(document.createElement("DIV"));
        }
        if (elementClass === "lv-determinate_circle" || elementClass === "lv-determninate_line" || elementClass === "lv-determinate_bordered_line") {
            element.lastElementChild.innerHTML = "0";
        }
    };
    ;
    lv.prototype.initLoaderAll = function () {
        // iterates through everything and adds specified number of divs
        for (var key in this.elements) {
            var elementsOfClass = document.getElementsByClassName(key);
            console.log(elementsOfClass);
            for (var i = 0; i < elementsOfClass.length; i += 1) {
                // condition if the div is empty <=> new; otherwise the divs are not added
                if (!elementsOfClass.item(i).hasChildNodes()) {
                    this.fillElement(elementsOfClass.item(i), key, this.elements[key]);
                }
            }
        }
    };
    // fills all spinners with appropriate number of divs
    lv.prototype.initLoader = function (loaderElement) {
        // manual addition on specified object
        if (loaderElement.hasChildNodes) {
            var loaderClassList = loaderElement.classList;
            for (var i = 0; i < loaderClassList.length; i++) {
                for (var key in this.elements) {
                    if (loaderClassList[i] === key) {
                        this.fillElement(loaderElement, loaderClassList[i], this.elements[key]);
                        break;
                    }
                }
            }
        }
    };
    ;
    // extends or shortens any BAR specified as a first argument
    lv.prototype.updateBar = function (type, barElement, newValue, maxValue) {
        // getting current width of line from the page
        var line = barElement.firstElementChild;
        var currentWidth = parseInt(line.style.width);
        // protective condition for empty line
        if (isNaN(currentWidth)) {
            currentWidth = 0;
        }
        // end point of the animation
        var goalWidth;
        if (type === "add") {
            goalWidth = currentWidth + Math.round((newValue / maxValue) * 100);
        }
        else if (type === "set") {
            goalWidth = Math.round((newValue / maxValue) * 100);
        }
        // prevent overflow from both sides
        if (goalWidth > 100) {
            goalWidth = 100;
        }
        if (goalWidth < 0) {
            goalWidth = 0;
        }
        var animation = setInterval(frame, 5);
        function frame() {
            if (currentWidth === goalWidth) { // stopping animation when end point is reached
                clearInterval(animation);
            }
            else if (currentWidth > goalWidth) { // shortening the line
                currentWidth -= 0.5;
            }
            else { // extending the line
                currentWidth += 0.5;
            }
            line.style.width = currentWidth + "%";
            // updating the percentage
            barElement.lastElementChild.innerHTML = Math.round(currentWidth).toString();
        }
    };
    ;
    // controls change of any CIRCLE bar specified as first argument
    lv.prototype.updateCircle = function (type, circleElement, newValue, maxValue) {
        var rotationOffset = -45; // initial rotation of the spinning div in css
        // separating individual parts of the circle
        var background = circleElement.children[0];
        var overlay = circleElement.children[1];
        var spinner = circleElement.children[2];
        var percentage = circleElement.children[3];
        // getting the colors defined in css
        var backgroundColor = window.getComputedStyle(background).borderTopColor;
        var spinnerColor = window.getComputedStyle(spinner).borderTopColor;
        // computing current rotation of spinning part of circle using rotation matrix
        var rotationMatrix = window.getComputedStyle(spinner).getPropertyValue("transform").split("(")[1].split(")")[0].split(",");
        console.log(rotationMatrix);
        var currentAngle = Math.round(Math.atan2(parseFloat(rotationMatrix[1]), parseFloat(rotationMatrix[0])) * (180 / Math.PI)) - rotationOffset;
        // safety conditions for full and empty circle (360 <=> 0 and that caused problems)
        if (percentage.innerHTML === "100") {
            currentAngle = 360;
        }
        if (currentAngle < 0) {
            currentAngle += 360;
        }
        // end point of the animation
        var goalAngle;
        if (type === "add") {
            goalAngle = currentAngle + Math.round((newValue / maxValue) * 360);
        }
        else if (type === "set") {
            goalAngle = Math.round((newValue / maxValue) * 360);
        }
        // prevent overflow to both sides
        if (goalAngle > 360) {
            goalAngle = 360;
        }
        if (goalAngle < 0) {
            goalAngle = 0;
        }
        var id = setInterval(frame, 3);
        function frame() {
            if (currentAngle === goalAngle) { // stopping the animation when end point is reached
                clearInterval(id);
            }
            else {
                if (currentAngle < goalAngle) { // "filling" the circle
                    if (currentAngle === 90) {
                        background.style.borderRightColor = spinnerColor;
                        overlay.style.borderTopColor = "transparent";
                    }
                    else if (currentAngle === 180) {
                        background.style.borderBottomColor = spinnerColor;
                    }
                    else if (currentAngle === 270) {
                        background.style.borderLeftColor = spinnerColor;
                    }
                    currentAngle += 1;
                }
                else { // "emptying the circle"
                    if (currentAngle === 270) {
                        background.style.borderLeftColor = backgroundColor;
                    }
                    else if (currentAngle === 180) {
                        background.style.borderBottomColor = backgroundColor;
                    }
                    else if (currentAngle === 90) {
                        background.style.borderRightColor = backgroundColor;
                        overlay.style.borderTopColor = backgroundColor;
                    }
                    currentAngle -= 1;
                }
                // rotating the circle
                spinner.style.transform = "rotate(" + (rotationOffset + currentAngle).toString() + "deg)";
                // updating percentage
                percentage.innerHTML = (Math.round((currentAngle / 360) * 100)).toString();
            }
        }
    };
    ;
    // resets specified element
    lv.prototype.reset = function (type, element, maxValue) {
        if (type === "bar") {
            this.updateBar('set', element, 0, maxValue);
        }
        else if (type === "circle") {
            this.updateCircle('set', element, 0, maxValue);
        }
    };
    ;
    // fills whole loading bar
    lv.prototype.fill = function (type, element, maxValue) {
        if (type === "bar") {
            this.updateBar('set', element, maxValue, maxValue);
        }
        else if (type === "circle") {
            this.updateCircle('set', element, maxValue, maxValue);
        }
    };
    ;
    // adds value to loading bar
    lv.prototype.add = function (type, element, addValue, maxValue) {
        if (type === "bar") {
            this.updateBar('add', element, addValue, maxValue);
        }
        else if (type === "circle") {
            this.updateCircle('add', element, addValue, maxValue);
        }
    };
    ;
    // automatically detects new elements in DOM and appends divs to them (calls function complete_divs();
    // defining what to do on change of DOM - child mutation
    lv.prototype.callback = function (mutationList, observer) {
        mutationList.forEach(function (mutation) {
            if (mutation.type === "childList") {
                try {
                    if (mutation.addedNodes[0].classList.length > 0) {
                        // filling the node with divs when it is empty
                        this.initLoaderAll();
                    }
                }
                catch (error) { }
            }
        });
    };
    ;
    lv.prototype.startObserving = function () {
        this.observer.observe(document.body, { childList: true, subtree: true });
    };
    return lv;
}());

//# sourceMappingURL=main.js.map
