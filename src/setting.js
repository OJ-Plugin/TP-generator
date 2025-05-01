window.onload = function () {
  var temp_state = window.localStorage.getItem("temp_state");
  if (temp_state == "true") {
    document.getElementById("temp_state").checked = true;
  } else {
    document.getElementById("temp_state").checked = false;
  }
  load_temp();
};

function load_temp() {
  const temp_state = window.localStorage.getItem("temp_state") === "true";
  const provider_ = temp_state ? window.sessionStorage.getItem("provider") : window.localStorage.getItem("provider");
  const model = temp_state ? window.sessionStorage.getItem("model") : window.localStorage.getItem("model");
  const apiKey = temp_state ? window.sessionStorage.getItem("apiKey") : window.localStorage.getItem("apiKey");
  const customModelName = temp_state ? window.sessionStorage.getItem("customModelName") : window.localStorage.getItem("customModelName");
  const judge0_key = temp_state ? window.sessionStorage.getItem("judge0") : window.localStorage.getItem("judge0");

  document.getElementById("judge0_api_key").value = judge0_key;

  if (!provider_ || !model || !apiKey) return;

  // 设置provider下拉菜单
  const providerIndex = provider.indexOf(provider_);
  if (providerIndex > 0) {
    document.getElementById("model_provider").value = providerIndex;
    // 触发change事件以更新模型列表
    document.getElementById("model_provider").dispatchEvent(new Event("change"));

    // 设置model下拉菜单
    setTimeout(() => {
      const modelSelect = document.getElementById("model_list");
      const modelOptions = modelSelect.options;
      let foundModel = false;

      for (let i = 0; i < modelOptions.length; i++) {
        if (modelOptions[i].value === model) {
          modelSelect.value = model;
          foundModel = true;
          break;
        }
      }

      // 处理openrouter自定义模型
      if (provider_ === "openrouter" && foundModel && model === "自定义模型") {
        document.getElementById("custom_model").style.display = "block";
        document.getElementById("custom_model_").style.display = "block";
        document.getElementById("custom_model").value = customModelName;
      }

      // 触发change事件
      modelSelect.dispatchEvent(new Event("change"));
    }, 0);

    // 填充API key
    document.getElementById(`${provider_}_key_`).value = apiKey;
  }
}

function save_temp() {
  const currentState = window.localStorage.getItem("temp_state") === "true";
  const newState = document.getElementById("temp_state").checked;
  window.localStorage.setItem("temp_state", newState);

  // temp模式状态改变时，自动对localstorage以及cookie内的模型配置信息进行转存
  if (currentState !== newState) {
    if (newState) {
      // 切换到temp模式，从localStorage转存到cookie
      const provider_ = window.localStorage.getItem("provider");
      const model = window.localStorage.getItem("model");
      const apiKey = window.localStorage.getItem("apiKey");
      const customModelName = window.localStorage.getItem("customModelName");
      const judge0 = window.localStorage.getItem("judge0");
      if (provider_ && model && apiKey) {
        // temp模式下使用sessionStorage，浏览器关闭时自动清除
        window.sessionStorage.setItem("provider", provider_);
        window.sessionStorage.setItem("model", model);
        window.sessionStorage.setItem("apiKey", apiKey);
        window.sessionStorage.setItem("customModelName", customModelName);
        // 删除原localStorage数据
        window.localStorage.removeItem("provider");
        window.localStorage.removeItem("model");
        window.localStorage.removeItem("apiKey");
        window.localStorage.removeItem("customModelName");
      }
      window.sessionStorage.setItem("judge0", judge0);
      window.localStorage.removeItem("judge0");
    } else {
      // 切换到非temp模式，从cookie转存到localStorage
      const provider_ = window.sessionStorage.getItem("provider");
      const model = window.sessionStorage.getItem("model");
      const apiKey = window.sessionStorage.getItem("apiKey");
      const customModelName = window.sessionStorage.getItem("customModelName");
      const judge0 = window.sessionStorage.getItem("judge0");
      if (provider_ && model && apiKey) {
        window.localStorage.setItem("provider", provider_);
        window.localStorage.setItem("model", model);
        window.localStorage.setItem("apiKey", apiKey);
        window.localStorage.setItem("customModelName", customModelName);
        // 删除原sessionStorage数据
        window.sessionStorage.removeItem("provider");
        window.sessionStorage.removeItem("model");
        window.sessionStorage.removeItem("apiKey");
        window.sessionStorage.removeItem("customModelName");
      }
      window.localStorage.setItem("judge0", judge0);
      window.sessionStorage.removeItem("judge0");
    }
  }
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
      onClosed: document.location.reload(),
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

document.getElementById("save_setting_btn").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });
  // 首先进行测试连接验证，验证失败的不能进行保存，验证成功才可以继续进行保存
  const isConnected = await test_connection();
  if (!isConnected) {
    notify_failed();
    l.destroy();
    return;
  }
  // 使用localstorage持久化储存用户模型配置【需注意temp模型下使用cookie】
  const provider_ = provider[document.getElementById("model_provider").value];
  var model = document.getElementById("model_list").value;
  let customModelName = "";
  if (model === "自定义模型") {
    customModelName = document.getElementById("custom_model").value; // 存储"自定义模型"这个名称
  }
  const apiKey = document.getElementById(`${provider_}_key_`).value;
  const temp_state = window.localStorage.getItem("temp_state");
  if (temp_state === "true") {
    // 临时使用，使用sessionStorage
    window.sessionStorage.setItem("provider", provider_);
    window.sessionStorage.setItem("model", model);
    window.sessionStorage.setItem("apiKey", apiKey);
    if (provider_ === "openrouter" && model === "自定义模型") {
      window.sessionStorage.setItem("customModelName", customModelName);
    }
  } else {
    // 持久化储存，使用localstorage
    window.localStorage.setItem("provider", provider_);
    window.localStorage.setItem("model", model);
    window.localStorage.setItem("apiKey", apiKey);
    if (provider_ === "openrouter" && model === "自定义模型") {
      window.localStorage.setItem("customModelName", customModelName);
    }
  }
  $.notify(
    {
      icon: "mdi mdi-check-circle-outline",
      title: "模型配置保存成功",
      message: "已保存模型配置！",
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
      onClosed: l.destroy(),
    }
  );
});

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

