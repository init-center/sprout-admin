import { FC, ReactNode } from "react";
import { Space, Button, Form } from "antd";
import { Callbacks } from "rc-field-form/lib/interface";
import { Rule } from "../../../utils/valid/valid_rules";
import styles from "./TableSearch.module.scss";
export interface SearchItem {
  name: string;
  label: ReactNode;
  rules?: Rule[];
  normalize?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevValue: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allValues: { [key: string]: any }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => any;
  render: () => ReactNode;
}

interface TableSearchProps<SearchValuesType> {
  searchFields: SearchItem[];
  initialValues: SearchValuesType;
  onSearch?: Callbacks<SearchValuesType>["onFinish"];
  onValuesChange?: Callbacks<SearchValuesType>["onValuesChange"];
}

const TableSearchWrapper = <
  SearchValuesType extends Record<string, unknown>
>() => {
  const TableSearch: FC<TableSearchProps<SearchValuesType>> = ({
    searchFields,
    onSearch,
    initialValues,
    onValuesChange,
  }) => {
    return (
      <div className={styles["table-search"]}>
        <h4>条件筛选</h4>
        <Form
          className={styles["list-filter"]}
          onFinish={onSearch}
          initialValues={initialValues}
          onValuesChange={onValuesChange}
        >
          <Space align="start" wrap>
            {searchFields.map((searchField) => {
              const {
                name,
                label,
                rules = [],
                normalize,
                render,
              } = searchField;
              return (
                <Form.Item
                  name={name}
                  rules={rules}
                  key={name}
                  label={label}
                  normalize={normalize}
                >
                  {render()}
                </Form.Item>
              );
            })}
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Space>
        </Form>
      </div>
    );
  };
  return TableSearch;
};

export default TableSearchWrapper;
