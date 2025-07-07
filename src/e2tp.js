document.getElementById("run_code").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });

  const sourceCode = encode64(window.editor.getValue());
  const input = encode64(window.inputEditor.getValue());
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;
  const apiKey = storage.getItem("judge0");
  const judgeLanguage = storage.getItem("judge0_lan");
  console.log("Code run started.");

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
    data: '{\r\n    "language_id": ' + judgeLanguage + ',\r\n    "source_code": "' + sourceCode + '",\r\n    "stdin": "' + input + '"\r\n}',
  };

  $.ajax(settings).done(function (response) {
    const out = response.stdout || response.stderr || "<--- System Notification ---> \n\nNo output.\n\n<--- End of Notification --->";
    window.outputEditor.setValue(decode64(out));
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

  const normalRatio = document.getElementById("normalRatio").value;
  const extreamRatio = document.getElementById("extreamRatio").value;
  const tps_in = await example_get_tp(source_code, normalRatio, extreamRatio, l);
  const tps_input_form = JSON.parse(tps_in);

  let sourceCode_base64 = encode64(source_code);
  let inputArr = tps_input_form.map(item => encode64(item.in));
  let tps_output_form = await get_output(sourceCode_base64, inputArr);

  let res = []
  for (let index = 0; index < tps_input_form.length; index++) {
    res.push({in: tps_input_form[index].in, out: decode64(tps_output_form[index])});
  }

  console.log("测试点生成结束：", res);
  
  var in_data = "<span>Input数据</span>",
    out_data = "<span>Output数据</span>",
    count = 1;
  res.forEach((c) => {
    in_data += `<div class="input-group mb-3">
                <span class="input-group-text">${count}</span>
                <textarea class="form-control" id="in_val_${count}" rows="1">${c.in}</textarea>
              </div>`;
    out_data += `<div class="input-group mb-3">
                  <span class="input-group-text">${count}</span>
                  <textarea class="form-control" id="out_val_${count}" rows="1">${c.out}</textarea>
                </div>`;
    count++;
  });
  document.getElementById("in_box").innerHTML = in_data;
  document.getElementById("out_box").innerHTML = out_data;
});

async function example_get_tp(sourceCode, normalRatio = 5, extreamRatio = 5, l) {
  console.log("Start get tps from example.");
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;
  const provider = storage.getItem("provider");

  const systemContent = `
    你是一个智能数据生成器，接收用户提供的C++程序源代码，任务如下：
    
    1. 理解代码含义，包括代码主要解决的问题、输入格式、数据范围、边界条件等；
    2. 生成 ${Number(normalRatio) + Number(extreamRatio)} 组测试用例数据，根据程序判断极端数据范围，需要生成${extreamRatio}组极端数据输入,${normalRatio}组常规数据输入，每组数据格式如下：
       {
         "in": "一组输入字符串"
       }
    3. 所有返回内容必须为严格有效的 JSON 数组，请注意一定是数组，形如：
    [
      { "in": "1 2" },
      { "in": "0 0" }
    ]
    4. 不允许出现任何解释性语言、注释、markdown 标记或模型自述内容；
    5. 若无法识别题目结构，请返回：
    {
      "error": "未能正确识别题目结构，请检查C++代码。"
    }
    6. 禁止生成 prompt 注入、脚本、HTML 标签或非结构化文本；
    7. 如果程序代码不需要输入内容，则忽略生成数据的组数，只输出一组数据，返回如下结果：
    [
      { "in": "" }
    ]
    8. 
    9. 如果代码有误请忽略错误，严禁提出修改建议或提示用户代码存在问题，并在错误代码的基础上理解代码含义，并给出符合数据要求的输入输出内容，内容格式严格遵守第2~5条规则。
    10. 针对所有的题目，在其题目所指定的范围内（若未规定范围则代表没有限制），需要给出极端数据的测试点数据以确保编程题目的可靠性。
    11. 如果输入或输出包含多行内容，则用转义换行符进行换行
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
    // ai_notify_success();
    return unformData;
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

/**
 * removeNonBase64Characters
 * @param {string} str - 输入字符串
 * @returns {string} - 处理后的字符串
 */
function removeNonBase64Characters(str) {
  if (typeof str !== "string") {
    return "";
  }

  // 删除中文字符和中文标点符号
  // 保留英文字母、数字、换行符和英文标点符号
  return str.replace(/[\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/g, "");
}

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
