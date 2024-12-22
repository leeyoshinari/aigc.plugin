(function (w) {
	var T = {};
	let imgsize = null;
	T.gl = function(org) {
		let apiKey = '';
		let url = '';
		switch(org) {
			case "openai":
				apiKey = localStorage.getItem('openaiKey') || '';
				url = localStorage.getItem('openaiUrl') || 'https://api.openai.com';
				break;
			case "google":
				apiKey = localStorage.getItem('googleKey') || '';
				url = localStorage.getItem('googleUrl') || 'https://generativelanguage.googleapis.com';
				break;
			case "ollama":
				apiKey = localStorage.getItem('ollamaKey') || '';
				url = localStorage.getItem('ollamaUrl') || 'http://127.0.0.1:11434';
				break;
		}
		return [apiKey, url];
	}

	T.gfu = function(org, url, model, key, path) {
		if (!url.endsWith('/')){
			url = url + '/';
		}
		switch (org) {
			case "openai":
				let openaiPath = {
					ChatPath: "v1/chat/completions",
					ListModelPath: "v1/models",
					ImageGenerate: "v1/images/generations",
					ImageVariation: "v1/images/variations",
				};
				url  = url + openaiPath[path];
				break;
			case "google":
				let googlePath = {
					ChatPath: (modelName, apiKey) => `v1beta/${modelName}:generateContent?key=${apiKey}`,
					ListModelPath: (modelName, apiKey) => `v1beta/models?key=${apiKey}`,
					ImageGenerate: (modelName, apiKey) => `v1beta/${modelName}:generateContent?key=${apiKey}`,
					ImageVariation: (modelName, apiKey) => `v1beta/${modelName}:generateContent?key=${apiKey}`,
					Image2Text: (modelName, apiKey) => `v1beta/${modelName}:generateContent?key=${apiKey}`,
				};
				url  = url + googlePath[path](model, key);
				break;
			case "ollama":
				let ollamaPath = {
					ChatPath: "api/chat",
					ListModelPath: "api/tags",
					ImageGenerate: "api/generate",
					ImageVariation: "api/generate",
					Image2Text: "api/generate",
				};
				url  = url + ollamaPath[path];
				break;
		}
		return url
	}

	T.gs = function(org, model, isStream=true) {
		let s = {model: model, messages: [], stream: isStream};
		switch (org) {
			case "openai":
				s = {model: model, messages: [], stream: isStream};
				break;
			case "google":
				s = {contents: []};
				break;
			case "ollama":
				s = {model: model, messages: [], stream: isStream};
				break;
		}
		return s;
	}

	T.itc = function(org, model, text, image) {
		let s = {model: model};
		switch (org) {
			case "openai":
				s = {model: model, messages: [{role: 'user', content: [{type: 'text', text: text}, {type: 'image_url', image_url: image}]}]};
				break;
			case "google":
				s = {contents: [{role: 'user', parts: [{text: text}, {inlineData: {data: image.split('base64,')[1], mimeType: "image/png"}}]}]};
				break;
			case "ollama":
				s = {model: model, prompt: text, stream: false, images: [image.split('base64,')[1]]};
				break;
		}
		return s;
	}

	T.get_image_settings = function(org, model, text) {
		let s = {model: model};
		switch (org) {
			case "openai":
				s = {model: model, prompt: text, response_format: 'b64_json', n: 1};
				break;
			case "google":
				s = {contents: [{role: 'user', parts: [{text: text}, {inlineData: {data: image.split('base64,')[1], mimeType: "image/png"}}]}]};
				break;
			case "ollama":
				s = {model: model, messages: []};
				break;
		}
		return s;
	}

	T.pm = function(org, s, text, r='user') {
		switch (org) {
			case "openai":
				s.messages.push({role: r, content: text.trim()});
				break;
			case "google":
				if (r !== 'user') {r = 'model';}
				s.contents.push({role: r, parts: [{text: text.trim()}]});
				break;
			case "ollama":
				s.messages.push({role: r, content: text.trim()});
				break;
		}
		return s;
	}

	T.dcs = function(text, org) {
		let res = '';
		switch (org) {
			case 'openai':
				let pattern = /{"content":"(.*?)"/g;
				let match;
				while ((match = pattern.exec(text)) !== null) {
					res += match[1];
				}
				break;
			case "google":
				let textJson = JSON.parse(text);
				res = textJson.candidates[0].content.parts[0].text;
				break;
			case "ollama":
				let p = /"content":"(.*?)"/g;
				let m;
				while ((m = p.exec(text)) !== null) {
					res += m[1];
				}
				break;
		}
		return res;
	}

	T.dct = function(data, org, type) {
		let res = '';
		switch (org) {
			case 'openai':
				res = data.choices[0].message.content;
				break;
			case "google":
				res = data.candidates[0].content.parts[0].text;
				break;
			case "ollama":
				if (type !== 15) {
					res = data.message.content;
				} else {
					res = data.response;
				}
				break;
		}
		return res;
	}

	T.cs = function(text, tokens, type, imgSize, lang, transl, isNoBlockedAction) {
		let aiUrl;
		let url = null;
		let ApiKey = null;
		let org = localStorage.getItem('org');
		let model = localStorage.getItem('model');
		[ApiKey, url] = T.gl(org);
		let settings = T.gs(org, model, false);
		imgsize = imgSize;
		switch (type) {
			case 1:
				settings = T.pm(org, settings, `${T.getText("Summarize this text", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 2:
				settings = T.pm(org, settings, `${T.getText("Get Key words from this text", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 3:
				settings = T.pm(org, settings, `${T.getText("What does it mean", lang, transl)}: ${text}?`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 4:
				settings = T.pm(org, settings, `${T.getText("Give a link to the explanation of the word", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 5:
				settings = T.pm(org, settings, `${T.getText("Get several synonyms for the word", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 6:
				settings = T.pm(org, settings, text, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 7:
				settings.prompt = `${T.getText("Generate image based on the description in the text", lang, transl)}: ${text}`;	// 文生图
				settings.n = 1;
				settings.size = `${imgsize.width}x${imgsize.height}`;
				settings.response_format = 'b64_json';
				aiUrl = T.gfu(org, url, model, ApiKey, "ImageGenerate");
				break;

			case 8:
				settings = T.pm(org, settings, `${T.getText("What does it mean", lang, transl)}: ${text}?`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 9:
				settings = T.pm(org, settings, `${T.getText("Give synonyms for the text as javascript array", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 10:
				T.imageToBlob(text).then(function(obj) {
					aiUrl = T.gfu(org, url, model, ApiKey, "ImageVariation");	// 图生图
					const formdata = new FormData();
					formdata.append('image', obj.blob);
					formdata.append('size', obj.size.str);
					formdata.append('model', model);
					formdata.append('n', 1);
					formdata.append('response_format', "b64_json");
					return [aiUrl, formdata];
				});
				break;

			case 11:
				settings = T.pm(org, settings, `${T.getText("Сorrect the errors in this text", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 12:
				settings = T.pm(org, settings, `${T.getText("Rewrite this text differently and give result on the same language", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;
			
			case 13:
				settings = T.pm(org, settings, `${T.getText("Make this text longer and give result on the same language", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;

			case 14:
				settings = T.pm(org, settings, `${T.getText("Make this text simpler and give result on the same language", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;
			case 15:
				aiUrl = T.gfu(org, url, model, ApiKey, "Image2Text");		//	 图生文
				settings = T.itc(org, model, T.getText("Describe and explain the image in detail", lang, transl), text.src);
				break;
			case 16:
				settings = T.pm(org, settings, `${T.getText("Polish this article with minimal changes to make it richer", lang, transl)}: ${text}`, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;
			case 17:
				settings = T.pm(org, settings, text, 'user');
				aiUrl = T.gfu(org, url, model, ApiKey, "ChatPath");
				break;
		}
		if (type !== 10 || type !== 15) {
			return [aiUrl, settings];
		}
	};

	T.imageToBlob = function(img) {
		return new Promise(function(resolve) {
			const image = new Image();
			image.onload = function() {
				const img_size = {width: image.width, height: image.height};
				const canvas_size = T.normalizeImageSize(img_size);
				const draw_size = canvas_size.width > image.width ? img_size : canvas_size;
				let canvas = document.createElement('canvas');
				canvas.width = canvas_size.width;
				canvas.height = canvas_size.height;
				canvas.getContext('2d').drawImage(image, 0, 0, draw_size.width, draw_size.height*image.height/image.width);
				imgsize = img_size;
				canvas.toBlob(function(blob) {resolve({blob: blob, size: canvas_size})}, 'image/png');
			};
			image.src = img.src;
		});
	};

	T.imageToBase64 = function(img) {
		return new Promise(function(resolve) {
			const image = new Image();
			image.onload = function() {
				const img_size = {width: image.width, height: image.height};
				const canvas_size = T.normalizeImageSize(img_size);
				const draw_size = canvas_size.width > image.width ? img_size : canvas_size;
				let canvas = document.createElement('canvas');
				canvas.width = canvas_size.width;
				canvas.height = canvas_size.height;
				canvas.getContext('2d').drawImage(image, 0, 0, draw_size.width, draw_size.height*image.height/image.width);
				const base64 = canvas.toDataURL('image/png');
				resolve({base64: base64, size: canvas_size});
			};
			image.src = img.src;
		});
	};

	T.normalizeImageSize = function(size) {
		let width = 0, height = 0;
		if ( size.width > 750 || size.height > 750 ) {
			width = height = 1024;
		} else if ( size.width > 375 || size.height > 350 ) {
			width = height = 512;
		} else {width = height = 256;}

		return {width: width, height: height, str: width + 'x' + height}
	};

	T.getText = function(text, lang, transl) {
		if (lang !== "en") {text = transl.tr(text);}
		return text;
	};

	T.getImgSize = function() {
		return imgsize;
	}

	w.T = T;
})(window);