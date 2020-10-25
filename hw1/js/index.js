const check = document.querySelector('input');
const path = document.querySelector('path');
function getSmile(){
	if (!check.checked){
		path.style = "transform: scale(1,-1); transform-origin: 50% 70%";
		document.querySelector('label').innerHTML = "Sad";
	}
	else{
		path.style = "";
		document.querySelector('label').innerHTML = "Happy";
	}
};
