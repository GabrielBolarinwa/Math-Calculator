const display = document.getElementById("display");
function append(input) {
  if (display.innerText === "0") {
    display.innerText = "";
  }
  display.value += input;
}
function clearDisplay() {
  display.value = "0";
}
function backspace() {
  display.innerText = display.innerText.slice(0, -1) || "0";
}
function degtoRad(deg) {
  return deg * (Math.PI / 180);
}

function calculateSin(deg) {
  return Math.sin(degtoRad(deg));
}
function calculate() {
  const calcMath = {
    sin: (deg) => Math.sin((deg * Math.PI) / 180),
    cos: (deg) => Math.cos((deg * Math.PI) / 180),
    tan: (deg) => Math.tan((deg * Math.PI) / 180),
  };

  let expression = display.innerText
    .replace(/π/g, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/√(\d+|\([^\)]+\))/g, "Math.sqrt($1)")
    .replace(/%/g, "*0.01")
    .replace(/\^/g, "**")
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/log\(/g, "Math.log10(")
    .replace(/sin\(/g, "calcMath.sin(")
    .replace(/cos\(/g, "calcMath.cos(")
    .replace(/tan\(/g, "calcMath.tan(")
    .replace(/÷/g, "/")
    .replace(/×/g, "*");
  if (!isBalanced(expression)) {
    display.textContent = "Unbalanced brackets";
    return;
  }
  try {
    console.log(expression);
    display.value = eval(expression);
  } catch (error) {
    display.value = error;
    console.error(error);
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
  }
});
