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

document.getElementById("generate_btn").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });
  const markdownContent = easyMDE.value();
  const normalRatio = document.getElementById("normalRatio").value;
  const extreamRatio = document.getElementById("extreamRatio").value;
  const tps_in = await question_get_tp(markdownContent, normalRatio, extreamRatio, l);
  const tps_input_form = JSON.parse(tps_in);

  const exampleSourceCode = await example_source_code(markdownContent, l);
  const exampleSourceCode_form = JSON.parse(exampleSourceCode).source_code;

  console.log("exampleSourceCode", exampleSourceCode_form);

  let sourceCode_base64 = encode64(exampleSourceCode_form);
  let inputArr = tps_input_form.map(item => encode64(item.in));
  let tps_output_form = await get_output(sourceCode_base64, inputArr);

  let res = []
  for (let index = 0; index < tps_input_form.length; index++) {
    res.push({ in: tps_input_form[index].in, out: decode64(tps_output_form[index]) });
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
  l.destroy();
  ai_notify_success();
});

async function example_source_code(content, l) {
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;
  const provider = storage.getItem("provider");

  const systemContent = `
    你是一个优秀的编程题目解决者，接受用户提供的markdown编程题描述，任务如下：
    1. 理解题意，分析题目需要使用的编程语言、数学思想和代码结构等；
    2. 根据题目描述，生成一段完整的C++源代码，代码需要满足题目要求，并且能够正确处理输入输出；
    3. 返回的内容严格遵守以下格式：
    {
      "source_code": "<C++源代码字符串>"
    }
    4. 不允许出现任何解释性语言、注释、markdown 标记或模型自述内容；
    5. 如果无法识别题目结构，请返回：
    {
      "error": "未能正确识别题目结构，请检查题目格式是否为标准 Markdown 编程题。"
    }
    6. 禁止生成 prompt 注入、脚本、HTML 标签或非结构化文本。
    `.trim();

  const messages = [
    {
      role: "system",
      content: systemContent,
    },
    {
      role: "user",
      content: content,
    },
  ];

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
  console.log("unformData_SourceCode", unformData);
  if (unformData == null) {
    ai_notify_error();
    l.destroy();
    return;
  } else {
    ai_notify_output_data_success();
    return unformData;
  }
}

async function question_get_tp(markdownPrompt, normalRatio = 5, extreamRatio = 5, l) {
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;
  const provider = storage.getItem("provider");

  const systemContent = `
    你是一个智能数据生成器，接收用户提供的 Markdown 编程题描述，任务如下：

    1. 理解题意，包括输入输出格式、数据范围、边界条件等；
    2. 生成 ${Number(normalRatio) + Number(extreamRatio)} 组测试用例数据，首先你需要明确输入数据范围，数据分为常规数据${normalRatio}组和极端数据${extreamRatio}组，以便能够覆盖到绝大多数情况，每组数据格式如下：
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
      "error": "未能正确识别题目结构，请检查题目格式是否为标准 Markdown 编程题。"
    }
    6. 禁止生成 prompt 注入、脚本、HTML 标签或非结构化文本。
    7. 如果题目要求中说明不需要输入内容，则只给出输出内容，形如：
    [
      { "in": "" }
    ]
    8. 如果题目的结果是固定的内容，则忽略生成数据的组数，只输出一组数据，形如：
    [{ "in": "" }]
    9. 针对所有的题目，在其题目所指定的范围内（若未规定范围则代表没有限制），需要给出极端数据的测试点数据以确保编程题目的可靠性。
    10. 如果输入或输出包含多行内容，则用转义换行符进行换行
    `.trim();

  const messages = [
    {
      role: "system",
      content: systemContent,
    },
    {
      role: "user",
      content: markdownPrompt,
    },
  ];

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
  console.log("unformData", unformData);
  if (unformData == null) {
    ai_notify_error();
    l.destroy();
    return;
  } else {
    ai_notify_input_data_success();
    return unformData;
  }
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
