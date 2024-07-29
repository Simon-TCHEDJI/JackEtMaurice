
window.onerror = function(error, url, line) {
    alert('error: ' +error+' URL:'+url+' L:'+line);
};

function initializeChat(ws_server, url, guid, email, variables, project_guid = '', discussion_id = '', create_new_discussion = null, processDiscussion = null) {
    console.log("initializeChat")
    if (window.chat_socket) {
        window.chat_socket.close(1000, "Normal Closure");
        window.chat_socket = null;
    }

    if (!ws_server) {
        ws_server = window.userUri;
    }
    if (!url) {
        url = window.hostUrl;
    }
    if (!guid) {
        guid = window.scenarioGuid;
    }
    if (!email) {
        email = window.userEmail;
    }
    if (!variables) {
        variables = window.userVariables;
    }

    const chat = document.querySelector(".vdom_chat");
    const localization = {
        "en": {
            "Restart chat": "Restart chat",
            "Start conversation again?": "Start conversation again?",
            "Yes": "Yes",
            "No": "No",
            "Close": "Close",
            "Cancel": "Cancel",
            "NO": "NO",
            "YES": "YES",
            "CANCEL": "CANCEL",
            "Type something...": "Type something..."
        },
        "fr": {
            "Restart chat": "Relancer le chat",
            "Start conversation again?": "Êtes-vous sur de vouloir redémarrer votre conversation?",
            "Yes": "Oui",
            "No": "Non",
            "Close": "Abandonner",
            "Cancel": "Annuler",
            "NO": "NON",
            "YES": "OUI",
            "CANCEL": "ANNULER",
            "Type something...": "Tapez quelque chose..."
        }
    };
    const lang = document.querySelector('.vdom_chat').getAttribute('lang');
    const elementsToTranslate = {
        ".popup_restart_chat": ["h2", "p", ".win_buttons button"],
        ".sending_message_holder": [".sending_message input"],
        ".chat_wrapper": [".ask_buttons button"]
    };

    if (localization[lang]) {
        Object.keys(elementsToTranslate).forEach(parentClass => {
            const parentElement = document.querySelector(parentClass);
            if (parentElement) {
                elementsToTranslate[parentClass].forEach(selector => {
                    const elements = parentElement.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (element.hasAttribute('placeholder')) {
                            const placeholderText = element.getAttribute('placeholder');
                            if (localization[lang][placeholderText]) {
                                element.setAttribute('placeholder', localization[lang][placeholderText]);
                            }
                        } else {
                            const translationKey = element.textContent.trim();
                            if (localization[lang][translationKey]) {
                                element.textContent = localization[lang][translationKey];
                            }
                        }
                    });
                });
            }
        });
    }

    const translateWord = (word, lang) => {
        const localization = {
            "en": {
                "YES": "YES",
                "NO": "NO",
                "CANCEL": "CANCEL",
                "Form data transmitted": "Form data transmitted",
                "Upload image": "Upload image",
                "Select photo": "Select photo",
                "Drag a photo here<br/>Or": "Drag a photo here<br/>Or"
            },
            "fr": {
                "YES": "OUI",
                "NO": "NON",
                "CANCEL": "ANNULER",
                "Form data transmitted": "Données du formulaire transmises",
                "Upload image": "Télécharger l'image",
                "Select photo": "Sélectionner une photo",
                "Drag a photo here<br/>Or": "Faites glisser une photo ici<br/>Ou"
            }
        };

        const wordsToReplacePattern = new RegExp(Object.keys(localization[lang]).join("|"), "g");

        return word.replace(wordsToReplacePattern, match => localization[lang][match]);
    };

    if (!ws_server || !url || !guid || !email || !variables) {
        if (!isFirstStart) {
            console.warn("Not all parameters are passed to create the window.chat_socket.");
        }
        isFirstStart = false;
        chat.classList.add("inactive");
        return;
    } else {
        chat.classList.remove("inactive");
    }

    const chatbox = document.getElementById("chatbox");
    chatbox.innerHTML = "";
    isFirstStart = false;

    let formContainer = document.getElementById("form_container");
    formContainer.classList.add("hide");
    formContainer.innerHTML = "";

    let iframeContainer = document.getElementById("iframe_container");
    iframeContainer.classList.add("hide");
    iframeContainer.innerHTML = "";


    ["ok_btn", "cancel_btn", "yes_btn", "no_btn", "typing_message"]
        .forEach(btnId => {
            document.getElementById(btnId).classList.add("hide");
        });

    document.getElementById("sending_message_holder").classList.remove("hide");
    document.querySelector('.ask_button.restart').classList.add("hide");
    // document.querySelector('.sending_message input#message').disabled = false;
    document.querySelector('.sending_message textarea#message').disabled = false;
    document.querySelector('.sending_message .send_btn').disabled = false;

    let typing_message = document.getElementById("typing_message");
    typing_message.classList.add("hide");

    let str_project = '';
    if (!project_guid) {
        project_guid = window.userProject;
    }
    if (project_guid) {
        str_project = `&project_guid=${project_guid}`;
    }

    let str_token = '';
    if (window.userAccessToken) {
        str_token = `&user_access_token=${window.userAccessToken}`;
    }

    let str_discussion = '';
    if (!discussion_id) {
        discussion_id = window.discussionId;
    }
    if (discussion_id) {
        str_discussion = `&discussion_guid=${discussion_id}`;
    }

    let str_createDiscussion = '';
    if (create_new_discussion !== null) {
        str_createDiscussion = `&create_new_discussion=${create_new_discussion}`;
    }

    variables = isAlreadyEncoded(variables) ? variables : encodeURIComponent(variables);

    window.chat_socket = new WebSocket(`${ws_server}?scenario_guid=${guid}&email=${email}&host=${url}${str_createDiscussion}&variables=${variables}${str_project}${str_token}${str_discussion}`);

    window.chat_socket.onerror = function (event) {
        //Sentry.captureException(event);
        window.logControl !== null && console.log('ERROR with websocket: ', event);
    }

    window.chat_socket.onopen = function () {
        window.logControl !== null && console.log('CHAT created successfully.');

        if (window.reconnectTimeout) {
            clearInterval(window.reconnectTimeout);
            window.reconnectTimeout = null;
        }
        if (window.pingTimer) {
            clearInterval(window.pingTimer);
        }
        window.pingTimer = startPingPong();
    };

    window.chat_socket.onmessage = function (event) {
        let data = JSON.parse(event.data);
        window.logControl === 'debug' && console.log('Received a new message.');
        //console.log("message data: ", event.data);
        if (data[0] == "discussion_guid") {
            let discussion_guid = data[1];
            window.logControl === 'debug' && console.log(`discussion_guid: ${discussion_guid}`);

            if (processDiscussion && typeof processDiscussion === 'function') {
                processDiscussion(discussion_guid);
            };
        }

        if (data[0] == "restart") {
            window.logControl !== null && console.log('CHAT has been restarted.');
            start(currentWS, currentUrl, currentGuid, currentEmail, currentVariables, currentProject, currentDiscussion, currentCallBack);
        }
        else if (data.length > 2) {
            window.logControl !== null && console.log("New chat command received: ", data[0]);
            if (data[0] != "display" && data[0] != "vapp") {
                window.triggerMsg = data[0];
                switch (window.triggerMsg) {
                    case "prompt":
                        document.getElementById("sending_message_holder").classList.remove("hide");
                        document.querySelector('.ask_button.restart').classList.add("hide");
                        chatbox.innerHTML += "<div class='message agent'>" + data[1].replace(/\n/g, "<br/>") + "</div>";
                        typing_message.classList.add("hide");
                        break;

                    case "alert":
                        document.getElementById("ok_btn").classList.remove("hide");
                        document.getElementById("sending_message_holder").classList.add("hide");
                        document.querySelector('.ask_button.restart').classList.remove("hide");
                        chatbox.innerHTML += "<div class='message agent'>" + data[1].replace(/\n/g, "<br/>") + "</div>";
                        typing_message.classList.add("hide");
                        break;

                    case "alertYN":
                        document.getElementById("yes_btn").classList.remove("hide");
                        document.getElementById("no_btn").classList.remove("hide");
                        document.getElementById("sending_message_holder").classList.add("hide");
                        document.querySelector('.ask_button.restart').classList.remove("hide");
                        chatbox.innerHTML += "<div class='message agent'>" + data[1].replace(/\n/g, "<br/>") + "</div>";
                        typing_message.classList.add("hide");
                        break;

                    case "alertOC":
                        document.getElementById("ok_btn").classList.remove("hide");
                        document.getElementById("cancel_btn").classList.remove("hide");
                        document.getElementById("sending_message_holder").classList.add("hide");
                        document.querySelector('.ask_button.restart').classList.remove("hide");
                        chatbox.innerHTML += "<div class='message agent'>" + data[1].replace(/\n/g, "<br/>") + "</div>";
                        typing_message.classList.add("hide");
                        break;

                    case "dialog":
                    case "cancelableDialog":
                        let form = document.createElement("form");
                        let form_header_wrapper = document.createElement("div");
                        form_header_wrapper.className = "form_group";
                        let h1 = document.createElement("h1");
                        h1.textContent = data[1];

                        form_header_wrapper.appendChild(h1);
                        form.appendChild(form_header_wrapper);

                        data.slice(2, -1).forEach(function (fieldData) {
                            let fieldElement = createFormField(fieldData);
                            form.appendChild(fieldElement);
                        });

                        let form_buttons_container = document.createElement("div");
                        form_buttons_container.className = "win_buttons";
                        let submitButton = document.createElement("button");
                        submitButton.type = "submit";
                        submitButton.className = "send_form_btn";
                        submitButton.textContent = "OK";

                        form_buttons_container.appendChild(submitButton);

                        if (window.triggerMsg === "cancelableDialog") {
                            let cancelButton = document.createElement("button");
                            cancelButton.className = "cancel_form_btn";
                            cancelButton.textContent = localization[lang]["Cancel"];
                            form_buttons_container.appendChild(cancelButton);

                            cancelButton.addEventListener("click", function (event) {
                                event.preventDefault();
                                typing_message.classList.remove("hide");
                                if (window.chat_socket) {
                                    var msg = { "message": ["Form_canceled"], "trigger": window.triggerMsg, "button": "CANCEL" };
                                    window.chat_socket.send(JSON.stringify(msg));
                                }

                                formContainer.classList.add("hide");
                                formContainer.innerHTML = "";
                            });
                        }

                        form.appendChild(form_buttons_container);

                        form.addEventListener('submit', function (event) {
                            event.preventDefault();
                            typing_message.classList.remove("hide");
                            let formData = new FormData(form);
                            let form_values = [];
                            formData.forEach(function (fieldValue) {
                                form_values.push(fieldValue);
                            });
                            if (window.chat_socket) {
                                var msg = { "message": form_values, "trigger": window.triggerMsg, "button": "OK" };
                                window.chat_socket.send(JSON.stringify(msg));
                            }

                            formContainer.classList.add("hide");
                            formContainer.innerHTML = "";
                        });

                        formContainer.appendChild(form);

                        typing_message.classList.add("hide");
                        formContainer.classList.remove("hide");
                        document.getElementById("sending_message_holder").classList.add("hide");
                        document.querySelector('.ask_button.restart').classList.remove("hide");
                        break;

                    case "UIquestion":
                        let discussion_guid = data[2];

                        chatbox.innerHTML += "<div class='message agent'>" + data[1].replace(/\n/g, "<br/>") + "</div>";
                        typing_message.classList.add("hide");
                        document.getElementById("sending_message_holder").classList.add("hide");
                        document.querySelector('.ask_button.restart').classList.remove("hide");

                        execEventBinded(window.chatId, "custom", {
                            trigger: window.triggerMsg,
                            discussion_guid: discussion_guid
                        });
                        break;

                    case "showurl":
                        let url = data[1];

                        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
                            let iframe = document.createElement('iframe');
                            iframe.src = url;
                            iframe.style.width = '100%';
                            iframe.style.height = '100%';
                            iframeContainer.appendChild(iframe);
                            iframeContainer.classList.remove('hide');
                        }

                        typing_message.classList.add('hide');
                        document.getElementById('ok_btn').classList.remove("hide");
                        document.getElementById('sending_message_holder').classList.add('hide');
                        document.querySelector('.ask_button.restart').classList.remove('hide');
                        break;

                    case "formDialog":
                        typing_message.classList.add('hide');
                        document.getElementById('sending_message_holder').classList.add('hide');
                        document.querySelector('.ask_button.restart').classList.remove('hide');

                        let xmlString = data[1];

                        var surveyContainer = chat.querySelector('#form_container');
                        surveyContainer.innerHTML = '';
                        surveyContainer.classList.remove('hide');

                        var surveyForm = document.createElement('form');
                        surveyForm.setAttribute('method', 'event');
                        surveyForm.setAttribute('name', 'form_wrapper');
                        surveyForm.classList.add('form_wrapper');

                        var surveyContent = document.createElement('div');
                        surveyContent.classList.add('survey_container');

                        surveyForm.appendChild(surveyContent);
                        surveyContainer.appendChild(surveyForm);

                        chat.appendChild(surveyContainer);

                        const xmlDocument = new DOMParser().parseFromString(xmlString, "text/xml");
                        const parserError = xmlDocument.getElementsByTagName('parseerror');
                        if (parserError.length > 0) {
                            const errorText = parserError[0].textContent.trim();
                            console.error("formDialog: error parsing XML: ");
                            console.error("Error details: ", errorText);
                        }

                        let formsurvey = new FormEngine({
                            formElement: surveyContent,
                            xmlData: xmlDocument,
                            lang: 'RU',
                            surveyTitle: 'MARCIAL',
                            isDollarFormat: true
                        });

                        function handleSurveyComplete(event) {
                            const surveyResult = event.detail;
                            if (window.chat_socket) {
                                var completeButton = document.createElement('button');
                                completeButton.textContent = 'Complete';
                                completeButton.className = 'access-btn'
                                completeButton.type = 'button';

                                function surveyCompleteClick() {
                                    var msg = { "message": surveyResult, "trigger": window.triggerMsg };
                                    window.logControl === 'debug' && console.log("formDialog: sending survey result: ", msg);

                                    window.chat_socket.send(JSON.stringify(msg));
                                    chat.querySelector('#form_container').removeChild(surveyForm);
                                    chat.querySelector('#form_container').classList.add('hide');
                                    document.getElementById('sending_message_holder').classList.remove('hide');
                                    document.querySelector('.ask_button.restart').classList.add('hide');
                                    document.removeEventListener('surveyComplete', handleSurveyComplete);
                                }

                                completeButton.addEventListener('click', surveyCompleteClick);
                                surveyContent.parentNode.insertBefore(completeButton, surveyContent.nextSibling);
                            }
                        }

                        document.addEventListener('surveyComplete', handleSurveyComplete);

                        break;

                    case "upload":
                        typing_message.classList.add('hide');
                        chatbox.innerHTML += "<div class='message agent'>" + data[1].replace(/\n/g, "<br/>") + "</div>";

                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                        const dialog = document.createElement('dialog');
                        dialog.id = 'upload_dialog';
                        dialog.className = 'upload-dialog';

                        if (isMobile) {
                            dialog.classList.add('mobile');
                            dialog.innerHTML = `
                                    <form class="upload-wrapper">
                                        <h3 class="upload-title">${translateWord("Upload image", lang)}</h3>    
                                        <label class="input-file">
                                            <input type="file" accept="image/*" id="fileInput" name="file">
                                            <span>${translateWord("Select photo", lang)}</span>
                                        </label>
                                    </form>
                                `;
                        } else {
                            dialog.innerHTML = `
                                    <form class="upload-wrapper">
                                        <h3 class="upload-title">${translateWord("Upload image", lang)}</h3>
                                        <div id="dropzone" class="upload-dropzone">
                                            <div class="drop-label">${translateWord("Drag a photo here<br/>Or", lang)}<br/></div>
                                            <label class="input-file">
                                                <input type="file" accept="image/*" id="fileInput" name="file">
                                                <span>${translateWord("Select photo", lang)}</span>
                                            </label>
                                        </div>
                                    </form>
                                `;

                            const dropzone = dialog.querySelector('#dropzone');

                            dropzone.addEventListener("dragover", function (event) {
                                event.preventDefault();
                                dropzone.classList.add("hover");
                            });

                            dropzone.addEventListener("dragleave", function (event) {
                                event.preventDefault();
                                dropzone.classList.remove("hover");
                            });

                            dropzone.addEventListener("drop", function (event) {
                                event.preventDefault();
                                dropzone.classList.remove("hover");
                                if (event.dataTransfer.files.length > 0) {
                                    handleFiles(event.dataTransfer.files);
                                }
                            })
                        }

                        const fileInput = dialog.querySelector('input[type="file');

                        fileInput.addEventListener('change', function (event) {
                            const file = event.target.files;

                            if (file.length > 0) {
                                handleFiles(file);
                            }
                        });

                        function handleFiles(file) {
                            const maxSize = 60 * 1024;
                            let imageSize = file[0].size;

                            if (imageSize > maxSize) {
                                const reader = new FileReader();
                                reader.onload = function (e) {
                                    const image = new Image();
                                    image.onload = function () {
                                        let base64Data;
                                        let width = image.width;
                                        let height = image.height;

                                        const createCompressedImage = () => {
                                            const canvas = document.createElement('canvas');
                                            const ctx = canvas.getContext('2d');

                                            const reductionFactor = 0.9;

                                            width = Math.round(width * reductionFactor);
                                            height = Math.round(height * reductionFactor);

                                            canvas.width = width;
                                            canvas.height = height;
                                            ctx.imageSmoothingQuality = 'medium';
                                            ctx.drawImage(image, 0, 0, width, height);

                                            base64Data = canvas.toDataURL("image/jpeg", 0.8);
                                            imageSize = base64Data.length;
                                        };

                                        createCompressedImage();

                                        while (imageSize > maxSize) {
                                            createCompressedImage();
                                        }

                                        if (window.chat_socket) {
                                            var msg = { "message": base64Data, "trigger": window.triggerMsg };
                                            window.chat_socket.send(JSON.stringify(msg));

                                            typing_message.classList.remove('hide');
                                        }
                                        dialog.close();
                                        dialog.remove();
                                    };

                                    image.src = e.target.result;
                                };

                                reader.readAsDataURL(file[0]);

                            } else {
                                const reader = new FileReader();
                                reader.onload = function (e) {
                                    const base64Data = e.target.result;

                                    if (window.chat_socket) {
                                        var msg = { "message": base64Data, "trigger": window.triggerMsg };
                                        window.chat_socket.send(JSON.stringify(msg));

                                        typing_message.classList.remove('hide');
                                    }
                                    dialog.close();
                                    dialog.remove();
                                };

                                reader.readAsDataURL(file[0]);
                            }
                        }
                        chatbox.appendChild(dialog);

                        const dialogStyles = document.createElement('style');
                        dialogStyles.innerHTML = `
                            .upload-dialog {
                                position: fixed;
                                height: 200px;
                                border: 1px solid #ccc;
                                border-radius: 10px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                background-color: #fff;
                                z-index: 1000;
                                padding: 0 30px 20px;
                                overflow: hidden;
                                box-sizing: content-box;
                                margin: auto;
                            
                                &.mobile {
                                height: 150px;
                                }
                            
                                &:focus {
                                outline: none;
                                }
                            
                                .upload-wrapper {
                                    position: relative;
                                    height: 100%;
                                    width: 100%;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                    align-items: center;
                                    margin: 0;
                            
                                    .upload-title {
                                        position: relative;
                                        font-size: 18px;
                                        font-weight: bold;
                                        margin: 18px 0;
                                    }
                            
                                    .input-file {
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        background-color: #4CAF50;
                                        border-radius: 5px;
                                        padding: 10px 20px;
                                        cursor: pointer;
                                
                                        &:hover {
                                        background-color: #3e8e41;
                                        }
                                
                                        span {
                                        font-size: 16px;
                                        color: #fff;
                                        }
                                
                                        input[type="file"] {
                                        width: 0px;
                                        height: 0px;
                                        }
                                    }
                            
                                    .upload-dropzone {
                                        border: 2px dashed #ccc;
                                        padding: 20px;
                                        text-align: center;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: space-between;
                                        align-items: center;
                                        height: 120px;
                                        box-sizing: content-box;

                                        .drop-label {
                                            margin-bottom: 15px;
                                        }
                                    }
                                }
                            }`;

                        chatbox.appendChild(dialogStyles);

                        dialog.showModal();

                        break;

                }
            } else if (data[0] == "display") {
                let VDOMXML = data[1];
                let E2VDOM = data[2];
                let discussion_guid = data[3];

                execEventBinded(window.chatId, "custom", {
                    trigger: data[0],
                    vdomxml: VDOMXML,
                    e2vdom: E2VDOM,
                    discussion_guid: discussion_guid
                });
            } else {
                let discussion_guid = data[1];

                execEventBinded(window.chatId, "custom", {
                    trigger: data[0],
                    discussion_guid: discussion_guid
                });
            }

        } else if (data[0] === "error") {
            window.logControl !== null && console.log("New chat command received: ", data[0]);
            ["ok_btn", "cancel_btn", "yes_btn", "no_btn", "typing_message"]
                .forEach(btnId => {
                    document.getElementById(btnId).classList.add("hide");
                });

            document.querySelector('.ask_button.restart').classList.remove("hide");
            document.getElementById("sending_message_holder").classList.add("hide");
            // document.querySelector('.sending_message input#message').disabled = true;
            document.querySelector('.sending_message textarea#message').disabled = true;
            document.querySelector('.sending_message .send_btn').disabled = true;

            chatbox.innerHTML += "<div class='message agent'>" + data[1].replace(/\n/g, "<br/>") + "</div>";
        } else {
            if (data[1] === 0) {
                let user_message = data[0];

                if (user_message.startsWith("data:image")) {
                    let userMessageWrapper = document.createElement("div");
                    userMessageWrapper.className = "message user";
                    let img = document.createElement("img");
                    img.src = user_message;
                    img.style = 'max-height: 150px; min-height: 50px;'
                    userMessageWrapper.appendChild(img);
                    chatbox.appendChild(userMessageWrapper);

                } else {
                    user_message = user_message.replace(/\n/g, "<br/>");
                    user_message = translateWord(user_message, lang);

                    if (user_message[0] === "[" || user_message[0] === "{") {
                        let userMessageWrapper = document.createElement("div");
                        userMessageWrapper.className = "message user";
                        let spoiler = document.createElement("div");
                        spoiler.className = "spoiler";
                        spoiler.textContent = translateWord("Form data transmitted", lang) + " (+)";
                        spoiler.setAttribute("onclick", "toggleSpoiler(this)");
                        let userMessage = document.createElement("div");
                        userMessage.className = "message_text hide";
                        userMessage.textContent = user_message;

                        userMessageWrapper.appendChild(spoiler);
                        userMessageWrapper.appendChild(userMessage);
                        chatbox.appendChild(userMessageWrapper);

                    } else {
                        chatbox.innerHTML += "<div class='message user'>" + user_message + "</div>";
                    }
                }

                typing_message.classList.remove("hide");

            } else if (data[0] === 'pong' && data[1] === 2) {
                //window.logControl === 'debug' && console.log("New chat command received: ", data[0]);
                window.pongReceived = true;

            } else if (data[1] === 1) {
                chatbox.innerHTML += "<div class='message agent'>" + data[0].replace(/\n/g, "<br/>") + "</div>";
                typing_message.classList.add("hide");

            } else if (data[1] === -1) {
                typing_message.classList.add("hide");
                document.querySelector('.ask_button.restart').classList.add("hide");
                document.getElementById("sending_message_holder").classList.remove("hide");
                const messageInput = document.querySelector('.sending_message textarea#message');
                const sendButton = document.querySelector('.sending_message .send_btn');

                messageInput.disabled = true;
                sendButton.disabled = true;
            }
        };

        chatbox.scrollTop = chatbox.scrollHeight;
    };

    window.chat_socket.onclose = function (event) {
        window.logControl !== null && console.log('SOCKET has been closed, code: ', event.code);
        if (event.code !== 1000) {
            if (!window.reconnectTimeout) {
                window.reconnectTimeout = setTimeout(() => {
                    attach(currentWS, currentUrl, currentGuid, currentEmail, currentVariables, currentProject, currentDiscussion, currentCallBack);
                    window.reconnectTimeout = null;
                }, 5000);
            }
        }
    };

    window.currentWS = ws_server;
    window.currentUrl = url;
    window.currentGuid = guid;
    window.currentEmail = email;
    window.currentVariables = variables;
    window.currentProject = project_guid;
    window.currentDiscussion = discussion_id;
    window.createNewDiscussion = create_new_discussion;
    window.currentCallBack = processDiscussion;

    document.getElementById("message").addEventListener("keydown", function (event) {
        if (event.key === "Enter" && document.getElementById("message").value !== "") {
            event.preventDefault();
            sendMessage();
        }
    });

    function startPingPong() {
        const pingInterval = 10000;
        const pingMessage = JSON.stringify({ "trigger": 'ping' });

        const pingTimer = setInterval(() => {
            if (window.chat_socket.readyState === WebSocket.OPEN) {
                window.chat_socket.send(pingMessage);

                window.pongReceived = false;
                setTimeout(() => {
                    if (!window.pongReceived) {
                        window.chat_socket.close();
                        attach(currentWS, currentUrl, currentGuid, currentEmail, currentVariables, currentProject, currentDiscussion, currentCallBack);
                    }
                }, 5000);
            }
        }, pingInterval);

        return pingTimer;
    }
}

