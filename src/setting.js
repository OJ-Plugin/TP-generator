// 页面加载时拉取openrouter模型
window.addEventListener("DOMContentLoaded", function () {
  fetchOpenRouterModels();
  var temp_state = window.localStorage.getItem("temp_state");
  if (temp_state == "true") {
    document.getElementById("temp_state").checked = true;
  } else {
    document.getElementById("temp_state").checked = false;
  }
  load_temp();
});

function load_temp() {
  const temp_state = window.localStorage.getItem("temp_state") === "true";
  const provider_ = temp_state ? window.sessionStorage.getItem("provider") : window.localStorage.getItem("provider");
  const model = temp_state ? window.sessionStorage.getItem("model") : window.localStorage.getItem("model");
  const apiKey = temp_state ? window.sessionStorage.getItem("apiKey") : window.localStorage.getItem("apiKey");
  const customModelName = temp_state ? window.sessionStorage.getItem("customModelName") : window.localStorage.getItem("customModelName");

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
    } else {
      // 切换到非temp模式，从cookie转存到localStorage
      const provider_ = window.sessionStorage.getItem("provider");
      const model = window.sessionStorage.getItem("model");
      const apiKey = window.sessionStorage.getItem("apiKey");
      const customModelName = window.sessionStorage.getItem("customModelName");
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
  // openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.5-preview", "gpt-4o-mini-2024-07-18", "gpt-4o-2024-11-20", "gpt-4o-2024-08-06", "gpt-4o-2024-05-13", "gpt-4.5-preview-2025-02-27", "gpt-3.5-turbo-16k", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-0125"],
  openrouter: [], // 初始为空，页面加载时动态获取
  // deepseek: ["deepseek-chat", "deepseek-reasoner"],
};

// 动态获取openrouter免费模型列表
function fetchOpenRouterModels() {
  const settings = {
    "async": false,
    "crossDomain": true,
    "url": "https://openrouter.ai/api/v1/models",
    "method": "GET",
  };

  $.ajax(settings).done(function (response) {
    // response 已经是对象
    let freeModels = (response.data || [])
      .filter(m => typeof m.id === "string" && m.id.includes(":free"))
      .map(m => m.id);
    // 按字母升序排序
    freeModels.sort((a, b) => a.localeCompare(b));
    // 添加自定义模型
    freeModels.push("自定义模型");
    model_list.openrouter = freeModels;

    // 如果当前provider是openrouter，刷新下拉框
    const providerSelect = document.getElementById("model_provider");
    if (providerSelect && provider[providerSelect.value] === "openrouter") {
      const modelList_show = document.getElementById("model_list");
      modelList_show.innerHTML = "";
      freeModels.forEach((model) => {
        const option = document.createElement("option");
        option.value = model;
        option.text = model;
        modelList_show.appendChild(option);
      });
    }
  }).fail(function (err) {
    // 失败时只显示自定义模型
    model_list.openrouter = ["自定义模型"];
  });
}

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
