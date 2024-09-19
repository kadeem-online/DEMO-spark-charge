import "../../sass/style.scss";
import startGame from "../../game/init";

function onPageLoad() {
	startGame();
}

window.addEventListener("load", onPageLoad);
