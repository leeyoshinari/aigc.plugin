/**
 *
 * (c) Copyright Ascensio System SIA 2020
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function(window, undefined) {
	let loader = null;
	let errMessage = 'Error';
	let loadMessage = 'Loading...';
	window.Asc.plugin.init = function() {
		createLoader();
		sendPluginMessage({type: 'onWindowReady'});
		
		document.getElementById('btn_save').onclick = function() {
			document.getElementById('err_message').innerText = '';
			document.getElementById('success_message').classList.add('hidden');
			sendPluginMessage({type: 'onRemoveApiKey'});
			let key = document.getElementById('inp_key').value.trim();
			let org = document.getElementById('inp_org').value.trim();
			let url = document.getElementById('inp_url').value.trim();
			let model = document.getElementById('inp_model').value.trim();
			let maxTokens = 1600000;
			if (url.length && org.length && model.length) {
				createLoader();
				sendPluginMessage({type: 'onAddApiKey', key: key, model: model, url: url, org: org, maxTokens: maxTokens});
				destroyLoader();
			} else {
				createError(new Error(errMessage));
			}
		}

		document.getElementById('inp_org').onchange = function () {
			let org = document.getElementById("inp_org").value;
			document.getElementById("inp_model").options.length = 0;
			let apiKey = '';
			let url = '';
			[apiKey, url] = T.gl(org);
			document.getElementById('inp_key').value = apiKey;
			document.getElementById('inp_url').value = url;
			document.getElementById("inp_model").onclick = function() {
				get_models(org);
			}
		}
	};


	var get_models = function(org){
		let url = document.getElementById('inp_url').value.trim();
		let key = document.getElementById('inp_key').value.trim();
		let h = {};
		if (org === "openai") {
			h = {'Authorization': 'Bearer ' + key};
		}
		fetch(T.gfu(org, url, "", key, "ListModelPath"), {
			method: 'GET',
			headers: h,
		})
		.then(function(response) {
			if (response.ok) {
				response.json().then(function(data) {
					let model_node = document.getElementById("inp_model");
					switch (org) {
						case "openai":
							data.data.forEach(item => {model_node.add(new Option(item.id, item.id));})
							break;
						case "google":
							data.models.forEach(item => {
								if (item.name.indexOf('gemini') > 0) {
									model_node.add(new Option(item.displayName, item.name));
								}
							})
							break;
						case "ollama":
							data.models.forEach(item => {model_node.add(new Option(item.model, item.model));})
							break;
					}
					document.getElementById("inp_model").onclick = null;
				});
			} else {
				response.json().then(function(data) {
					let message = data.error && data.error.message ? data.error.message : 'models 查询失败';
					createError(new Error(message));
				});
			}
		})
		.catch(function(error) {
			document.getElementById('err_message').innerText = 'models 查询失败';
			console.error(error.message || 'models 查询失败');
		})
	};

	var createError = function(error) {
		document.getElementById('err_message').innerText = errMessage;
		console.error(error.message || errMessage);
	};

	var createLoader = function() {
		if (!window.Asc.plugin.theme) {
			window.Asc.plugin.theme = {type: 'light'};
		}
		$('#loader-container').removeClass( "hidden" );
		loader && (loader.remove ? loader.remove() : $('#loader-container')[0].removeChild(loader));
		loader = showLoader($('#loader-container')[0], loadMessage);
	};

	var destroyLoader = function() {
		$('#loader-container').addClass( "hidden" )
		loader && (loader.remove ? loader.remove() : $('#loader-container')[0].removeChild(loader));
		loader = null;
	};

	var sendPluginMessage = function(message) {
		window.Asc.plugin.sendToPlugin("onWindowMessage", message);
	};

	var getMaxTokens = function(model) {
		let result = 4000;
		let arr = model.split('-');
		let length = arr.find(function(el){return (el.slice(-1) === 'k' && el.length <= 3)});
		if (length) {
			result = Number(length.slice(0,-1)) * 1000;
		}
		return result;
	};

	window.Asc.plugin.onTranslate = function() {
		errMessage = window.Asc.plugin.tr(errMessage);
		loadMessage = window.Asc.plugin.tr(loadMessage);
		let elements = document.querySelectorAll('.i18n');
		elements.forEach(function(element) {
			element.innerText = window.Asc.plugin.tr(element.innerText);
		})
	};

	window.Asc.plugin.attachEvent("onApiKey", function(message) {
		let key = localStorage.getItem('ApiKey');
		let url = localStorage.getItem('url');
		let org = localStorage.getItem('org');
		[key, url] = T.gl(org);
		document.getElementById("inp_org").value = org;
		if (url) {
			document.getElementById('inp_url').value = url;
		}
		if (key) {
			document.getElementById('inp_key').value = key;
		}
		let model_node = document.getElementById("inp_model");
		model_node.options.length = 0;
		model_node.onclick = function() {
			get_models(org);
		}
		destroyLoader();
	});

})(window, undefined);
