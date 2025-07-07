async function testOpenAIConnection(apiKey, modelName) {
  try {
    const data = await $.ajax({
      url: "https://api.openai.com/v1/models",
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    const validModels = data.data.map((model) => model.id);
    return validModels.includes(modelName);
  } catch (error) {
    console.error("OpenAI connection test failed:", error);
    return false;
  }
}

async function testOpenRouterConnection(apiKey, modelName) {
  try {
    await $.ajax({
      url: "https://openrouter.ai/api/v1/auth/key",
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const modelsData = await $.ajax({
      url: "https://openrouter.ai/api/v1/models",
      method: "GET",
    });

    // 提取并排序模型ID数组
    const modelIds = modelsData.data.map((model) => model.id).sort();

    // 二分查找实现
    let left = 0;
    let right = modelIds.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = modelName.localeCompare(modelIds[mid]);

      if (comparison === 0) {
        return true; // 找到匹配项
      } else if (comparison < 0) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return false;
  } catch (error) {
    console.error("OpenRouter connection test failed:", error);
    return false;
  }
}

async function testDeepSeekConnection(apiKey, modelName) {
  try {
    const data = await $.ajax({
      url: "https://api.deepseek.com/v1/models",
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const validModels = data.data.map((model) => model.id);
    return validModels.includes(modelName);
  } catch (error) {
    console.error("DeepSeek connection test failed:", error);
    return false;
  }
}

async function testJudge0Connection(apiKey, languageId) {
  try {
    const response = await $.ajax({
      url: 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=stdout',
      method: 'POST',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      processData: false,
      data: JSON.stringify({
        language_id: languageId,
        source_code: "I2luY2x1ZGUgPHN0ZGlvLmg+CgppbnQgbWFpbih2b2lkKSB7CiAgY2hhciBuYW1lWzEwXTsKICBzY2FuZigiJXMiLCBuYW1lKTsKICBwcmludGYoImhlbGxvLCAlc1xuIiwgbmFtZSk7CiAgcmV0dXJuIDA7Cn0=",
        stdin: "SnVkZ2Uw"
      })
    });

    if (response.stdout === "aGVsbG8sIEp1ZGdlMAo=") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Judge0 Auth test failed:", error);
    return false;
  }
}
