window.onload = function () {
  var temp_state = window.localStorage.getItem("temp_state");
  if (temp_state == "true") {
    document.getElementById("temp_state").checked = true;
  } else {
    document.getElementById("temp_state").checked = false;
  }
};

function save_temp() {
  const state = document.getElementById("temp_state").checked;
  window.localStorage.setItem("temp_state", state);
  $.notify(
    {
      icon: "mdi mdi-check-circle-outline",
      title: "系统设置保存成功",
      message: "已保存临时使用设置！",
      url: "",
      target: "",
    },
    {
      type: "success",
      allow_dismiss: true,
      newest_on_top: true,
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
    }
  );
}

const provider = ["", "openai", "openrouter", "deepseek"];

const model_list = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.5-preview", "gpt-4o-mini-2024-07-18", "gpt-4o-2024-11-20", "gpt-4o-2024-08-06", "gpt-4o-2024-05-13", "gpt-4.5-preview-2025-02-27", "gpt-3.5-turbo-16k", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-0125"],
  openrouter: [
    "google/gemini-2.0-flash-thinking-exp:free",
    "google/gemini-2.0-flash-thinking-exp-1219:free",
    "moonshotai/moonlight-16b-a3b-instruct:free",
    "nvidia/llama-3.1-nemotron-70b-instruct:free",
    "nousresearch/deephermes-3-llama-3-8b-preview:free",
    "google/gemini-2.0-flash-exp:free",
    "microsoft/phi-3-medium-128k-instruct:free",
    "google/learnlm-1.5-pro-experimental:free",
    "google/gemini-2.5-pro-exp-03-25:free",
    "google/gemini-2.0-pro-exp-02-05:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "deepseek/deepseek-r1-distill-llama-70b:free",
    "qwen/qwen2.5-vl-32b-instruct:free",
    "qwen/qwen2.5-vl-72b-instruct:free",
    "deepseek/deepseek-r1-distill-qwen-32b:free",
    "deepseek/deepseek-r1-distill-qwen-14b:free",
    "qwen/qwen2.5-vl-3b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen-2.5-vl-7b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "meta-llama/llama-3.2-1b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "deepseek/deepseek-v3-base:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "deepseek/deepseek-r1-zero:free",
    "qwen/qwen-2.5-coder-32b-instruct:free",
    "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
    "mistralai/mistral-small-24b-instruct-2501:free",
    "bytedance-research/ui-tars-72b:free",
    "huggingfaceh4/zephyr-7b-beta:free",
    "cognitivecomputations/dolphin3.0-mistral-24b:free",
    "deepseek/deepseek-chat:free",
    "qwen/qwq-32b-preview:free",
    "mistralai/mistral-nemo:free",
    "sophosympatheia/rogue-rose-103b-v0.2:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "allenai/molmo-7b-d:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-27b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "google/gemma-3-1b-it:free",
    "google/gemma-3-4b-it:free",
    "google/gemma-2-9b-it:free",
    "open-r1/olympiccoder-32b:free",
    "open-r1/olympiccoder-7b:free",
    "openchat/openchat-7b:free",
    "rekaai/reka-flash-3:free",
    "qwen/qwq-32b:free",
    "deepseek/deepseek-r1:free",
    "featherless/qwerky-72b:free",
    "undi95/toppy-m-7b:free",
    "自定义模型",
  ],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
};

document.getElementById("model_provider").addEventListener("change", function () {
  const provider_ = provider[this.value];
  const modelList = model_list[provider_];
  const modelList_show = document.getElementById("model_list");
  modelList_show.innerHTML = "";
  modelList.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.text = model;
    modelList_show.appendChild(option);
  });
  if (provider_ != "openrouter") {
    document.getElementById("custom_model").style.display = "none";
    document.getElementById("custom_model_").style.display = "none";
  }
  for (let index = 1; index <= 3; index++) {
    const model_setting_bar = document.getElementById("model_setting_" + index);
    if (index != this.value) {
      model_setting_bar.style.display = "none";
    } else {
      model_setting_bar.style.display = "block";
    }
  }
});

document.getElementById("model_list").addEventListener("change", function () {
  const model = this.value;
  const model_provider = provider[document.getElementById("model_provider").value];
  if (model_provider === "openrouter" && model === "自定义模型") {
    document.getElementById("custom_model").style.display = "block";
    document.getElementById("custom_model_").style.display = "block";
  } else {
    document.getElementById("custom_model").style.display = "none";
    document.getElementById("custom_model_").style.display = "none";
  }
});

function save_setting() {
  // TODO:使用localstorage持久化储存用户模型配置【需注意temp模型下使用cookie】
  const provider_ = provider[document.getElementById("model_provider").value];
  var model = document.getElementById("model_list").value;
  if (model === "自定义模型") {
    model = document.getElementById("custom_model_").value;
  }
}

document.getElementById("btn_test_conn").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });
  try {
    let isConnected = await test_connection();
    console.log(isConnected);
    if (isConnected) {
      notify_success();
    } else {
      notify_failed();
    }
  } catch (error) {
    console.error("Connection test failed:", error);
    notify_failed();
  } finally {
    l.destroy();
  }
});

async function test_connection() {
  const provider_ = document.getElementById("model_provider").value;
  if (!provider_ || provider_ === "0") {
    notify_invalid_setting();
    return false;
  }

  try {
    const apiKey = document.getElementById(`${provider[provider_]}_key_`).value;
    var modelName = document.getElementById("model_list").value;
    if (modelName === "自定义模型") {
      modelName = document.getElementById("custom_model").value;
      if (!custom_model) {
        notify_invalid_setting();
        return false;
      }
    }

    if (!apiKey) {
      notify_invalid_setting();
      return false;
    }

    console.log("开始测试连接，提供商:", provider_, "模型:", modelName); // 调试用

    let isConnected = false;
    switch (provider_) {
      case "1":
        isConnected = await testOpenAIConnection(apiKey, modelName);
        break;
      case "2":
        isConnected = await testOpenRouterConnection(apiKey, modelName);
        break;
      case "3":
        isConnected = await testDeepSeekConnection(apiKey, modelName);
        break;
    }

    console.log("连接测试结果:", isConnected); // 调试用
    return isConnected;
  } catch (error) {
    console.error("测试连接失败:", error);
    notify_failed();
    return false;
  }
}

function notify_invalid_setting() {
  $.notify(
    {
      icon: "mdi mdi-close",
      title: "模型配置错误",
      message: "请完整填写AI模型配置！",
      url: "",
      target: "",
    },
    {
      type: "danger",
      allow_dismiss: true,
      newest_on_top: true,
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
    }
  );
}

function notify_success() {
  $.notify(
    {
      icon: "mdi mdi-check-circle-outline",
      title: "模型连接测试",
      message: "恭喜您！测试连接成功！",
      url: "",
      target: "",
    },
    {
      type: "success",
      allow_dismiss: true,
      newest_on_top: true,
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
    }
  );
}

function notify_failed() {
  $.notify(
    {
      icon: "mdi mdi-close",
      title: "模型连接测试",
      message: "非常抱歉！测试连接失败！",
      url: "",
      target: "",
    },
    {
      type: "danger",
      allow_dismiss: true,
      newest_on_top: true,
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
    }
  );
}