function sendMessage() {
    const message = document.getElementById("message").value;

    if (window.chat_socket && message) {
        let msg = { "message": message, "trigger": window.triggerMsg };
        window.chat_socket.send(JSON.stringify(msg));
        document.getElementById("message").value = "";
        document.getElementById("typing_message").classList.remove("hide");
    }
}

function clickOKButton() {
    if (window.chat_socket) {
        let msg = { "message": "OK", "trigger": window.triggerMsg };
        window.chat_socket.send(JSON.stringify(msg));
        document.getElementById("ok_btn").classList.add("hide");
        document.getElementById("cancel_btn").classList.add("hide");
        document.getElementById("typing_message").classList.remove("hide");
        const iframeContainer = document.getElementById("iframe_container");
        iframeContainer.classList.add('hide');
        iframeContainer.innerHTML = ""
    }
}

function clickCancelButton() {
    if (window.chat_socket) {
        let msg = { "message": "CANCEL", "trigger": window.triggerMsg };
        window.chat_socket.send(JSON.stringify(msg));
        document.getElementById("cancel_btn").classList.add("hide");
        document.getElementById("ok_btn").classList.add("hide");
        document.getElementById("typing_message").classList.remove("hide");
    }
}

function clickYesButton() {
    if (window.chat_socket) {
        let msg = { "message": "YES", "trigger": window.triggerMsg };
        window.chat_socket.send(JSON.stringify(msg));
        document.getElementById("no_btn").classList.add("hide");
        document.getElementById("yes_btn").classList.add("hide");
        document.getElementById("typing_message").classList.remove("hide");
    }
}

