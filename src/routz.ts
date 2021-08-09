export type RouteDefinition = string;

export type Route = string;

export type Routes = Record<string, RouteDefinition>;

export type Params = Record<string, string> | null;

/**
 * Returns the route defintion by a name.
 * @private
 * @throws {Error} when given name is not found in routes.
 */
export type Receiver = (name: string) => RouteDefinition;

/**
 * Builds a url for a route by name and params. Params are dynamic parts of a
 * url that are defined in the format `[param]`. Optional params are defined by
 * a question mark at the end like `[optionalParam?]`. The params need to be
 * passed as a key/value object, optional params doesn't need to be defined in
 * this object while missing regular params will throw an error.
 *
 * @throws {Error} when given name is not found in routes.
 * @throws {Error} when given params are not matching the route definition.
 */
export type Resolver = (name: string, params?: Params) => Route;

/**
 * Defines the routes and returns scoped `recieve` and `resolve` functions that
 * access the defined routes.
 */
export type Definition = {
	receive: Receiver;
	resolve: Resolver;
};

const REGEXP_PARAMS = /\[([a-zA-Z]*)(\??)\]/;
const REGEXP_SLASH_SANITIZED = /\/(\/*)/;
const REGEXP_SLASH_ENDOFPATH = /\/$/;

export const define = (routes: Routes): Definition => {

	const receive: Receiver = (name) => {
		const route = routes[name];
		if (!route) {
			throw new Error(`Can not find route by name "${name}".`);
		}

		return route;
	};

	const resolve: Resolver = (name, params) => {

		const parameters = { ...params };
		const route = receive(name);

		let match: RegExpExecArray | null = null;
		let path = route;

		// This mimics a .matchAll() which is not implemented in all all node and
		// browser versions.
		while ((match = REGEXP_PARAMS.exec(route)) !== null) {
			const [, key, optional] = match;
			let replace = `${parameters[key]}`;

			if (!parameters[key]) {
				if (!optional) {
					throw new Error(`Missing param "${key}" for route "${name}".`);
				}

				replace = '';
			}

			path = path.replace(`[${key}${optional}]`, replace);
		}

		path = path.replace(REGEXP_SLASH_SANITIZED, '/');

		if (REGEXP_SLASH_ENDOFPATH.test(path) && !REGEXP_SLASH_ENDOFPATH.test(route)) {
			path = path.replace(REGEXP_SLASH_ENDOFPATH, '');
		}

		if (!REGEXP_SLASH_ENDOFPATH.test(path) && REGEXP_SLASH_ENDOFPATH.test(route)) {
			path = `${path}/`;
		}

		return path;
	};

	return {
		receive,
		resolve,
	};
};
