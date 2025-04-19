async function getDataWithOpenRouter(prompt) {
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;

  const provider = storage.getItem("provider");
  const model = storage.getItem("model");
  const customModel = storage.getItem("customModelName");
  const apiKey = storage.getItem("apiKey");

  if (provider !== "openrouter" || !model || !apiKey) {
    // console.error("❌ OpenRouter 配置不完整，请检查 provider/model/apiKey");
    OpenrouterSettingFailed();
    return null;
  }

  const finalModel = model === "自定义模型" ? customModel : model;
  if (!finalModel) {
    // console.error("❌ 自定义模型未设置");
    OpenrouterSettingFailed();
    return null;
  }

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const messages = prompt;

  const body = {
    model: finalModel,
    messages,
    temperature: 0.3,
    stream: false,
  };

  // console.log(`🚀 向 OpenRouter 发起请求：${finalModel}`, body);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      RequestError(res.status);
      throw new Error(`请求失败：${res.status}`);
    }

    const data = await res.json();

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      // console.warn("⚠️ AI 没有返回有效回复内容");
      // console.warn("原始响应：", data);
      RequestError("失败！");
      return null;
    }

    // console.log("✅ AI 回复：", reply);
    RequestSuccess();
    return reply.trim();
  } catch (err) {
    // console.error("❌ OpenRouter 请求异常：", err);
    RequestError(err.message);
    return null;
  }
}

function RequestError(message) {
  $.notify(
    {
      icon: "mdi mdi-close",
      title: "TP获取失败",
      message: "请求错误：" + message,
    },
    {
      type: "danger",
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
      onClosed: null,
      mouse_over: null,
    }
  );
}

function OpenrouterSettingFailed() {
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
      onClosed: () => {
        window.open("./setting.html", "_blank");
      },
      mouse_over: null,
    }
  );
}

function RequestSuccess() {
  $.notify(
    {
      icon: "mdi mdi-check-circle-outline",
      title: "TP获取成功",
      message: "Test Point获取成功！请尽快下载数据。",
    },
    {
      type: "success",
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
      onClosed: null,
      mouse_over: null,
    }
  );
}
