"use strict";

module.exports = Node;

var rectUtil = require('./utils/rectangle-util');

function Node(node) {
    this.node = node;

    return this;
}

var inlineNodes = ["A", "ABBR", "ACRONYM", "B", "BDO",
	"BIG", "BUTTON", "CITE", "CODE", "DEL", "DFN", "EM",
	"FONT", "I", "IMG", "INPUT", "INS", "KBD", "LABEL",
	"OBJECT", "Q", "S", "SAMP", "SMALL", "SPAN", "STRIKE",
	"STRONG", "SUB", "SUP", "TT", "U", "VAR", "APPLET",
	"SELECT", "TEXTAREA"];

Node.prototype.getMaxFontSize = function() {
    if(this.isInlineNode()){
        return -1;
    }

    var maxFontSize = this.getFontSize();
    if(this.hasChild()){
        for(var i = 0; i < this.getChildCount(); i++){
            maxFontSize = Math.max(maxFontSize, this.getChildAt(i).getMaxFontSize());
        }
    }

    return maxFontSize;
};

Node.prototype.calculateArea = function(){
    if(this.hasChild() && this.node.tagName === 'DIV'){
        var totalArea = 0;

        for(var i = 0; i < this.getChildCount(); i++){
            totalArea += this.getChildAt(i).calculateArea();
        }

        return totalArea;
    } else {
        return this.getAttributes().width * this.getAttributes().height;
    }
}

Node.prototype.getVirtualLocation = function(){
	if(this.getChildCount() === 0){
		return {
			width: this.getAttributes().width,
			height: this.getAttributes().height,
			topX: this.getAttributes().positionX,
			topY: this.getAttributes().positionY
		};
	}

	var minX = Number.MAX_SAFE_INTEGER,
	    maxX = 0,
	    minY = Number.MAX_SAFE_INTEGER,
	    maxY = 0;

	for(var i = 0; i < this.getChildCount(); i++){
		var child = this.getChildAt(i);

		if(child.isCompositeNode() || child.getAttributes().height === 0){
			var childLocation = child.getVirtualLocation();

			minX = Math.min(minX, childLocation.topX);
			maxX = Math.max(maxX, childLocation.topX + childLocation.width);
			minY = Math.min(minY, childLocation.topY);
			maxY = Math.max(maxY, childLocation.topY + childLocation.height);
		} else {
			var childHeight = child.getAttributes().height;

			minX = Math.min(minX, child.getAttributes().positionX);
			maxX = Math.max(maxX, child.getAttributes().positionX + child.getAttributes().width);
			minY = Math.min(minY, child.getAttributes().positionY);
			maxY = Math.max(maxY, child.getAttributes().positionY + childHeight);
		}
	}

	return {
		width: maxX - minX,
		height: maxY - minY,
		topX: minX,
		topY: minY
	};
}

Node.prototype.getMaxFontSizeInChildren = function(){
    var maxFontSize = -1;

    for(var i = 0; i < this.getChildCount(); i++){
        maxFontSize = Math.max(maxFontSize, this.getChildAt(i).getMaxFontSize());
    }

    return maxFontSize;
}

Node.prototype.getCountOfChildrenWithMaxFontSize = function(maxFontSize){
    var count = 0;

    for(var i = 0; i < this.getChildCount(); i++){
        var fontSize = this.getChildAt(i).getMaxFontSize();

        if(fontSize === maxFontSize){
            count++;
        }
    }

    return count;
}

Node.prototype.getChildAt = function(i){
    return new Node(this.node.children[i]);
}

Node.prototype.areAllMaxFontSizeChildrenAtFront = function(count, maxFontSize){
    for(var i = 0; i < count; i++){
        var fontSize = this.getChildAt(i).getMaxFontSize();

        if(fontSize !== maxFontSize){
            return false;
        }
    }

    return true;
}

Node.prototype.hasChild = function(){
    return this.node.children && this.node.children.length > 0;
}

Node.prototype.getFontSize = function(){
    return parseInt(this.getAttributes().fontSize);
}

Node.prototype.isInlineNode = function(){
    return this.node.inline;
}

Node.prototype.containsImage = function(){
    return this.node.containsImage;
}

Node.prototype.isImageNode = function(){
	if(this.node.tagName === 'IMG'){
		return true;
	}

	if(this.node.children.length === 1){
		return this.getChildAt(0).isImageNode();
	}

	if(this.node.isBackgroundImage){
		return true;
	}

    return false;
}

Node.prototype.areAllChildrenVirtualTextNodes = function() {
    var state = true;
    if(this.hasChild()){
		this.node.children.forEach(function(child){
            state = state && (child.tagName === 'BR' || +child.type === 3 /*Node.TEXT_NODE*/);
        });

		if(state){
			return true;
		}

		state = true;

		if(this.node.attributes && this.node.attributes.width <= 100){
			this.node.children.forEach(function(child){
				state = state && (child.inline || +child.type === 3 /*Node.TEXT_NODE*/
					|| inlineNodes.indexOf(child.tagName) > -1 || (child.tagName === 'IMG' &&
					child.attributes &&
					child.attributes.width <= 30)
					);
			});

			if(state){
				return true;
			}
		}

		state = true;

        this.node.children.forEach(function(child){
            state = state && (child.inline || +child.type === 3 /*Node.TEXT_NODE*/);
        });
    }
    return state;
}

