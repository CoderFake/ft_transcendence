import { Client } from "./api/Client.js";

import Search from "./views/Search.js";
import HomeView from "./views/HomeView.js";
import LogoutView from "./views/accounts/LogoutView.js";

import PongOnlineView from "./views/PongOnlineView.js";
import { PongOfflineView } from "./views/PongOfflineView.js";

import PageNotFoundView from './views/PageNotFoundView.js' ;

import DashboardView from "./views/DashboardView.js";
import AbstractRedirectView from "./views/abstracts/AbstractRedirectView.js";
import SettingsView from "./views/SettingsView.js";
import ProfilePageView from "./views/ProfilePageView.js";
import MatchMakingView from "./views/MatchMakingView.js";
import AuthenticationView from "./views/accounts/AuthenticationView.js";

let client = new Client(location.origin);
let lang = client.lang;

let lastView;
let lastPageUrlBeforeLogin;

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {

    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);
    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const navigateTo = async (uri) => {

	history.pushState(null, null, uri);

    if (await router(uri) !== 0)
		return;

	let link = document.querySelector('a[href=\'' + location.pathname + '\']');
	if (link) {
		document.querySelector('[data-link].active')?.classList.remove('active');
		link.classList.add('active');
	}
};

const reloadView = async _ => {
	await lastView?.leavePage();
	await renderView(lastView);
};

async function renderView(view)
{
    let content = await view?.getHtml();
    if (content == null)
        return 1;

    view.setTitle();
    document.querySelector("#app").innerHTML = content;

	let error_code = await view.postInit();

    if (error_code === 404)
        renderView(new PageNotFoundView());
    else if (error_code === 403)
        this._client._update_logged(false);
}

const router = async(uri) => {

    const routes = [
        { path: "/", view: DashboardView},
        { path: "/profiles/:username", view: ProfilePageView },
        { path: "/login", view: AuthenticationView },
        { path: "/register", view: AuthenticationView },
        { path: "/logout", view: LogoutView },
        { path: "/search", view: Search },
        { path: "/home", view: HomeView },
        { path: "/settings", view: SettingsView },
        { path: "/matchmaking", view: MatchMakingView },
        { path: "/games/pong/offline", view: PongOfflineView },
        { path: "/games/pong/:id", view: PongOnlineView },
    ];

    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: uri.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: {
				path: uri,
				view: PageNotFoundView
			},
            result: [uri]
        };
    }

	if (lastView !== undefined)
		await lastView.leavePage();

    const view = new match.route.view(getParams(match), lastPageUrlBeforeLogin);

	if (!(view instanceof AuthenticationView) && ! (view instanceof LogoutView))
		lastPageUrlBeforeLogin = uri;

    if (view instanceof AbstractRedirectView && await view.redirect())
        return 1;

	lastView = view;

    if (await renderView(view))
        return 1;

    return 0;
};

window.addEventListener("popstate", function() {router(location.pathname);});

document.addEventListener("DOMContentLoaded", async () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
			document.querySelector('[data-link].nav-link.active')?.classList.remove('active');
			if (e.target.classList.contains('nav-link'))
				e.target.classList.add('active');
            navigateTo(e.target.href.slice(location.origin.length));
        }
    });

	//Languages
	await lang.waitLoading();
	Array.from(document.getElementById('languageSelector').children).forEach(el => {
		el.onclick = async _ => {
			if (await lang.changeLanguage(el.value))
				return;
			document.querySelector('#languageSelector > .active')?.classList.remove('active');
			el.classList.add('active');
		};
	});
	document.querySelector(`#languageSelector > [value=${lang.chosenLang}]`)
		?.classList.add('active');

	await client.isAuthenticated();
    router(location.pathname);
	document.querySelector('a[href=\'' + location.pathname + '\']')?.classList.add('active');
});

export { client, lang, lastView, navigateTo, reloadView };