function clickNoButton() {
    if (window.chat_socket) {
        let msg = { "message": "NO", "trigger": window.triggerMsg };
        window.chat_socket.send(JSON.stringify(msg));
        document.getElementById("no_btn").classList.add("hide");
        document.getElementById("yes_btn").classList.add("hide");
        document.getElementById("typing_message").classList.remove("hide");
    }
}

function showRestartDialog() {
    document.getElementById("dialog_restart_chat").classList.remove("hide");
}

function clickRestartButton() {
    if (window.chat_socket) {
        const chatbox = document.getElementById('chatbox');
        chatbox.innerHTML = '';
        ["ok_btn", "cancel_btn", "yes_btn", "no_btn", "typing_message"]
            .forEach(btnId => {
                document.getElementById(btnId).classList.add("hide");
            });

        document.getElementById("sending_message_holder").classList.remove("hide");
        document.querySelector('.ask_button.restart').classList.add("hide");
        // document.querySelector('.sending_message input#message').disabled = true;
        document.querySelector('.sending_message textarea#message').disabled = true;
        document.querySelector('.sending_message .send_btn').disabled = true;
        const iframeContainer = document.getElementById("iframe_container");
        iframeContainer.classList.add('hide');
        iframeContainer.innerHTML = ""

        let msg = { "message": "restart", "trigger": "restart" };
        window.chat_socket.send(JSON.stringify(msg));

        hideRestartChatDialog();
    }
}