Node.prototype.childrenHaveDifferentBackground = function(){
    if(this.hasChild()){
        var state = false;
        var tempBg = this.getChildAt(0).getAttributes().background;

        this.node.children.forEach(function(child){
            var childNode = new Node(child);
            if(! childNode.tagNameEqualsTo('BUTTON') && ! childNode.tagNameEqualsTo('INPUT')){
                state = state || childNode.getAttributes().background !== tempBg;
            }
        });

        return state;
    }

    return false;
}

Node.prototype.containsEmptyListItem = function() {
    if(this.tagNameEqualsTo('UL') && this.hasChild()){
        for(var i = 0; i < this.node.children.length; i++){
            if(this.getChildAt(i).isEmptyListItem()){
                return true;
            }
        }
    }

    return false;
}

Node.prototype.isEmptyListItem = function(){
    return this.tagNameEqualsTo('LI') && ! this.hasChild();
}

Node.prototype.containsLineBreak = function(){
    if(this.node.isCompositeNode){
        if(! this.hasChild()){
            return false;
        }

        for(var i = 0; i < this.node.children.length; i++){
            var child = this.getChildAt(i);

            if(child.tagNameEqualsTo('HR') || child.tagNameEqualsTo('BR')){
                return true;
            }
        }

        return false;
    }

    return this.node.containsLineBreak ? true : false;
}

Node.prototype.containsImage = function(){
    if(this.node.containsImage){
        return true;
    }

    if(! this.hasChild()){
        return false;
    }

    for(var i = 0; i < this.node.children.length; i++){
        var child = this.node.children[i];

        if(child.children && child.children.length === 1 && child.containsImage){
            return true;
        }
    }

    return false;
}

Node.prototype.containsLineBreakObject = function() {
    if(this.node.containsLineBreakTerminalNode){
        return true;
    }

    if(! this.hasChild()){
        return false;
    }

    for(var i = 0; i < this.node.children.length; i++){
        var child = this.node.children[i];

        if(child.children && child.children.length === 1 && child.containsLineBreakTerminalNode){
            return true;
        }
    }

    return false;
}

Node.prototype.allChildrenIntersect = function() {
	if(! this.hasChild() || this.getChildCount() < 2){
        return false;
    }
	
	for(var i = 0; i < this.node.children.length; i++){
		var n1 = this.node.children[i];
		
		if(hasNonTextChild(n1)){
			return false;
		}
		
		
		for(var j = i + 1; j < this.node.children.length; j++){
			var n2 = this.node.children[j];
			
			if(hasNonTextChild(n2)){
				return false;
			}
			
			if(! rectUtil.checkIntersection({"topX": n1.attributes.positionX, "topY": n1.attributes.positionY, "width": n1.attributes.width, "height": n1.attributes.height}, 
				{"topX": n2.attributes.positionX, "topY": n2.attributes.positionY, "width": n2.attributes.width, "height": n2.attributes.height})){
				return false;
			}
		}
    }

    return true;
}

function hasNonTextChild(n){
	if(n.children.length === 0){
		return false;
	}
	
	if(n.children.length === 1 && n.children[0].type === 3){
		return false;
	}
	
	return true;
}

Node.prototype.hasInsersectingChildren = function() {
    if(! this.hasChild() || this.getChildCount() < 2){
        return false;
    }

    for(var i = 0; i < this.node.children.length; i++){
		var n1 = this.node.children[i];
		
		while(n1.children.length === 1){
			n1 = n1.children[0];
		}
		
		for(var j = i + 1; j < this.node.children.length; j++){
			var n2 = this.node.children[j];
			
			while(n2.children.length === 1){
				n2 = n2.children[0];
			}
			
			if(rectUtil.isBetweenNodeChildren(n1, n2)){
				return 1;
			}
			
			if(rectUtil.isBetweenNodeChildren(n2, n1)){
				return 2;
			}
		}
    }

    return false;
}

Node.prototype.hasDifferentFloatInChildren = function() {
    if(this.hasChild()){
        var state = false;
        var tempFloat = this.node.children[0].attributes.float;

        this.node.children.forEach(function(child){
            state = state || child.attributes.float !== tempFloat;
        });

        return state;
    }

    return false;
}

Node.prototype.hasDivGroups = function() {
    var divCount = 0,
        lineBreakCount = 0;

    if(this.hasChild()){
        this.node.children.forEach(function(child){
            if(child.tagName === 'DIV'){
                divCount++;
            } else if(! child.inline && inlineNodes.indexOf(child.tagName) === -1){
                lineBreakCount++;
            }
        });
    }

	if (divCount > 0 && lineBreakCount > 0){
        return true;
    }

    return false;
}

