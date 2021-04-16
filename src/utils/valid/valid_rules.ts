import { RuleObject, StoreValue } from "rc-field-form/lib/interface";
export type { Rule } from "rc-field-form/lib/interface";

export type Validator = (
  rule: RuleObject,
  value: StoreValue,
  callback: (error?: string) => void
) => Promise<void> | void;

export const validIdAndEmail: Validator = (_rule, value) => {
  try {
    const vLength = value.length;
    if (vLength === 0) {
      return Promise.reject("");
    }
    const idRegex = /^[A-Za-z][-_]?([A-Za-z0-9]+[-_]?)*[A-Za-z0-9]$/;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const validIdResult = idRegex.test(value);
    const validEmailResult = emailRegex.test(value);
    if (!validIdResult && !validEmailResult) {
      return Promise.reject("请输入符合规范的ID/Email！");
    } else {
      return Promise.resolve();
    }
  } catch (err) {
    return Promise.reject("");
  }
};

export const validId: Validator = (_rule, value) => {
  try {
    const vLength = value.length;
    if (vLength === 0) {
      return Promise.reject("");
    }

    if (vLength > 12 || vLength < 2) {
      return Promise.reject("ID长度必须在 2 - 12 位之间！");
    }
    const idRegex = /^([A-Za-z][-_]?([A-Za-z0-9]+[-_]?)*[A-Za-z0-9]){1,6}$/;
    const validIdResult = idRegex.test(value);
    if (!validIdResult) {
      return Promise.reject("请输入符合规范的ID！");
    } else {
      return Promise.resolve();
    }
  } catch (err) {
    return Promise.reject("");
  }
};

export const validEmail: Validator = (_rule, value) => {
  try {
    if (value.length === 0) {
      return Promise.reject("");
    }
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const validEmailResult = emailRegex.test(value);
    if (!validEmailResult) {
      return Promise.reject("请输入符合规范的邮箱！");
    } else {
      return Promise.resolve();
    }
  } catch (err) {
    return Promise.reject("");
  }
};

export const validPassword: Validator = (_rule, value) => {
  try {
    const vLength = value.length;
    if (vLength === 0) {
      return Promise.reject("");
    }
    if (vLength < 6 || vLength > 16) {
      return Promise.reject("密码长度必须为 6 - 16 位！");
    }

    const hasUpperCaseRegex = /[A-Z]+/;
    const hasLowerCaseRegex = /[a-z]+/;
    const hasNumberRegex = /[0-9]+/;
    if (!hasUpperCaseRegex.test(value)) {
      return Promise.reject("密码必须包含大写字母！");
    }

    if (!hasLowerCaseRegex.test(value)) {
      return Promise.reject("密码必须包含小写字母！");
    }

    if (!hasNumberRegex.test(value)) {
      return Promise.reject("密码必须包含数字！");
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.reject("");
  }
};

export const validName: Validator = (_rule, value) => {
  try {
    const vLength = value.length;
    if (vLength === 0) {
      return Promise.reject("");
    }
    if (vLength < 2 || vLength > 12) {
      return Promise.reject("用户名长度必须为 2 - 12 位！");
    }
    const nameRegex = /^(?:[A-Za-z\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DBF\u4E00-\u9FFC\uF900-\uFA6D\uFA70-\uFAD9]|\uD81B[\uDFF0\uDFF1]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])[\x2D_]?((?:[0-9A-Za-z\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DBF\u4E00-\u9FFC\uF900-\uFA6D\uFA70-\uFAD9]|\uD81B[\uDFF0\uDFF1]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])+[\x2D_]?)*(?:[0-9A-Za-z\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DBF\u4E00-\u9FFC\uF900-\uFA6D\uFA70-\uFAD9]|\uD81B[\uDFF0\uDFF1]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])$/;
    if (!nameRegex.test(value)) {
      return Promise.reject("请输入符合规范的用户名！");
    } else {
      return Promise.resolve();
    }
  } catch (err) {
    return Promise.reject("");
  }
};
