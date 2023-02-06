import { describe, expect, it } from "vitest";
import { sanitizeParentheses } from "$src/coding-contracts/solutions/sanitizeParentheses";

const testCases = [
  {
    input: "(a)))()a)(()))(",
    output: ["(a(a)(()))", "(a()a(()))", "(a()a)(())", "(a)(a(()))", "(a)(a)(())", "(a)()a(())"],
  },
  {
    input: ")(",
    output: [""],
  },
  {
    input: "()())()",
    output: ["()()()", "(())()"],
  },
  {
    input: "(a)())()",
    output: ["(a)()()", "(a())()"],
  },
  {
    input: "()(a))(",
    output: ["((a))", "()(a)"],
  },
  { input: ")(()))(()))()a((", output: ["(()(()))()a", "(())(())()a"] },
  { input: "(((a((a))", output: ["a((a))", "(a(a))", "((aa))"] },
  {
    input: "(((())(((a(a(a)((a)",
    output: [
      "(())aa(a)(a)",
      "(())a(aa)(a)",
      "(())a(a(a)a)",
      "(())(aaa)(a)",
      "(())(aa(a)a)",
      "(())(a(aa)a)",
      "(())((aaa)a)",
      "((())aaa)(a)",
      "((())aa(a)a)",
      "((())a(aa)a)",
      "((())(aaa)a)",
      "(((())aaa)a)",
    ],
  },
  {
    input: ")((((()a(())))()a())",
    output: [
      "(((()a(())))()a())",
      "((((()a())))()a())",
      "((((()a(()))))a())",
      "((((()a(())))()a))",
    ],
  },
  { input: "(()))(", output: ["(())"] },
  {
    input: "()(()(a(())a(()))a",
    output: ["()()(a(())a(()))a", "()(()a(())a(()))a", "()(()(a())a(()))a", "()(()(a(())a()))a"],
  },
  { input: ")))a))))a)aa", output: ["aaaa"] },
  { input: "(()))((aa)(", output: ["(())(aa)"] },
];

describe("sanitizeParentheses", () => {
  for (const testCase of testCases) {
    it(testCase.input, () => {
      expect(sanitizeParentheses(testCase.input).sort()).toEqual(testCase.output.sort());
    });
  }
});
