const display = document.getElementById("display");
function append(input) {
  if (display.innerText === "0") {
    display.innerText = "";
  }
  display.innerText += input;
}
function clearDisplay() {
  display.innerText = "0";
}
function backspace() {
  display.innerText = display.innerText.slice(0, -1) || "0";
}
function calculate() {
  let expression = display.innerText
    .replace(/√/g, "sqrt")
    .replace(/%/g, "* 0.01")
    .replace(/÷/g, "/")
    .replace(/×/g, "*");
  if (!isBalanced(expression)) {
    display.textContent = "Unbalanced brackets";
    return;
  }
  try {
    const tokens = tokenize(expression);
    const postfix = shuntingYard(tokens);
    const result = evaluatePostfix(postfix);
    display.innerText = parseFloat(result?.toPrecision(10)).toString();
  } catch (error) {
    display.innerText = error;
  }
}

function isBalanced(expression) {
  let stack = [];
  for (let char of expression) {
    if (char === "(") {
      stack.push("(");
    } else if (char === ")") {
      if (!stack.length) {
        return false;
      }
      stack.pop();
    }
  }
  return stack.length === 0;
}

document.querySelector(".buttons").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.action === "clear") clearDisplay();
  else if (btn.dataset.action === "backspace") backspace();
  else if (btn.dataset.action === "calculate") calculate();
  else if (btn.dataset.value) append(btn.dataset.value);
});

document.addEventListener("keydown", function (e) {
  if (e.key.match(/[0-9+-.^()%]/)) {
    append(e.key);
  } else if (e.key === "/") {
    append("÷");
  } else if (e.key === "*") {
    append("×");
  } else if (e.key === "s") {
    append("sin(");
  } else if (e.key === "c") {
    append("cos(");
  } else if (e.key === "t") {
    append("tan(");
  } else if (e.key === "r") {
    append("√");
  } else if (e.key === "p") {
    append("π");
  } else if (e.key === "l") {
    append("log(");
  } else if (e.key === "Enter" || e.key === "=") {
    calculate();
  } else if (e.key === "Backspace") {
    backspace();
  } else if (e.key === "e") {
    append("e");
  }
});

function tokenize(expression) {
  const tokens = [];

  let i = 0;
  while (i < expression.length) {
    const char = expression[i];
    if (char) {
      if (/\s/.test(char)) {
        i++;
        continue;
      }
      if (/[0-9.]/.test(char)) {
        let num = "";
        while (i < expression.length && /[0-9.]/.test(expression[i])) {
          num += expression[i++];
        }
        tokens.push({ type: "number", value: parseFloat(num) });
        continue;
      }
      if (/[a-zeπ]/.test(char)) {
        let word = "";
        while (i < expression.length && /[a-zπe]/.test(expression[i])) {
          word += expression[i++];
        }
        const functions = ["sin", "cos", "tan", "log", "sqrt"];
        if (functions.includes(word))
          tokens.push({ type: "function", value: word });
        else if (word === "π") tokens.push({ type: "number", value: Math.PI });
        else if (word === "e") tokens.push({ type: "number", value: Math.E });
        continue;
      }

      if (char === "-") {
        const prev = tokens[tokens.length - 1];
        const isUnary = !prev || prev.type === "operator" || prev.value === "(";
        tokens.push(
          isUnary
            ? { type: "unary", value: "neg" }
            : { type: "operator", value: "-" },
        );
        i++;
        continue;
      }

      if ("+-*/^()".includes(char)) {
        tokens.push({
          type: char === "(" || char === ")" ? "paren" : "operator",
          value: char,
        });
        i++;
        continue;
      }
      i++;
    }
  }
  return tokens;
}

function shuntingYard(tokens) {
  const output = [];
  const stack = [];
  const precendence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "^": 3,
    neg: 4,
  };
  const rightAssoc = {
    "^": true,
    neg: true,
  };
  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token);
      continue;
    }
    if (token.type === "function") {
      stack.push(token);
      continue;
    }
    if (token.type === "unary") {
      stack.push(token);
      continue;
    }
    if (token.type === "operator") {
      const curVal = token.value;
      while (stack.length) {
        const topVal = stack.at(-1).value;
        if (
          precendence[topVal] > precendence[curVal] ||
          (precendence[topVal] === precendence[curVal] && !rightAssoc[curVal])
        ) {
          output.push(stack.pop());
        } else break;
      }
      stack.push(token);
      continue;
    }
    if (token.value === "(") {
      stack.push(token);
      continue;
    }
    if (token.value === ")") {
      while (stack.length && stack.at(-1)?.value !== "(") {
        output.push(stack.pop());
      }
      stack.pop();
      if (stack.at(-1)?.type === "function") {
        output.push(stack.pop());
      }
      continue;
    }
  }
  while (stack.length) output.push(stack.pop());
  return output;
}

function evaluatePostfix(tokens) {
  const stack = [];
  for (const token of tokens) {
    if (token.type === "number") {
      stack.push(token.value);
      continue;
    }

    if (token.type === "unary") {
      const a = stack.pop();
      stack.push(-a);
      continue;
    }
    if (token.type === "function") {
      const a = stack.pop();
      const fns = {
        sin: (n) => Math.sin((n * Math.PI) / 180),
        cos: (n) => Math.cos((n * Math.PI) / 180),
        tan: (n) => Math.tan((n * Math.PI) / 180),
        log: (n) => Math.log10(n),
        sqrt: (n) => Math.sqrt(n),
      };
      if (fns[token.value]) {
        stack.push(fns[token.value](a));
      }
      continue;
    }
    if (token.type === "operator") {
      const b = stack.pop();
      const a = stack.pop();
      const ops = {
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
        "*": (a, b) => a * b,
        "/": (a, b) => a / b,
        "^": (a, b) => Math.pow(a, b),
      };
      stack.push(ops[token.value](a, b));
      continue;
    }
  }
  return stack[0];
}
