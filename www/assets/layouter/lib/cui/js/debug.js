var debug = {
	exe: function(objects, message){
		this.message = message;

		//パネルの場合
		if(objects[0] instanceof Panel){
			if(objects.length > 1){
				console.error(this.message, 'storageにて、パネル以外に不要なobjectがあります。', objects);
				return false;
			}

		//境目の場合
		}else{
			for(var i = 0, iLen = objects.length; i < iLen; i++){
				if(this.checkBorder(objects[i]) === false){
					break;
				}
			}
		}
	},

	checkBorder: function(border){

		if(border instanceof Border === false){
			console.error(this.message, 'Borderではありません。', border);
			return false;
		}

		if(border.leftWing.objects.length < 1){
			console.error(this.message, 'leftWingが空です。', border);
			return false;
		}

		if(border.rightWing.objects.length < 1){
			console.error(this.message, 'rightWingが空です。', border);
			return false;
		}

		if(this.checkBorderWing(border, border.leftWing) === false){
			return false;
		}

		if(this.checkBorderWing(border, border.rightWing) === false){
			return false;
		}

		return true;
	},

	checkBorderWing: function(border, borderWing){

		var i, iLen, parentBorders;

		if(borderWing instanceof BorderWing === false){
			console.error(this.message, 'Borderではありません。', border);
			return false;
		}

		//パネルの場合
		if(borderWing.objects[0] instanceof Panel){
			if(borderWing.objects.length > 1){
				console.error(this.message, 'BorderWingにて、パネル以外に不要なobjectがあります。', border);
				return false;
			}

			if(borderWing.objects[0].parentBorders.length < 1){
				console.error(this.message, 'BorderWingにて、パネルに親境目がセットされていません。', border);
				return false;
			}

			if(borderWing.objects[0].isParentBorder(border) === false){
				console.error(this.message, 'BorderWingにて、パネルに親境目が一致しません。', border);
				return false;
			}

		//境目の場合
		} else {
			for(i = 0, iLen = borderWing.objects.length; i < iLen; i++){

				if(borderWing.objects[i].isParentBorder(border) === false){
					console.error(this.message, 'BorderWingにて、パネルに親境目が一致しません。', border);
					return false;
				}

				if(this.checkBorder(borderWing.objects[i]) === false){
					break;
				}
			}
		}

		return true;
	}
};