function areAllMarginSame(node){
    var tempMarginTop = node.children[0].attributes.marginTop,
        tempMarginBottom = node.children[0].attributes.marginBottom;

    for(var i = 0; i < node.children.length; i++){
        var child = node.children[i],
            marginTop = child.attributes.marginTop,
            marginBottom = child.attributes.marginBottom;

        if(marginTop !== tempMarginTop || marginBottom !== tempMarginBottom){
            return false;
        }
    }

    return true;
}

Node.prototype.hasDifferentMarginInChildren = function() {
    if(this.hasChild()){
        if(areAllMarginSame(this.node)){
            return false;
        }

        for(var i = 0; i < this.node.children.length; i++){
            var child = this.node.children[i];

            if (i !== 0 && hasMargin(child.attributes.marginTop)) {
				return true;
			} else if (i !== this.node.children.length - 1 &&
                hasMargin(child.attributes.marginBottom)) {
				return true;
			}
        }
    }

    return false;
}

Node.prototype.hasDifferentFontSizeInChildren = function() {
    if(this.hasChild()){
        var state = false;

        var tempFontSize = null;

        for(var i = 0; i < this.node.children.length; i++){
            var child = this.getChildAt(i),
                fontSize = child.getMaxFontSize();

            if(fontSize !== -1){
                tempFontSize = fontSize;
                break;
            }
        }

        this.node.children.forEach(function(child){
            var fontSize = (new Node(child)).getMaxFontSize();
            if(fontSize !== -1){
                state = state || fontSize !== tempFontSize;
            }
        });

        return state;
    }

    return false;
}

Node.prototype.childrenHaveRows = function(screenWidth){
    if(! this.node.children || this.node.children.length <= 1){
        return false;
    }

    var positionMap = {};
    for(var i = 0; i < this.node.children.length; i++){
        var child = this.getChildAt(i);
        if(! child.tagNameEqualsTo('BR') && ! child.tagNameEqualsTo('HR')){
            var positionY = parseInt(child.getAttributes().positionY / 2, 10) * 2;
            if(positionMap[positionY]){
                positionMap[positionY] = positionMap[positionY] + 1;
            } else {
                positionMap[positionY] = 1;
            }
        }
    }

    if(Object.keys(positionMap).length === 1){
        return false;
    }

    for (var property in positionMap) {
        if (positionMap.hasOwnProperty(property) && positionMap[property] > 1) {
            return true;
        }
    }

    return false;
}

Node.prototype.getAttributes = function(){
    return this.node.attributes;
}

Node.prototype.isTextNode = function(){
    return +this.node.type === 3 /*Node.TEXT_NODE*/;
}

Node.prototype.tagNameEqualsTo = function(tagName){
    return this.node.tagName === tagName;
}

Node.prototype.getTagName = function(){
    return this.node.tagName;
}

Node.prototype.hasSingleChild = function() {
    return this.node.children && this.node.children.length === 1;
}

Node.prototype.isCompositeNode = function(){
    return this.node.isCompositeNode;
}

Node.prototype.isLineBreakNode = function(){
    return this.node.lineBreak;
}

Node.prototype.isLineBreakObject = function(){
    return this.node.lineBreakObject;
}

Node.prototype.containsLineBreakTerminalNode = function(){
    return this.node.containsLineBreakTerminalNode;
}

Node.prototype.getNode = function(){
    return this.node;
}

Node.prototype.getXPath = function(){
    return this.node.xpath;
}

Node.prototype.getBackground = function(){
    if(this.isCompositeNode()){
        return this.getChildAt(0).getAttributes().background;
    } else {
        return this.getAttributes().background;
    }
}

Node.prototype.getNewCompositeNode = function(){
    return new Node({children: [], isCompositeNode: true,
        tagName: "COMPOSITE", xpath: this.node.xpath + '/COMPOSITE',
        attributes: {wordCount: 0}});
}

Node.prototype.addChild = function(child){
    this.node.children.push(child.getNode());

    if(this.node.isCompositeNode){
        if(! this.node.attributes){
            this.node.attributes = {wordCount: 0};
        }

        this.node.attributes.wordCount += child.getNode().attributes.wordCount;
    }
}

Node.prototype.getChildCount = function(){
    return this.node.children.length;
}

Node.prototype.getChildren = function(){
    return this.node.children;
}

Node.prototype.removeChildAt = function(index){
    this.node.children.splice(index, 1);
}

Node.prototype.removeAllChildren = function(){
    this.node.children = [];
}

/**
 * Checks whether specified margin value is 0 or auto.
 *
 * @param {string} margin - Margin value to be checked
 *
 * @method
 */
function hasMargin(margin) {
	return margin && margin.toLowerCase() !== 'auto' && parseInt(margin, 10) !== 0;
}
