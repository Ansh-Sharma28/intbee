import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import sympy as sp
from sympy.parsing.latex import parse_latex

app = Flask(__name__)
CORS(app)

# Prevent insane payloads (people will send crazy LaTeX otherwise)
app.config["MAX_CONTENT_LENGTH"] = 200 * 1024  # 200 KB

x = sp.symbols("x")


def clean_latex(expr):
    if not expr:
        return ""

    expr = re.sub(r'\\int\s*', '', expr)
    expr = re.sub(r'\s*d[a-zA-Z]\b', '', expr)
    expr = re.sub(r'\+\s*C\b', '', expr)

    expr = expr.replace("\\left", "").replace("\\right", "")

    for _ in range(5):
        new = re.sub(r'\|([^|]*)\|', r'(\1)', expr)
        if new == expr:
            break
        expr = new
    expr = expr.replace("|", "")

    expr = re.sub(r'\\sin\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\arcsin', expr)
    expr = re.sub(r'\\cos\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\arccos', expr)
    expr = re.sub(r'\\tan\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\arctan', expr)
    expr = re.sub(r'\\sec\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\operatorname{arcsec}', expr)
    expr = re.sub(r'\\csc\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\operatorname{arccsc}', expr)
    expr = re.sub(r'\\cot\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\operatorname{arccot}', expr)

    expr = re.sub(r'\\sinh\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\operatorname{arcsinh}', expr)
    expr = re.sub(r'\\cosh\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\operatorname{arccosh}', expr)
    expr = re.sub(r'\\tanh\s*\^\s*\{?\s*-\s*1\s*\}?', r'\\operatorname{arctanh}', expr)

    return expr.strip()


def latex_to_sympy_fallback(expr):
    e = expr
    e = e.replace("\\operatorname{arcsec}", "asec")
    e = e.replace("\\operatorname{arccsc}", "acsc")
    e = e.replace("\\operatorname{arccot}", "acot")
    e = e.replace("\\operatorname{arcsinh}", "asinh")
    e = e.replace("\\operatorname{arccosh}", "acosh")
    e = e.replace("\\operatorname{arctanh}", "atanh")
    e = e.replace("\\arcsin", "asin")
    e = e.replace("\\arccos", "acos")
    e = e.replace("\\arctan", "atan")
    e = e.replace("\\sinh", "sinh")
    e = e.replace("\\cosh", "cosh")
    e = e.replace("\\tanh", "tanh")
    e = e.replace("\\sin", "sin")
    e = e.replace("\\cos", "cos")
    e = e.replace("\\tan", "tan")
    e = e.replace("\\sec", "sec")
    e = e.replace("\\csc", "csc")
    e = e.replace("\\cot", "cot")
    e = e.replace("\\ln", "log")
    e = e.replace("\\log", "log")
    e = e.replace("\\exp", "exp")
    e = e.replace("\\sqrt", "sqrt")
    e = e.replace("\\pi", "pi")

    for _ in range(10):
        new = re.sub(r'\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'((\1)/(\2))', e)
        if new == e:
            break
        e = new

    e = e.replace("^", "**")
    e = e.replace("{", "(").replace("}", ")")

    return sp.sympify(e)


def parse_expression(expr):
    try:
        result = parse_latex(expr)
        if result is None:
            raise ValueError("parse_latex returned None")
        return result
    except Exception:
        try:
            return latex_to_sympy_fallback(expr)
        except Exception:
            raise


def safe_float(expr_sympy, val):
    try:
        result = expr_sympy.subs(x, val)
        real = float(sp.re(result))
        imag = float(sp.im(result))

        if abs(imag) > 1e-6:
            return None

        return real
    except Exception:
        return None


def verify_integral(integrand, answer):
    try:
        integrand_clean = clean_latex(integrand)
        answer_clean = clean_latex(answer)

        integrand_expr = sp.simplify(parse_expression(integrand_clean))
        answer_expr = sp.simplify(parse_expression(answer_clean))

        derivative = sp.simplify(sp.diff(answer_expr, x))

        diff = sp.simplify(derivative - integrand_expr)
        if diff == 0:
            return True

        test_points = [0.3, 0.6, 0.9, 1.3, 1.8, 2.4, 3.0, -0.4, -0.8, -1.5]

        passes = 0
        fails = 0

        for val in test_points:
            d_val = safe_float(derivative, val)
            i_val = safe_float(integrand_expr, val)

            if d_val is None or i_val is None:
                continue

            if abs(d_val - i_val) < 1e-5:
                passes += 1
            else:
                fails += 1

        return fails == 0 and passes >= 3

    except Exception:
        return False


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/verify", methods=["POST"])
def verify():
    data = request.json or {}

    integrand = data.get("integrand")
    answer = data.get("answer")

    if not integrand or not answer:
        return jsonify({
            "verified": False,
            "error": "Missing integrand or answer"
        }), 400

    result = verify_integral(integrand, answer)

    return jsonify({
        "verified": result
    })


@app.route("/verify-batch", methods=["POST"])
def verify_batch():
    data = request.json or {}

    integrands = data.get("integrands", [])
    answers = data.get("answers", [])

    if len(integrands) != len(answers):
        return jsonify({
            "results": [],
            "error": "Length mismatch"
        }), 400

    results = [
        verify_integral(i, a)
        for i, a in zip(integrands, answers)
    ]

    return jsonify({
        "results": results
    })


# Local development only
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)