document.getElementById("save_setting_judge0").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });
  // 首先进行测试连接验证，验证失败的不能进行保存，验证成功才可以继续进行保存
  const apiKey = document.getElementById("judge0_api_key").value;
  if (apiKey === "") {
    var temp_state = window.localStorage.getItem("temp_state");
    if (temp_state === "true") {
      window.sessionStorage.setItem("judge0", "");
    } else {
      window.localStorage.setItem("judge0", apiKey);
    }
    notify_judge0_clear();
  } else {
    let isConnected = false;
    isConnected = await test_judge0_conn(apiKey);
    if (!isConnected) {
      notify_invalid_setting_judge0();
      l.destroy();
      return;
    }
    // 使用localstorage持久化储存用户模型配置【需注意temp模型下使用cookie】
    const key = document.getElementById("judge0_api_key").value;
    const temp_state = window.localStorage.getItem("temp_state");
    if (temp_state === "true") {
      // 临时使用，使用sessionStorage
      window.sessionStorage.setItem("judge0", key);
    } else {
      // 持久化储存，使用localstorage
      window.localStorage.setItem("judge0", key);
    }
    $.notify(
      {
        icon: "mdi mdi-check-circle-outline",
        title: "配置保存成功",
        message: "已保存Judge0配置！",
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
        onClosed: l.destroy(),
      }
    );
  }
});

document.getElementById("judge0_test_conn").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });
  const apiKey = document.getElementById("judge0_api_key").value;
  if (apiKey === "") {
    notify_invalid_setting_judge0();
  } else {
    try {
      let isConnected = await test_judge0_conn(apiKey);
      if (isConnected) {
        notify_success_setting_judge0();
      } else {
        notify_invalid_setting_judge0();
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      notify_invalid_setting_judge0();
    } finally {
      l.destroy();
    }
  }
});

async function test_judge0_conn(apiKey) {
  let isConnected = false;
  isConnected = await testJudge0Connection(apiKey);
  return isConnected;
}

function notify_success_setting_judge0() {
  $.notify(
    {
      icon: "mdi mdi-check-circle-outline",
      title: "Judge0服务测试",
      message: "恭喜您！测试连接成功！",
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

function notify_invalid_setting_judge0() {
  $.notify(
    {
      icon: "mdi mdi-close",
      title: "配置错误",
      message: "请检查RapidAPI配置！",
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

function notify_judge0_clear() {
  $.notify(
    {
      icon: "mdi mdi-check-circle-outline",
      title: "Judge0配置",
      message: "Judge0 API密钥已清空！",
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

function notify_invalid_setting() {
  $.notify(
    {
      icon: "mdi mdi-close",
      title: "模型配置错误",
      message: "请完整填写AI模型配置！",
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