function hideRestartChatDialog() {
    document.getElementById("dialog_restart_chat").classList.add("hide");
}

function toggleSpoiler(spoiler) {
    let nextElement = spoiler.nextElementSibling;
    nextElement.classList.toggle("hide");
}

function createFormField(fieldData) {
    var fieldWrapper;
    var label = document.createElement("label");
    label.setAttribute("class", "group_label");
    label.textContent = fieldData[1];

    if (fieldData[0] === "radioButtons") {
        fieldWrapper = document.createElement("div");
        fieldWrapper.setAttribute("class", "form_group form_radio");
        fieldWrapper.appendChild(label);

        fieldData[2].forEach(function (value) {
            var radioWrapper = document.createElement("div");
            radioWrapper.setAttribute("class", "radiobutton");

            var radioInput = document.createElement("input");
            radioInput.setAttribute("type", value.type);
            radioInput.setAttribute("value", value.value);
            radioInput.setAttribute("name", value.name);
            radioInput.setAttribute("id", value.id);
            if (value.selected) {
                radioInput.setAttribute("checked", "checked");
            }

            var radioLabel = document.createElement("label");
            radioLabel.setAttribute("for", value.id);
            radioLabel.textContent = "  " + value.label;

            radioWrapper.appendChild(radioInput);
            radioWrapper.appendChild(radioLabel);
            fieldWrapper.appendChild(radioWrapper);
        });
    } else {
        fieldWrapper = document.createElement("div");
        fieldWrapper.setAttribute("class", "form_group form_input");


        var input;
        if (fieldData[0] === "textArea") {
            input = document.createElement("textarea");
            input.setAttribute("rows", "10");
            input.setAttribute("cols", "30");
        } else {
            input = document.createElement("input");
            input.setAttribute("type", fieldData[0]);
        }

        input.setAttribute("type", fieldData[0]);
        input.setAttribute("value", fieldData[2]);
        input.setAttribute("name", fieldData[3]);

        fieldWrapper.appendChild(label);
        fieldWrapper.appendChild(input);
    }

    return fieldWrapper;
}

