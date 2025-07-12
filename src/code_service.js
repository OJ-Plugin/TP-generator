function getOutput(sourceCode, inputArr) {
    console.log("sourceCode:  ", sourceCode)
    console.log("inputArr:  ", inputArr)

    let results = [];

    for (let i = 0; i < inputArr.length; i++) {
        const inputContent = inputArr[i];

        const settings = {
            "async": false,
            "crossDomain": true,
            "url": "https://judge0-ce.p.sulu.sh/submissions?base64_encoded=true&wait=true",
            "method": "POST",
            "headers": {
                "Accept": "*/*",
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "source_code": encode64(sourceCode),
                "language_id": 105, // C++ language ID
                "stdin": encode64(inputContent),
                "redirect_stderr_to_stdout": true
            })
        };

        const res = $.ajax(settings).responseJSON;
        results.push(res.stdout == "" ? res.compile_output : res.stdout);
    }
    return results
}