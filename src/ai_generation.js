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

async function getDataWithDeepSeek(prompt) {
  const temp_state = localStorage.getItem("temp_state") === "true";
  const storage = temp_state ? sessionStorage : localStorage;

  const provider = storage.getItem("provider");
  const model = storage.getItem("model");
  const apiKey = storage.getItem("apiKey");

  if (provider !== "deepseek" || !model || !apiKey) {
    // console.error("❌ DeepSeek 配置不完整，请检查 provider/model/apiKey");
    ModelSettingFailed();
    return null;
  }

  const tools = [
    {
      type: "function",
      function: {
        name: "calculatePrecise",
        description: "执行高精度数学计算，支持浮点数和大数值，包括加法、减法、乘法、除法和乘方操作",
        parameters: {
          type: "object",
          properties: {
            a: {
              type: "number",
              description: "第一个数字，支持整数、小数、正数和负数",
            },
            b: {
              type: "number",
              description: "第二个数字，支持整数、小数、正数和负数",
            },
            operation: {
              type: "integer",
              description: "操作类型：1表示加法，2表示减法，3表示乘法，4表示除法，5表示乘方",
              enum: [1, 2, 3, 4, 5],
            },
            precision: {
              type: "integer",
              description: "计算结果保留的小数位数，默认为10位",
              default: 10,
            },
          },
          required: ["a", "b", "operation"],
        },
      },
    },
  ];

  try {
  } catch (error) {}

  const url = "https://api.deepseek.com/chat/completions";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const body = {
    model: model,
    messages: prompt,
    response_format: {
      type: "text",
    },
    temperature: 0.3,
    stream: false,
    tool_choice: "auto",
    tools: tools,
  };

  console.log(`🚀 向 DeepSeek 发起请求：${model}`, body);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  console.log("res:", res);

  if (!res.ok) {
    return null;
  }

  // const data = await res.json();
  // console.log("data:", data);

  const assistantMessage = res.choices[0].message;

  // 构建消息历史
  const secMessages = prompt.push(assistantMessage);

  // 检查模型是否请求使用工具
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    const toolCall = assistantMessage.tool_calls[0];

    if (toolCall.function.name === "calculate") {
      console.log("🔧 模型请求使用计算工具");

      // 解析工具调用参数
      const params = JSON.parse(toolCall.function.arguments);
      console.log("计算参数:", params);

      // 执行计算
      const result = performCalculation(params.a, params.b, params.operation);
      console.log("计算结果:", result);

      // 将计算结果返回给模型
      secMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result.toString(),
      });

      // 获取最终回复
      const finalBody = {
        model: model,
        messages: secMessages,
        response_format: { type: "text" },
        temperature: 0.3,
        stream: false,
      };

      console.log(`🚀 向 DeepSeek 发起最终请求：`, finalBody);

      const finalRes = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(finalBody),
      });

      console.log("最终响应状态:", finalRes.status);

      if (!finalRes.ok) {
        console.error("最终请求失败:", await finalRes.text());
        return null;
      }

      const finalData = await finalRes.json();
      const reply = finalData.choices?.[0]?.message?.content;

      if (!reply) {
        console.warn("⚠️ AI 没有返回有效回复内容");
        console.warn("原始响应：", finalData);
        return null;
      }

      console.log("✅ AI 最终回复：", reply);
      return reply.trim();
    }
  }

  // 如果模型没有使用工具，直接返回第一次回复
  const reply = assistantMessage.content;
  if (!reply) {
    console.warn("⚠️ AI 没有返回有效回复内容");
    console.warn("原始响应：", initialData);
    return null;
  }

  console.log("✅ AI 直接回复：", reply);
  return reply.trim();
}

/**
 * calculatePrecise
 * @param {number|string} a 第一个操作数
 * @param {number|string} b 第二个操作数
 * @param {number} operation 操作类型：1=加法，2=减法，3=乘法，4=除法，5=乘方
 * @param {number} precision 除法结果的小数位数，默认为20位
 * @returns {string} 计算结果
 */