function isAlreadyEncoded(str) {
    try {
        const decoded = decodeURIComponent(str);
        return decoded !== str;
    } catch (e) {
        return false;
    }
}

function start(ws_server, url, guid, email, variables, project_guid = '', discussion_id = '', callback = null) {
    const new_discussion = 1;
    initializeChat(ws_server, url, guid, email, variables, project_guid, discussion_id, new_discussion, callback);
}

function attach(ws_server, url, guid, email, variables, project_guid = '', discussion_id = '', callback = null) {
    const new_discussion = 0;
    initializeChat(ws_server, url, guid, email, variables, project_guid, discussion_id, new_discussion, callback);
}

function goBack() {
    window.history.back();
}
document.addEventListener("DOMContentLoaded", function() {
    var input = document.querySelector('.form_group.form_input input[type="textarea"]');
    if (input) {
        input.value = "";
    }
});

function api_callback(discussion_guid) {
    const currentDiscussionId = localStorage.getItem("current_discussion_id");
    if(currentDiscussionId === 'null' || currentDiscussionId === null)
    {
        console.log({discussion_guid})
        // addDiscussion(discussion_guid);
        localStorage.setItem("current_discussion_id",discussion_guid);
    }
}
// ED216D6F-0106-8836-2468-351DF4E36926