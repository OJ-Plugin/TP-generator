async function get_output(sourceCode, inputArr) {
    console.log("sourceCode:  ", sourceCode)
    console.log("inputArr:  ", inputArr)

    const temp_state = localStorage.getItem("temp_state") === "true";
    const storage = temp_state ? sessionStorage : localStorage;
    const apiKey = storage.getItem("judge0");
    const judge0LanguageId = storage.getItem("judge0_lan");

    let results = [];
    for (let i = 0; i < inputArr.length; i++) {
        const input = inputArr[i];
        const settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
            "method": "POST",
            "headers": {
                "x-rapidapi-key": apiKey,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "language_id": Number(judge0LanguageId),
                "source_code": sourceCode,
                "stdin": input
            })
        };
        const res = await $.ajax(settings);
        results.push(res.stdout || encode64(res.stderr) || encode64((res.status && res.status.description)) || "");
    }
    console.log("Get Output Results:", results);
    return results
}