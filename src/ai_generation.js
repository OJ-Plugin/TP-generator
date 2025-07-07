async function getDataWithOpenRouter(prompt) {
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;

  const provider = storage.getItem("provider");
  const model = storage.getItem("model");
  const customModel = storage.getItem("customModelName");
  const apiKey = storage.getItem("apiKey");

  if (provider !== "openrouter" || !model || !apiKey) {
    // console.error("❌ OpenRouter 配置不完整，请检查 provider/model/apiKey");
    ModelSettingFailed();
    return null;
  }

  const finalModel = model === "自定义模型" ? customModel : model;
  if (!finalModel) {
    // console.error("❌ 自定义模型未设置");
    ModelSettingFailed();
    return null;
  }

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const body = {
    model: finalModel,
    messages: prompt,
    temperature: 0.3,
    stream: false,
  };

  console.log(`🚀 向 OpenRouter 发起请求：${finalModel}`, body);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  console.log("res:", res);

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  // console.log("data:", data);

  const reply = data.choices?.[0]?.message?.content;
  // console.log("reply:", reply);
  if (!reply) {
    // console.warn("⚠️ AI 没有返回有效回复内容");
    // console.warn("原始响应：", data);
    return null;
  }

  // console.log("✅ AI 回复：", reply);
  return reply.trim();
}

function ModelSettingFailed() {
  $.notify(
    {
      icon: "mdi mdi-alert",
      title: "AI模型配置错误",
      message: "OpenRouter 配置不完整，请检查 provider/model/apiKey",
    },
    {
      type: "warning",
      allow_dismiss: true,
      newest_on_top: false,
      placement: {
        from: "top",
        align: "right",
      },
      offset: {
        x: 20,
        y: 20,
      },
      spacing: 10,
      z_index: 1031,
      delay: 5000,
      animate: {
        enter: "animate__animated animate__fadeInDown",
        exit: "animate__animated animate__fadeOutUp",
      },
      mouse_over: null,
    }
  );
}
