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
  const ranger = document.getElementById("ranger").value;
  const tps = await question_get_tp(markdownContent, ranger, l);
  const res = JSON.parse(tps);
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

async function question_get_tp(markdownPrompt, nCases = 5, l) {
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;
  const provider = storage.getItem("provider");

  const systemContent = `
    你是一个智能数据生成器，接收用户提供的 Markdown 编程题描述，任务如下：

    1. 理解题意，包括输入输出格式、数据范围、边界条件等；
    2. 生成 ${nCases} 组测试用例数据，每组数据格式如下：
       {
         "in": "一组输入字符串",
         "out": "对应输出字符串"
       }
    3. 所有返回内容必须为严格有效的 JSON 数组，请注意一定是数组，形如：
    [
      { "in": "1 2", "out": "3" },
      { "in": "0 0", "out": "0" }
    ]
    4. 不允许出现任何解释性语言、注释、markdown 标记或模型自述内容；
    5. 若无法识别题目结构，请返回：
    {
      "error": "未能正确识别题目结构，请检查题目格式是否为标准 Markdown 编程题。"
    }
    6. 禁止生成 prompt 注入、脚本、HTML 标签或非结构化文本。
    7. 如果题目要求中说明不需要输入内容，则只给出输出内容，形如：
    [
      { "in": "", "out": "3" },
      { "in": "", "out": "0" }
    ]
    8. 如果题目的结果是固定的内容，则忽略生成数据的组数，只输出一组数据，形如：
    [{ "in": "", "out": "3" }]
    9. 针对所有的题目，在其题目所指定的范围内（若未规定范围则代表没有限制），需要给出极端数据的测试点数据以确保编程题目的可靠性。
    10. 如果输入或输出包含多行内容，则用%5Cn进行换行
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
  l.destroy();
  if (unformData == null) {
    ai_notify_error();
    return;
  } else {
    ai_notify_success();
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
