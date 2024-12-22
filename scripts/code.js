/**
 *
 * (c) Copyright Ascensio System SIA 2020
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
 // todo поправить readme  и собранный плагин и с синонимами поправить тоже
(function(window, undefined){
	let ApiKey = '';
	let bHasKey = false;
	let model = '';
	let url = '';
	let org = '';
	let maxLen = 1600000;
	let loadingPhrase = 'Loading...';
	let thesaurusCounter = 0;
	let settingsWindow = null;
	let chatWindow = null;
	let customReqWindow = null;
	let imgsize = null;
	let link = null;
	let linkWindow = null;
	let streamFlag = false;
	var C = {};

	window.Asc.plugin.init = function() {};

	var checkApiKey = function() {
		model = localStorage.getItem('model') || '';
		org = localStorage.getItem('org') || '';
		[ApiKey, url] = T.gl(org);
		if (!ApiKey.length || !model.length || !url.length) {
			bHasKey = false;
		} else {
			bHasKey = true;
		}
	};

	var getContextMenuItems = function(options) {
		link = null;
		checkApiKey();
		let settings = {
			guid: window.Asc.plugin.guid,
			items: [
				{
					id : 'ChatGPT',
					text : generateText('ChatGPT'),
					items : []
				}
			]
		};

		if (bHasKey)
		{
			switch (options.type)
			{
				case 'Target':
				{
					if (Asc.plugin.info.editorType === 'word') {
						settings.items[0].items.push({
							id : 'onMeaningT',
							text : generateText('Explain text in comment')
						});
					}

					break;
				}
				case 'Selection':
				{
					if (Asc.plugin.info.editorType === 'word') {
						settings.items[0].items.push(
							{
								id : 'onFixSpelling',
								text : generateText('Fix spelling & grammar')
							},
							{
								id : 'onRewrite',
								text : generateText('Rewrite differently')
							},
							{
								id : 'onGenerateText',
								text : generateText('Generate text')
							},
							{
								id : 'onMakeLonger',
								text : generateText('Make longer')
							},
							{
								id : 'onMakeShorter',
								text : generateText('Make shorter')
							},
							{
								id : 'onMakeBetter',
								text : generateText('Make better')
							},
							{
								id : 'TextAnalysis',
								text : generateText('Text analysis'),
								separator: true,
								items : [
									{
										id : 'onSummarize',
										text : generateText('Summarize')
									},
									{
										id : 'onKeyWords',
										text : generateText('Keywords')
									},
								]
							},
							{
								id : 'Tex Meaning',
								text : generateText('Word analysis'),
								items : [
									{
										id : 'onSynonymsWord',
										text : generateText('Synonyms'),
									},
									{
										id : 'onMeaningS',
										text : generateText('Explain text in comment'),
									},
									{
										id : 'onMeaningLinkS',
										text : generateText('Explain text in hyperlink')
									}
								]
							},
							{
								id : 'TranslateText',
								text : generateText('Translate'),
								items : [
									{
										id : 'onTranslate',
										text : generateText('Translate to English'),
										data : 'Translate to English'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to Chinese'),
										data : 'Translate to Chinese'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to French'),
										data : 'Translate to French'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to German'),
										data : 'Translate to German'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to traditional Chinese'),
										data : 'Translate to traditional Chinese'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to Japanese'),
										data : 'Translate to Japanese'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to Russian'),
										data : 'Translate to Russian'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to Korean'),
										data : 'Translate to Korean'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to Spanish'),
										data : 'Translate to Spanish'
									},
									{
										id : 'onTranslate',
										text : generateText('Translate to Italian'),
										data : 'Translate to Italian'
									}
								]
							},
							// {
							// 	id : 'OnGenerateImageList',
							// 	text : generateText('Generate image from text'),
							// 	items : [
							// 		{
							// 			id : 'OnGenerateImage',
							// 			text : generateText('256x256'),
							// 			data : 256
							// 		},
							// 		{
							// 			id : 'OnGenerateImage',
							// 			text : generateText('512x512'),
							// 			data : 512
							// 		},
							// 		{
							// 			id : 'OnGenerateImage',
							// 			text : generateText('1024x1024'),
							// 			data : 1024
							// 		}
							// 	]
							// }
						);
					}
					break;
				}
				case 'Image':
				case 'Shape':
					{
						settings.items[0].items.push(
							{
								id : 'onImgDesc',
								text : generateText('Describe image')
							},
							// {
							// 	id : 'onImgVar',
							// 	text : generateText('Generate image variation')
							// }
						);

						break;
					}
				case 'Hyperlink':
					{
						settings.items[0].items.push({
							id : 'onHyperlink',
							text : generateText('Show hyperlink content')
						});
						link = options.value;
						break;
					}

				default:
					break;
			}

			settings.items[0].items.push(
				{
					id : 'onChat',
					text : generateText('Chat'),
					separator: true
				}
			);
		}

		settings.items[0].items.push({
				id : 'onSettings',
				text : generateText('Settings'),
				separator: true
		});

		return settings;
	}

	window.Asc.plugin.attachEvent('onContextMenuShow', function(options) {
		// todo: change key validation
		if (!options) {return;}

		this.executeMethod('AddContextMenuItem', [getContextMenuItems(options)]);

		if (bHasKey && options.type === "Target")
		{
			window.Asc.plugin.executeMethod('GetCurrentWord', null, function(text) {
				if (!isEmpyText(text, true)) {
					thesaurusCounter++;
					let tokens = window.Asc.OpenAIEncode(text);
					createSettings(text, tokens, 9, true);
				}
			});
		}
	});

	var generateText = function(text) {
		let lang = window.Asc.plugin.info.lang.substring(0,2);
		let result = { en: text	};
		if (lang !== "en") {result[lang] = window.Asc.plugin.tr(text);}
		return result;
	};

	var getText = function(text) {
		let lang = window.Asc.plugin.info.lang.substring(0,2);
		if (lang !== "en") {text = window.Asc.plugin.tr(text);}
		return text;
	};

	window.Asc.plugin.attachContextMenuClickEvent('onSettings', function() {
		let location  = window.location;
		let start = location.pathname.lastIndexOf('/') + 1;
		let file = location.pathname.substring(start);

		// default settings for modal window (I created separate settings, because we have many unnecessary field in plugin variations)
		let variation = {
			url : location.href.replace(file, 'settings.html'),
			description : window.Asc.plugin.tr('Settings'),
			isVisual : true,
			buttons : [],
			isModal : true,
			EditorsSupport : ["word", "slide", "cell"],
			size : [ 592, 100 ]
		};

		if (!settingsWindow) {
			settingsWindow = new window.Asc.PluginWindow();
			settingsWindow.attachEvent("onWindowMessage", function(message) {
				messageHandler(settingsWindow, message);
			});
		}
		settingsWindow.show(variation);
	});

	// window.Asc.plugin.attachContextMenuClickEvent('onCustomReq', function() {
	// 	let location  = window.location;
	// 	let start = location.pathname.lastIndexOf('/') + 1;
	// 	let file = location.pathname.substring(start);

	// 	// default settings for modal window (I created separate settings, because we have many unnecessary field in plugin variations)
	// 	let variation = {
	// 		url : location.href.replace(file, 'custom.html'),
	// 		description : window.Asc.plugin.tr('OpenAI'),
	// 		isVisual : true,
	// 		buttons : [],
	// 		isModal : true,
	// 		EditorsSupport : ["word", "slide", "cell"],
	// 		size : [ 400, 400 ]
	// 	};

	// 	if (!customReqWindow) {
	// 		customReqWindow = new window.Asc.PluginWindow();
	// 		customReqWindow.attachEvent("onWindowMessage", function(message) {
	// 			messageHandler(customReqWindow, message);
	// 		});
	// 	}
	// 	customReqWindow.show(variation);
	// });

	window.Asc.plugin.attachContextMenuClickEvent('onChat', function() {
		let location  = window.location;
		let start = location.pathname.lastIndexOf('/') + 1;
		let file = location.pathname.substring(start);

		// default settings for modal window (I created separate settings, because we have many unnecessary field in plugin variations)
		let variation = {
			url : location.href.replace(file, 'chat.html'),
			description : window.Asc.plugin.tr('ChatGPT'),
			isVisual : true,
			buttons : [],
			isModal : false,
			EditorsSupport : ["word", "slide", "cell"],
			size : [ 400, 400 ]
		};

		if (!chatWindow) {
			chatWindow = new window.Asc.PluginWindow();
			chatWindow.attachEvent("onWindowMessage", function(message){
				messageHandler(chatWindow, message);
			});
		}
		chatWindow.show(variation);
	});

	window.Asc.plugin.attachContextMenuClickEvent('onHyperlink', function(data) {
		let location  = window.location;
		let start = location.pathname.lastIndexOf('/') + 1;
		let file = location.pathname.substring(start);

		// default settings for modal window (I created separate settings, because we have many unnecessary field in plugin variations)
		let variation = {
			url : location.href.replace(file, 'hyperlink.html'),
			description : window.Asc.plugin.tr('Hyperlink'),
			isVisual : true,
			buttons : [],
			isModal : false,
			EditorsSupport : ["word"],
			size : [ 1000, 1000 ]
		};

		if (!linkWindow) {
			linkWindow = new window.Asc.PluginWindow();
			linkWindow.attachEvent("onWindowMessage", function(message){
				messageHandler(linkWindow, message);
			});
		}
		linkWindow.show(variation);
		setTimeout(function() {
			linkWindow.command('onTest', link);
		},500)
	});

	window.Asc.plugin.attachContextMenuClickEvent('onMeaningT', function() {
		window.Asc.plugin.executeMethod('GetCurrentWord', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 8);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onSummarize', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 1);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onKeyWords', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 2);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onMeaningS', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 3);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onMeaningLinkS', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 4);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onSynonymsWord', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 5);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onTranslate', function(data) {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				let message = getText(data) + ': ' + `${text}`;
				createSettings(message, tokens, 6);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('OnGenerateImage', function(data) {
		let size = Number(data);
		imgsize = {width: size, height: size};
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 7);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onThesaurus', function(data) {
		window.Asc.plugin.executeMethod('ReplaceCurrentWord', [data]);
	});

	window.Asc.plugin.attachContextMenuClickEvent('onImgDesc', function() {
		window.Asc.plugin.executeMethod('GetImageDataFromSelection', null, function(data) {
			createSettings(data, 0, 15);
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onImgVar', function() {
		window.Asc.plugin.executeMethod('GetImageDataFromSelection', null, function(data) {
			createSettings(data, 0, 10);
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onFixSpelling', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 11);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onRewrite', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 12);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onMakeLonger', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 13);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onMakeShorter', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 14);
			}
		});
	});
	
	window.Asc.plugin.attachContextMenuClickEvent('onMakeBetter', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 16);
			}
		});
	});

	window.Asc.plugin.attachContextMenuClickEvent('onGenerateText', function() {
		window.Asc.plugin.executeMethod('GetSelectedText', null, function(text) {
			if (!isEmpyText(text)) {
				let tokens = window.Asc.OpenAIEncode(text);
				createSettings(text, tokens, 17);
			}
		});
	});

	var createSettings = function(text, tokens, type, isNoBlockedAction) {
		window.Asc.plugin.executeMethod('StartAction', [isNoBlockedAction ? 'Information' : 'Block', loadingPhrase]);
		let lang = window.Asc.plugin.info.lang.substring(0,2);
		let aiUrl = null;
		let settings = null;
		[aiUrl, settings] = T.cs(text, tokens, type, imgsize, lang, window.Asc.plugin, isNoBlockedAction);
		fetchData(org, settings, aiUrl, type, isNoBlockedAction);
	};

	var fetchData = function(org, settings, aiUrl, type, isNoBlockedAction) {
		let header = {};
		if (org === 'openai') {
			header.Authorization = 'Bearer ' + ApiKey;
		}
		if (type !== 10) {
			header['Content-Type'] = 'application/json';
		}
		fetch(aiUrl, {
				method: 'POST',
				headers: header,
				body: (type !== 10 ? JSON.stringify(settings) : settings),
			})
			.then(function(response) {
				return response.json();
			})
			.then(function(data) {
				if (data.error) {throw data.error;}
				if (type !== 7 || type !== 10) {
					data = T.dct(data, org, type);
				}
				processResult(org, data, type, isNoBlockedAction);
			})
			.catch(function(error) {
				if (type == 9) {
					thesaurusCounter--;
				}
				console.error(error);
				window.Asc.plugin.executeMethod('EndAction', [isNoBlockedAction ? 'Information' : 'Block', loadingPhrase]);
			});
	};

	var processResult = function(org, data, type, isNoBlockedAction) {
		window.Asc.plugin.executeMethod('EndAction', [isNoBlockedAction ? 'Information' : 'Block', loadingPhrase]);
		let text, start, end, img;
		Asc.scope = {};
		switch (type) {
			case 1:
				Asc.scope.text = getText('Summarize');
				Asc.scope.data = data.split('\n\n');
				window.Asc.plugin.callCommand(function() {
					let oDocument = Api.GetDocument();
					let sumPar = Api.CreateParagraph();
					sumPar.AddText(Asc.scope.text + ': ');
					oDocument.Push(sumPar);
					for(let ind = 0; ind < Asc.scope.data.length; ind++) {
						let text = Asc.scope.data[ind];
						if (text.length) {
							let oParagraph = Api.CreateParagraph();
							oParagraph.AddText(text);
							oDocument.Push(oParagraph);
						}
					}
				}, false);
				break;

			case 2:
				Asc.scope.text = getText('Keywords');
				Asc.scope.data = data.split('\n\n');
				window.Asc.plugin.callCommand(function() {
					let oDocument = Api.GetDocument();
					for(let ind = 0; ind < Asc.scope.data.length; ind++) {
						let text = Asc.scope.data[ind];
						if (text.length) {
							let oParagraph = Api.CreateParagraph();
							oParagraph.AddText(Asc.scope.text + ': ' + text);
							oDocument.Push(oParagraph);
						}
					}
				}, false);
				break;

			case 3:
				Asc.scope.text = org;
				Asc.scope.comment = data.startsWith('\n\n') ? data.substring(2) : data;
				window.Asc.plugin.callCommand(function() {
					let oDocument = Api.GetDocument();
					let oRange = oDocument.GetRangeBySelect();
					oRange.AddComment(Asc.scope.comment, Asc.scope.text);
				}, false);
				break;

			case 4:
				Asc.scope.text = org;
				start = data.indexOf('htt');
				end = data.indexOf(' ', start);
				if (end == -1) {
					end = data.length;
				}
				Asc.scope.link = data.slice(start, end);
				if (Asc.scope.link) {
					window.Asc.plugin.callCommand(function() {
						let oDocument = Api.GetDocument();
						let oRange = oDocument.GetRangeBySelect();
						oRange.AddHyperlink(Asc.scope.link, Asc.scope.text);
					}, false);
				}
				break;

			case 5:
				Asc.scope.text = getText('Synonyms');
				Asc.scope.data = data.split('\n\n');
				window.Asc.plugin.callCommand(function() {
					let oDocument = Api.GetDocument();
					for(let ind = 0; ind < Asc.scope.data.length; ind++) {
						let text = Asc.scope.data[ind];
						if (text.length) {
							let oParagraph = Api.CreateParagraph();
							oParagraph.AddText(Asc.scope.text + ': ' + text);
							oDocument.Push(oParagraph);
						}
					}
				}, false);
				break;

			case 6:
				text = data.startsWith('\n\n') ? data.substring(2) : data;
				window.Asc.plugin.executeMethod('PasteText', [text]);
				break;

			case 7:
				let url = (data.data && data.data[0]) ? data.data[0].b64_json : null;
				if (url) {
					Asc.scope.url = /^data\:image\/png\;base64/.test(url) ? url : 'data:image/png;base64,' + url + '';
					Asc.scope.imgsize = T.getImgSize();
					imgsize = null;
					window.Asc.plugin.callCommand(function() {
						let oDocument = Api.GetDocument();
						let oParagraph = Api.CreateParagraph();
						let width = Asc.scope.imgsize.width * (25.4 / 96.0) * 36000;
						let height = Asc.scope.imgsize.height * (25.4 / 96.0) * 36000;
						let oDrawing = Api.CreateImage(Asc.scope.url, width, height);
						oParagraph.AddDrawing(oDrawing);
						oDocument.Push(oParagraph);
					}, false);
				}
				break;

			case 8:
				Asc.scope.text = org;
				Asc.scope.comment = data.startsWith('\n\n') ? data.substring(2) : data;
				window.Asc.plugin.callCommand(function() {
					var oDocument = Api.GetDocument();
					Api.AddComment(oDocument, Asc.scope.comment, Asc.scope.text);
				}, false);
				break;

			case 9:
				thesaurusCounter--;
				if (0 < thesaurusCounter) {return;}
				let startPos = data.indexOf("[");
				let endPos = data.indexOf("]");
				if (-1 === startPos || -1 === endPos || startPos > endPos) {return;}
				text = data.substring(startPos, endPos + 1);
				let arrayWords = eval(text);
				let items = getContextMenuItems({ type : "Target" });
				let itemNew = {
					id : "onThesaurusList",
					text : generateText("Thesaurus"),
					items : []
				};

				for (let i = 0; i < arrayWords.length; i++)
				{
					itemNew.items.push({
							id : 'onThesaurus',
							data : arrayWords[i],
							text : arrayWords[i]
						}
					);
				}

				items.items[0].items.unshift(itemNew);
				window.Asc.plugin.executeMethod('UpdateContextMenuItem', [items]);
				break;

			case 10:
				img = (data.data && data.data[0]) ? data.data[0].b64_json : null;
				if (img) {
					let sImageSrc = /^data\:image\/png\;base64/.test(img) ? img : 'data:image/png;base64,' + img + '';
					let oImageData = {
						"src": sImageSrc,
						"width": imgsize.width,
						"height": imgsize.height
					};
					imgsize = null;
					window.Asc.plugin.executeMethod("PutImageDataToSelection", [oImageData]);
				}
				break;

			case 11:
				text = data.split('\n\n');
				if (text !== 'The text is correct, there are no errors in it.') {
					window.Asc.plugin.executeMethod('ReplaceTextSmart', [text]);
				} else {
					console.log('The text is correct, there are no errors in it.');
				}
				break;

			case 12:
			case 13:
			case 14:
			case 16:
				text = data.replace(/\n\n/g, '\n');
				window.Asc.plugin.executeMethod('PasteText', [text]);
				break;
			case 15:
				Asc.scope.data = data.split('\n\n');
				window.Asc.plugin.executeMethod("PasteText", [data]);
				break;
			case 17:
				Asc.scope.data = data.split('\n\n');
				window.Asc.plugin.callCommand(function() {
					let oDocument = Api.GetDocument();
					for(let ind = 0; ind < Asc.scope.data.length; ind++) {
						let text = Asc.scope.data[ind];
						if (text.length) {
							let oParagraph = Api.CreateParagraph();
							oParagraph.AddText(text);
							oDocument.Push(oParagraph);
						}
					}
				}, false);
				break;
		}
	};

	window.Asc.plugin.button = function(id, windowId) {
		if (!settingsWindow && !chatWindow && !linkWindow && !customReqWindow) {return;}
		if (windowId) {
			switch (id) {
				case -1:
				default:
					window.Asc.plugin.executeMethod('CloseWindow', [windowId]);
			}
		}

	};

	window.Asc.plugin.onTranslate = function() {
		loadingPhrase = window.Asc.plugin.tr(loadingPhrase);
	};

	var messageHandler = function(modal, message) {
		switch (message.type) {
			case 'onWindowReady':
				modal.command('onApiKey', message)
				break;

			case 'onRemoveApiKey':
				localStorage.removeItem('ApiKey');
				break;

			case 'onAddApiKey':
				localStorage.setItem('model', message.model);
				localStorage.setItem('org', message.org);
				switch(message.org) {
					case "openai":
						localStorage.setItem('openaiKey', message.key);
						localStorage.setItem('openaiUrl', message.url);
						break;
					case "google":
						localStorage.setItem('googleKey', message.key);
						localStorage.setItem('googleUrl', message.url);
						break;
					case "ollama":
						localStorage.setItem('ollamaKey', message.key);
						localStorage.setItem('ollamaUrl', message.url);
						break;
				}
				maxLen = message.maxTokens
				window.Asc.plugin.executeMethod('CloseWindow', [modal.id]);
				break;

			case 'onExecuteMethod':
				window.Asc.plugin.executeMethod('CloseWindow', [modal.id], function(){
					window.Asc.plugin.executeMethod(message.method, [message.data]);
					customReqWindow = null;
				});
				break;

			case 'onGetLink':
				modal.command('onSetLink', link);
				break;
		}
	};

	var isEmpyText = function(text, bDonShowErr) {
		if (text.trim() === '') {
			if (!bDonShowErr) {
				console.error('No word in this position or nothing is selected.');
			}
			return true;
		}
		return false;
	};

})(window, undefined);
