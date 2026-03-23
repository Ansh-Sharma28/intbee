import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import sympy as sp

app = Flask(__name__)
CORS(app)

x = sp.symbols("x")


def clean_expression(expr):
    if not expr:
        return ""

    return (
        expr.replace("+ C", "")
            .replace("+C", "")
            .replace("^", "**")
            .replace("\\frac", "")
            .replace("\\left", "")
            .replace("\\right", "")
            .replace(" ", "")
            .strip()
    )


def verify_integral(integrand, answer):
    try:
        integrand_clean = clean_expression(integrand)
        answer_clean = clean_expression(answer)

        integrand_expr = sp.sympify(integrand_clean)
        answer_expr = sp.sympify(answer_clean)

        derivative = sp.diff(answer_expr, x)

        return sp.simplify(derivative - integrand_expr) == 0

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

    return jsonify({"verified": result})


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

    results = []

    for integrand, answer in zip(integrands, answers):
        results.append(verify_integral(integrand, answer))

    return jsonify({
        "results": results
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )