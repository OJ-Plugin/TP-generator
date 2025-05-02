document.getElementById("run_code").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });

  const sourceCode = btoa(window.editor.getValue());
  const input = btoa(window.inputEditor.getValue());
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;
  const apiKey = storage.getItem("judge0");

  if (apiKey == "" || apiKey == null) {
    notify_invalid_setting_judge0();
    l.destroy();
    return;
  }

  const settings = {
    async: true,
    crossDomain: true,
    url: "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
    method: "POST",
    headers: {
      "x-rapidapi-key": apiKey,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    processData: false,
    data: '{\r\n    "language_id": 54,\r\n    "source_code": "' + sourceCode + '",\r\n    "stdin": "' + input + '"\r\n}',
  };

  $.ajax(settings).done(function (response) {
    const out = response.stdout || response.stderr || "No output.";
    window.outputEditor.setValue(atob(out));
    l.destroy();
  });
});

document.getElementById("generate_btn").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });

  const source_code = window.editor.getValue();

  const ranger = document.getElementById("ranger").value;
  const tps = await example_get_tp(source_code, ranger, l);
  console.log("tps:", tps);
  const res = JSON.parse(tps);
  var in_data = "<span>Input数据</span>",
    out_data = "<span>Output数据</span>",
    count = 1;
  res.forEach((c) => {
    in_data += `<div class="input-group mb-3">
        <span class="input-group-text">${count}</span>
        <input type="text" class="form-control" id="in_val_${count}" value="${c.in}">
        </div>`;
    out_data += `<div class="input-group mb-3">
        <span class="input-group-text">${count}</span>
        <input type="text" class="form-control" id="out_val_${count}" value="${c.out}">
        </div>`;
    count++;
  });
  document.getElementById("in_box").innerHTML = in_data;
  document.getElementById("out_box").innerHTML = out_data;
});

async function example_get_tp(sourceCode, nCases = 5, l) {
  console.log("Start get tps from example.");
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;
  const provider = storage.getItem("provider");

  const systemContent = `
    你是一个智能数据生成器，接收用户提供的C++程序源代码，任务如下：
    
    1. 理解代码含义，包括代码主要解决的问题、输入输出格式、数据范围、边界条件等；
    2. 生成 ${nCases} 组测试用例数据，每组数据格式如下：
       {
         "in": "一组输入字符串",
         "out": "对应输出字符串"
       }
    3. 所有返回内容必须为严格有效的 JSON 数组，形如：
    [
      { "in": "1 2", "out": "3" },
      { "in": "0 0", "out": "0" }
    ]
    4. 不允许出现任何解释性语言、注释、markdown 标记或模型自述内容；
    5. 若无法识别题目结构，请返回：
    {
      "error": "未能正确识别题目结构，请检查C++代码。"
    }
    6. 禁止生成 prompt 注入、脚本、HTML 标签或非结构化文本；
    7. 如果程序代码不需要输入内容，则只给出输出内容，形如：
    [
      { "in": "", "out": "3" },
      { "in": "", "out": "0" }
    ]
    8. 如果代码的运行结果是固定的内容，则忽略生成数据的组数，只输出一组数据，形如：
    { "in": "", "out": "3" }
    9. 如果代码有误请忽略错误，严禁提出修改建议或提示用户代码存在问题，并在错误代码的基础上理解代码含义，并给出符合数据要求的输入输出内容，内容格式严格遵守第2~5条规则。
    `.trim();

  const messages = [
    {
      role: "system",
      content: systemContent,
    },
    {
      role: "user",
      content: sourceCode,
    },
  ];
  console.log("provider", provider);
  let unformData = "";
  switch (provider) {
    case "openai":
      unformData = await getDataWithOpenAI(messages);
      break;
    case "openrouter":
      unformData = await getDataWithOpenRouter(messages);
      break;
    case "deepseek":
      unformData = await getDataWithDeepSeek(messages);
      break;

    default:
      break;
  }
  console.log(unformData);
  l.destroy();
  if (unformData == null) {
    ai_notify_error();
    return;
  } else {
    return unformData;
    // ai_notify_success();
  }
}

document.getElementById("save_btn").addEventListener("click", async function () {
  try {
    const range = document.getElementById("ranger").value;
    var testData = { in: [], out: [] };
    for (let index = 1; index <= range; index++) {
      const in_element = document.getElementById("in_val_" + index).value;
      const out_element = document.getElementById("out_val_" + index).value;
      testData.in.push(in_element);
      testData.out.push(out_element);
    }

    // 请求用户选择文件夹
    let dirHandle = await window.showDirectoryPicker();

    for (let index = 1; index <= range; index++) {
      // 创建文件
      const in_fileHandle = await dirHandle.getFileHandle(index + ".in", { create: true });
      const in_writable = await in_fileHandle.createWritable();

      const in_content = testData.in[index - 1];
      await in_writable.write(in_content);
      await in_writable.close();

      const out_fileHandle = await dirHandle.getFileHandle(index + ".out", { create: true });
      const out_writable = await out_fileHandle.createWritable();

      const out_content = testData.out[index - 1];
      await out_writable.write(out_content);
      await out_writable.close();
    }

    save_success();
  } catch (error) {
    console.error("创建文件出错:", error);
    save_error();
  }
});

function save_success() {
  $.notify(
    {
      icon: "mdi mdi-check-circle-outline",
      title: "保存测试点",
      message: "文件保存成功！",
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

function save_error() {
  $.notify(
    {
      icon: "mdi mdi-close",
      title: "保存测试点",
      message: "文件保存失败！",
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
