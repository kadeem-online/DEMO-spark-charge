// glide js
import Glide from "@glidejs/glide";

// simplebar
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.min.css";

// lenis
import Lenis, { LenisOptions } from "lenis";
import "lenis/dist/lenis.css";

// custom modules
import startGame from "./game/init";

// page scss
import "./sass/style.scss";

/*########################################################
# TYPES AND INTERFACES.
########################################################*/

type PageVariablesBlueprint = {
	page_lenis_instance?: Lenis;
	page_simplebar_instance?: SimpleBar;
	sidebar_menu?: HTMLElement;
};

/*########################################################
# TOP LEVEL VARIABLES.
########################################################*/

const VARS: PageVariablesBlueprint = {};

/*########################################################
# ACTIONS.
########################################################*/

function ACTION_close_sidebar_navigation_menu() {
	if (!VARS.sidebar_menu) {
		return;
	}

	VARS.sidebar_menu.ariaExpanded = "false";
}

function ACTION_open_sidebar_navigation_menu() {
	if (!VARS.sidebar_menu) {
		return;
	}

	VARS.sidebar_menu.ariaExpanded = "true";
}

/*########################################################
# SETUPS.
########################################################*/

function SETUP_page_simplebar_instance(): SimpleBar | void {
	try {
		const scroll_element_id = "page-scroll-wrapper";
		const scroll_element = document.getElementById(scroll_element_id);

		if (scroll_element === null) {
			throw new Error(
				`Specified scroll element with id of '${scroll_element_id}' does not exist within the DOM.`
			);
		}
		const simplebar = new SimpleBar(scroll_element, {});
		return simplebar;
	} catch (error) {
		return;
	}
}

function SETUP_page_lenis_instance(): Lenis | void {
	try {
		const config: Partial<LenisOptions> = {};

		if (VARS.page_simplebar_instance) {
			config.wrapper =
				VARS.page_simplebar_instance.getScrollElement() || undefined;
			config.content =
				VARS.page_simplebar_instance.getContentElement() || undefined;
		}

		const lenis = new Lenis(config);

		const raf = (time: number) => {
			lenis.raf(time);
			requestAnimationFrame(raf);
		};

		requestAnimationFrame(raf);

		return lenis;
	} catch (error) {
		console.error("Failed to setup lenis smooth scrolling: ", error);
	}
	return;
}

function SETUP_sidebar_menu_close_listeners() {
	try {
		const triggers_nodelist = document.querySelectorAll(
			"[data-sidebar-menu-close-trigger]"
		);
		if (triggers_nodelist.length <= 0) {
			return;
		}

		triggers_nodelist.forEach((value) => {
			value.addEventListener("click", () => {
				ACTION_close_sidebar_navigation_menu();
			});
		});
	} catch (error) {
		console.error("Sidebar close triggers not set: ", error);
	}
	return;
}

function SETUP_sidebar_menu_open_listeners() {
	try {
		const triggers_nodelist = document.querySelectorAll(
			"[data-sidebar-menu-open-trigger]"
		);
		if (triggers_nodelist.length <= 0) {
			return;
		}

		triggers_nodelist.forEach((value) => {
			value.addEventListener("click", () => {
				ACTION_open_sidebar_navigation_menu();
			});
		});
	} catch (error) {
		console.error("Sidebar open triggers not set: ", error);
	}
	return;
}

function SETUP_testimonials_carousel() {
	const slider = new Glide("#testimonials-slider", {
		animationDuration: 1000,
		autoplay: 4000,
		breakpoints: {
			// 1280: {
			// 	perView: 3,
			// },
			1024: {
				perView: 4,
			},
			768: {
				perView: 3,
			},
			640: {
				perView: 2,
			},
			480: {
				perView: 1,
			},
		},
		focusAt: 0,
		gap: 20,
		perView: 5,
		startAt: 0,
		type: "carousel",
	});
	slider.mount();
	return slider;
}

function SETUP_start_mini_game() {
	startGame();
}

/*########################################################
# PAGE LOAD AND DOM CONTENT LOAD EVEN HANDLERS.
########################################################*/

function onDomContentLoaded() {
	// page scrolling setup
	VARS.page_simplebar_instance = SETUP_page_simplebar_instance() || undefined;

	// lenis smooth scroll
	VARS.page_lenis_instance = SETUP_page_lenis_instance() || undefined;

	// sidebar menu setup
	VARS.sidebar_menu =
		document.getElementById("sidebar-menu-container") || undefined;
	SETUP_sidebar_menu_open_listeners();
	SETUP_sidebar_menu_close_listeners();

	return;
}
window.addEventListener("DOMContentLoaded", onDomContentLoaded);

function onPageLoad() {
	SETUP_testimonials_carousel();

	SETUP_start_mini_game();

	console.log(VARS);
}
window.addEventListener("load", onPageLoad);
