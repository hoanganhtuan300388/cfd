/**
 * @file	borderWing.js
 * @brief	Borderの分割パネル（左右または上下）
 *          主に内部オブジェクトのサイズ変更を中継する役割をする。
 * @author	cukim
 * @date
 * 			2017.03.27
 * 				- added by choi sunwoo
 * 				- 14を__constants__.this.layout.borderInfo.sizeへ変更する。
 */

var BorderWing = function(layout){
	//
	this.layout = layout;

	//一つのpanelあるいは、複数のborderを保存
	this.objects = [];
};

BorderWing.prototype.init = function(){

};

/**
 *
 */
BorderWing.prototype.setObjects = function(objects){
	this.objects = [];
	for(var i = 0, iLen = objects.length ; i < iLen ; i++){
		this.objects.push(objects[i]);
	}
};

/**
 *
 */
BorderWing.prototype.addObject = function(object){
	if(this.isObject(object) === false){
		this.objects.push(object);
	}
};

/**
 *
 */
BorderWing.prototype.removeObject = function(object){
	for(var i =0, iLen = this.objects.length; i < iLen; i++){
		if(this.objects[i].id === object.id){
			this.objects.splice(i, 1);
			return true;
		}
	}
	return false;
};


BorderWing.prototype.isObject = function(object){
	for(var i =0, iLen = this.objects.length; i < iLen; i++){
		if(this.objects[i].id === object.id){
			return true;
		}
	}
	return false;
};

BorderWing.prototype.changeObject = function(object, newObject){
	for(var i =0, iLen = this.objects.length; i < iLen; i++){
		if(this.objects[i].id === object.id){
			this.objects[i] = newObject;
			return true;
		}
	}
	return false;
};

/**
 * borderの長さが変更された時
 */
BorderWing.prototype.resizeLength = function(offset, customResize){
	if(this.objects[0] instanceof Panel){
		this.objects[0].resize(offset);
	}else{
		for(var i = 0, iLen = this.objects.length; i < iLen; i++){
			this.objects[i].modifyOffsetForLengthSize(offset).resizeLength(customResize);
		}
	}
};

/**
 * borderの幅が変更された時
 */
BorderWing.prototype.resizeWing = function(offset,customResize){

	if(this.objects[0] instanceof Panel){
		this.objects[0].resize(offset);
	}else{
		// 表示されているエレメント順番にソート
		// 表示順は左または上からの位置順序である。
		//
		this.sortObjects();

		var modifySize = this.getModifySize(offset);
		var tempSize = 0;
		var wh;
		var lt;

		var borderInfo = __utils__.getBorderInfoWithType(this.objects[0].type);
		wh = borderInfo.wh;
		lt = borderInfo.lt;

		// サイズ変更
		for(var i = 0, iLen = this.objects.length; i < iLen; i++){
			var object = this.objects[i];
			var size;
			if(i !== (iLen-1)){
				size = Math.round(modifySize/iLen);
				tempSize = tempSize + size;
			}else{
				size = modifySize - tempSize;
			}

			//先頭にあるもの、positionが移動される
			if(i === 0){
				var modifyOffset = {
					width: object.offset.width,
					height: object.offset.height,
					left: object.offset.left,
					top: object.offset.top
				};

				modifyOffset[wh] = modifyOffset[wh] + size;
				modifyOffset[lt] = offset[lt];

				//幅変更による調整
				object.modifyOffsetForWingSize(modifyOffset, size, customResize).resizeWing();

			} else {

				var frontBorder = this.objects[i-1];
				var forntBorderRightLength = frontBorder.offset[wh] - frontBorder.position - this.layout.borderInfo.size;
				var modifyforntBorderRightLength = forntBorderRightLength - object.position;

				//width or height を変更
				object.offset[wh] = object.offset[wh] + size + modifyforntBorderRightLength;

				//left or topをセット
				object.offset[lt] = frontBorder.offset[lt] + frontBorder.position + this.layout.borderInfo.size;

				//positionをセット
				if(!customResize){
					object.position = forntBorderRightLength;
				}

				object.resizeWing();
			}

		}
	}
};

/**
 * 増減分を取得
 */
BorderWing.prototype.getModifySize = function(offset){

	var borderInfo = __utils__.getBorderInfoWithType(this.objects[0].type);

	var wh = borderInfo.wh;//(this.objects[0].type === __constants__.border.types.vert.target) ? 'width' : 'height';

	//一番前にある境目のサイズ
	var size = this.objects[0].offset[wh];

	for(var i = 1, iLen = this.objects.length; i < iLen ; i++){
		var border = this.objects[i];
		size = size + border.offset[wh] - border.position;
	}
	return offset[wh] -size;
};

/**
 * ソート
 */
BorderWing.prototype.sortObjects = function(){

	if(this.objects[0] instanceof Panel){
		return this;
	}

	if(this.objects[0].type === __constants__.border.types.vert.target){
		this.objects.sort(function(a, b){
			return a.offset.left - b.offset.left;
		});
	}else{
		this.objects.sort(function(a, b){
			return a.offset.top - b.offset.top;
		});
	}
	return this;
};

BorderWing.prototype.toJSON = function(){
	var value = {};

	if(this.objects[0] instanceof Panel){
		value = {
			instanceName: 'Panel',
			data: this.objects[0].toJSON()
		};
	}else{
		value = {
			instanceName: 'Border',
			data: []
		};

		for(var i=0, iLen = this.objects.length; i < iLen; i++){
			value.data.push(this.objects[i].toJSON());
		}
	}
	return value;
};

//
// added by choi sunwoo at 2017.03.24
//


/**
 * 内部のオブジェクトを全て削除する。
 * @return	true or false
 */
BorderWing.prototype.removeAllObjects = function(){
	for(var i =0, iLen = this.objects.length; i < iLen; i++){
		if(this.objects[i] instanceof Panel){
			this.objects[i].close();
		}
		else {
			this.objects[i].removeAllObjects();
		}
	}

	this.objects = [];

	return true;
};
