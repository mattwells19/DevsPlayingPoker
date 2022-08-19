const post = async (url, body) => {
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "Application/json",
		},
		body: JSON.stringify(body),
	};

	const res = await fetch(url, options);
	const json = await res.json();

	if (!res.ok) {
		return Promise.reject(json.message);
	}

	return Promise.resolve(json);
};

export default post;
