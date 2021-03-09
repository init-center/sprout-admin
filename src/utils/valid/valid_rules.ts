import { RuleObject, StoreValue } from "rc-field-form/lib/interface";
export type { Rule } from "rc-field-form/lib/interface";

export type Validator = (
  rule: RuleObject,
  value: StoreValue,
  callback: (error?: string) => void
) => Promise<void | unknown> | void;

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
    const nameRegex = /^[A-Za-z\p{sc=Han}][\-_]?([A-Za-z0-9\p{sc=Han}]+[\-_]?)*[A-Za-z0-9\p{sc=Han}]$/u;
    if (!nameRegex.test(value)) {
      return Promise.reject("请输入符合规范的用户名！");
    } else {
      return Promise.resolve();
    }
  } catch (err) {
    return Promise.reject("");
  }
};
