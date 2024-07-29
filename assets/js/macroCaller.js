

function callMacroAsync(plugin_guid, event_name, data, user_access_token = "") {
    let url = `/restapi.py?action_name=call_macro`;
    let api_data = {
        "plugin_guid": plugin_guid,
        "name": event_name,
        "async": false,
        "data": JSON.stringify(data)
    };
    if (user_access_token) {
        api_data["access_token"] = user_access_token;
    };
    return fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(api_data),
    });
}

async function callMacro(event_macro_name, data, action) {
    const params = { action, data };
    try {
        const response = await callMacroAsync("a12f9ed8-fc27-47dc-b56a-488d5a5b5e4b", event_macro_name, params, localStorage.getItem('userAccessToken'));

        // console.log(response)

        if (!response.ok)
            throw new Error("There was an error in call macro for " + event_macro_name + "with data: " + data + " and action: " + action + " on the network side.");

        const responseJson = await response.json();

        if (responseJson[0] === "error") {
            throw new Error("There was an error in call macro for " + event_macro_name + "with data: " + data + " and action: " + action + " on the server side.");
        } else {
            return responseJson;
        }
        // console.log("Final response: " + responseJson);
    } catch (error) {
        // errorController.sendError(error.stack);
        return undefined;
    }
}

async function callMacroAllPlugin(event_macro_name, data, action, guid) {
    const params = { action, data };
    try {
        const response = await callMacroAsync(guid, event_macro_name, params, localStorage.getItem('userAccessToken'));

        // console.log(response)

        if (!response.ok)
            throw new Error("There was an error in call macro for " + event_macro_name + "with data: " + data + " and action: " + action + " on the network side.");

        const responseJson = await response.json();

        if (responseJson[0] === "error") {
            throw new Error("There was an error in call macro for " + event_macro_name + "with data: " + data + " and action: " + action + " on the server side.");
        } else {
            return responseJson;
        }
        // console.log("Final response: " + responseJson);
    } catch (error) {
        // errorController.sendError(error.stack);
        return undefined;
    }
}