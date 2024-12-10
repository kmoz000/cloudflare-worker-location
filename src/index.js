
import Router from './router';
import getLocationHandler from './getLocation';
import getLocationTextHandler from './getLocationText';
import up from './up';
import down from './down';
async function handleRequest(request) {
	const r = new Router();
	r.get('.*/ros', getLocationTextHandler);
	r.get('.*/json', getLocationHandler);
	r.get('.*/speed/down', down);
	r.post('.*/speed/up', up);
	return await r.route(request);
}

export default {
	async fetch(request, env, ctx) {
		return handleRequest(request);
	},
};
