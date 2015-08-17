let superagent;
if (typeof window.superagent == 'undefined') {
	console.error('Superagent is required to use Matter');
} else {
	superagent = window.superagent;
}

//TODO: Import config from seperate file
const config = {
	serverUrl: 'http://localhost:4000',
	tokenName: 'matter-client'
};
let request = {
	get(endpoint, queryData) {
		var req = superagent.get(endpoint);
		if (queryData) {
			req.query(queryData);
		}
		req = addAuthHeader(req);
		return handleResponse(req);
	},
	post(endpoint, data) {
		var req = superagent.post(endpoint).send(data);
		req = addAuthHeader(req);
		return handleResponse(req);
	},
	put(endpoint, data) {
		var req = superagent.put(endpoint).send(data);
		req = addAuthHeader(req);
		return handleResponse(req);
	},
	del(endpoint, data) {
		var req = superagent.put(endpoint).send(data);
		req = addAuthHeader(req);
		return handleResponse(req);
	}

};

export default request;

function handleResponse(req) {
	return new Promise((resolve, reject) => {
		req.end((err, res) => {
			if (!err) {
				// console.log('Response:', res);
				return resolve(res.body);
			} else {
				return reject(err);
			}
		});
	});
}
function addAuthHeader(req) {
	if (typeof window != 'undefined' && window.sessionStorage.getItem(config.tokenName)) {
		req = req.set('Authorization', 'Bearer ' + sessionStorage.getItem(config.tokenName));
		// console.log('Set auth header');
	}
	return req;
}
