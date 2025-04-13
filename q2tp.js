document.getElementById("generate_btn").addEventListener("click", async function () {
  $(this).attr("disable", "true");
  var l = $(this).lyearloading({
    opacity: 0.2,
    spinnerSize: "nm",
  });
  const markdownContent = easyMDE.value();
  const ranger = document.getElementById("ranger").value;
  const tps = await question_get_tp(markdownContent, ranger);
  console.log("tps", tps);
  l.destroy();
});

async function question_get_tp(markdownPrompt, nCases = 5) {
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
    3. 所有返回内容必须为严格有效的 JSON 数组，形如：
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

  return unformData;
}