function calculatePrecise(a, b, operation, precision = 20) {
  // 转换输入为字符串
  const strA = String(a);
  const strB = String(b);

  // 基本验证
  if (!/^-?\d*\.?\d*$/.test(strA) || !/^-?\d*\.?\d*$/.test(strB)) {
    return "无效的数字输入";
  }

  // 高精度加法
  function add(x, y) {
    // 处理负数
    if (x.startsWith("-") && !y.startsWith("-")) return subtract(y, x.substring(1));
    if (!x.startsWith("-") && y.startsWith("-")) return subtract(x, y.substring(1));
    if (x.startsWith("-") && y.startsWith("-")) return "-" + add(x.substring(1), y.substring(1));

    // 对齐小数点
    let [intX, decX = ""] = x.split(".");
    let [intY, decY = ""] = y.split(".");
    const maxDecLength = Math.max(decX.length, decY.length);
    decX = decX.padEnd(maxDecLength, "0");
    decY = decY.padEnd(maxDecLength, "0");

    // 执行加法
    const decResult = addStrings(decX, decY);
    let carry = decResult.length > maxDecLength ? 1 : 0;
    const decimalPart = decResult.slice(-maxDecLength).padStart(maxDecLength, "0");
    const intResult = addStrings(intX, intY, carry);

    // 格式化结果
    return intResult + (maxDecLength > 0 ? "." + decimalPart : "");
  }

  // 高精度减法
  function subtract(x, y) {
    // 处理负数
    if (x.startsWith("-") && !y.startsWith("-")) return "-" + add(x.substring(1), y);
    if (!x.startsWith("-") && y.startsWith("-")) return add(x, y.substring(1));
    if (x.startsWith("-") && y.startsWith("-")) return subtract(y.substring(1), x.substring(1));

    // 比较大小，确保大数减小数
    if (compareNumbers(x, y) < 0) {
      return "-" + subtract(y, x);
    }

    // 对齐小数点
    let [intX, decX = ""] = x.split(".");
    let [intY, decY = ""] = y.split(".");
    const maxDecLength = Math.max(decX.length, decY.length);
    decX = decX.padEnd(maxDecLength, "0");
    decY = decY.padEnd(maxDecLength, "0");

    // 执行减法
    let borrow = 0;
    let decResult = "";

    // 处理小数部分
    for (let i = maxDecLength - 1; i >= 0; i--) {
      let digit = parseInt(decX[i]) - parseInt(decY[i]) - borrow;
      if (digit < 0) {
        digit += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }
      decResult = digit + decResult;
    }

    // 处理整数部分
    let intResult = "";
    intX = intX.padStart(intY.length, "0");
    intY = intY.padStart(intX.length, "0");

    for (let i = intX.length - 1; i >= 0; i--) {
      let digit = parseInt(intX[i]) - parseInt(intY[i]) - borrow;
      if (digit < 0) {
        digit += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }
      intResult = digit + intResult;
    }

    // 删除前导零
    intResult = intResult.replace(/^0+/, "") || "0";

    // 格式化结果
    let result = intResult + (maxDecLength > 0 ? "." + decResult : "");
    result = result.replace(/\.?0+$/, ""); // 删除尾随零和小数点
    return result;
  }

  // 高精度乘法
  function multiply(x, y) {
    // 处理符号
    const isNegative = (x.startsWith("-") && !y.startsWith("-")) || (!x.startsWith("-") && y.startsWith("-"));
    x = x.replace(/^-/, "");
    y = y.replace(/^-/, "");

    // 处理小数点
    const decimalPlaces = (x.split(".")[1] || "").length + (y.split(".")[1] || "").length;
    x = x.replace(".", "");
    y = y.replace(".", "");

    // 计算各位的乘积
    const result = Array(x.length + y.length).fill(0);

    for (let i = x.length - 1; i >= 0; i--) {
      for (let j = y.length - 1; j >= 0; j--) {
        const p1 = i + j;
        const p2 = i + j + 1;
        const sum = result[p2] + parseInt(x[i]) * parseInt(y[j]);

        result[p2] = sum % 10;
        result[p1] += Math.floor(sum / 10);
      }
    }

    // 转换为字符串并插入小数点
    let resultStr = result.join("").replace(/^0+/, "");
    if (resultStr === "") return "0";

    if (decimalPlaces > 0) {
      // 确保结果长度足够插入小数点
      if (resultStr.length <= decimalPlaces) {
        resultStr = "0".repeat(decimalPlaces - resultStr.length + 1) + resultStr;
      }
      resultStr = resultStr.slice(0, -decimalPlaces) + "." + resultStr.slice(-decimalPlaces);
      // 删除尾随零和小数点
      resultStr = resultStr.replace(/\.?0+$/, "");
    }

    return (isNegative ? "-" : "") + resultStr;
  }

  // 高精度除法
  function divide(x, y, prec) {
    // 处理除以零
    if (y === "0") return "除数不能为零";

    // 处理符号
    const isNegative = (x.startsWith("-") && !y.startsWith("-")) || (!x.startsWith("-") && y.startsWith("-"));
    x = x.replace(/^-/, "");
    y = y.replace(/^-/, "");

    // 如果被除数小于除数，则结果小于1
    if (compareNumbers(x, y) < 0) {
      return (isNegative ? "-0." : "0.") + divideDecimal("0" + x, y, prec);
    }

    // 移除小数点进行整数除法
    let [intX, decX = ""] = x.split(".");
    let [intY, decY = ""] = y.split(".");

    // 将被除数和除数都转换为整数
    const decimalShift = decY.length - decX.length;
    if (decimalShift > 0) {
      x = intX + decX + "0".repeat(decimalShift);
      y = intY + decY;
    } else {
      x = intX + decX;
      y = intY + decY + "0".repeat(-decimalShift);
    }

    // 执行长除法
    let quotient = "";
    let remainder = "";

    for (let i = 0; i < x.length; i++) {
      remainder += x[i];
      let digit = 0;

      while (compareNumbers(remainder, y) >= 0) {
        remainder = subtract(remainder, y);
        digit++;
      }

      quotient += digit;

      // 移除前导零
      remainder = remainder.replace(/^0+/, "") || "0";
    }

    // 计算小数部分
    let decimalPart = "";
    if (remainder !== "0" && prec > 0) {
      decimalPart = "." + divideDecimal(remainder, y, prec);
    }

    // 删除前导零
    quotient = quotient.replace(/^0+/, "") || "0";

    return (isNegative ? "-" : "") + quotient + decimalPart;
  }

  // 计算除法的小数部分
  function divideDecimal(numerator, denominator, precision) {
    let result = "";

    for (let i = 0; i < precision && numerator !== "0"; i++) {
      numerator += "0";
      let digit = 0;

      while (compareNumbers(numerator, denominator) >= 0) {
        numerator = subtract(numerator, denominator);
        digit++;
      }

      result += digit;
      numerator = numerator.replace(/^0+/, "") || "0";
    }

    return result.padEnd(precision, "0");
  }

  // 高精度幂运算
  function power(base, exponent) {
    // 处理指数为0的情况
    if (exponent === "0") return "1";

    // 处理指数为负数的情况
    if (exponent.startsWith("-")) {
      return divide("1", power(base, exponent.substring(1)), precision);
    }

    // 处理小数指数（不支持，需要使用对数计算，这里简化处理）
    if (exponent.includes(".")) {
      return "暂不支持小数指数的精确计算";
    }

    // 处理负数底数的非整数指数
    if (base.startsWith("-") && exponent.includes(".")) {
      return "负数的非整数次幂导致复数结果，无法表示";
    }

    // 处理负数底数的奇偶次幂
    const isBaseNegative = base.startsWith("-");
    base = base.replace(/^-/, "");

    // 使用快速幂算法计算
    let result = "1";
    let currentBase = base;
    let exp = parseInt(exponent);

    while (exp > 0) {
      if (exp % 2 === 1) {
        result = multiply(result, currentBase);
      }
      currentBase = multiply(currentBase, currentBase);
      exp = Math.floor(exp / 2);
    }

    // 根据底数和指数判断结果符号
    const isResultNegative = isBaseNegative && parseInt(exponent) % 2 === 1;
    return (isResultNegative ? "-" : "") + result;
  }

  // 辅助函数：字符串加法
  function addStrings(num1, num2, initialCarry = 0) {
    let carry = initialCarry;
    let result = "";
    let i = num1.length - 1;
    let j = num2.length - 1;

    while (i >= 0 || j >= 0 || carry > 0) {
      const digit1 = i >= 0 ? parseInt(num1[i]) : 0;
      const digit2 = j >= 0 ? parseInt(num2[j]) : 0;
      const sum = digit1 + digit2 + carry;

      result = (sum % 10) + result;
      carry = Math.floor(sum / 10);

      i--;
      j--;
    }

    return result;
  }

  // 辅助函数：比较两个无符号数字字符串的大小
  function compareNumbers(a, b) {
    // 移除小数点并对齐
    let [intA, decA = ""] = a.split(".");
    let [intB, decB = ""] = b.split(".");

    // 比较整数部分长度
    if (intA.length !== intB.length) {
      return intA.length - intB.length;
    }

    // 比较整数部分
    for (let i = 0; i < intA.length; i++) {
      if (intA[i] !== intB[i]) {
        return parseInt(intA[i]) - parseInt(intB[i]);
      }
    }

    // 比较小数部分
    const maxDecLength = Math.max(decA.length, decB.length);
    decA = decA.padEnd(maxDecLength, "0");
    decB = decB.padEnd(maxDecLength, "0");

    for (let i = 0; i < maxDecLength; i++) {
      if (decA[i] !== decB[i]) {
        return parseInt(decA[i]) - parseInt(decB[i]);
      }
    }

    return 0; // 相等
  }

  // 格式化结果，删除不必要的前导和尾随零
  function formatResult(result) {
    // 处理前导零
    result = result.replace(/^-?0+(\d)/, (m, d) => m.replace(/0+/, "") + d);

    // 处理小数部分尾随零和小数点
    if (result.includes(".")) {
      result = result.replace(/\.0*$/, ""); // 如果小数部分全是0，删除小数点
      result = result.replace(/(\.\d*[1-9])0+$/, "$1"); // 删除有效数字后的尾随零
    }

    return result === "" ? "0" : result;
  }

  // 主函数逻辑
  let result;

  switch (operation) {
    case 1: // 加法
      result = add(strA, strB);
      break;

    case 2: // 减法
      result = subtract(strA, strB);
      break;

    case 3: // 乘法
      result = multiply(strA, strB);
      break;

    case 4: // 除法
      result = divide(strA, strB, precision);
      break;

    case 5: // 乘方
      result = power(strA, strB);
      break;

    default:
      return "无效的操作码";
  }

  return formatResult(result);
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
