import { FC } from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import TableSearchWrapper, { SearchItem } from "./TableSearch/TableSearch";
import { Callbacks } from "rc-field-form/lib/interface";
import { PageType } from "../../types";
import styles from "./TableWrapper.module.scss";

interface TableProps<DataType, SearchValuesType> {
  searchFields: SearchItem[];
  searchInitialValues: SearchValuesType;
  onSearch: Callbacks<SearchValuesType>["onFinish"];
  onSearchValuesChange?: Callbacks<SearchValuesType>["onValuesChange"];
  columns: ColumnsType<DataType> | undefined;
  dataSource?: DataType[];
  scroll?: {
    x?: string | number | true;
    y?: string | number;
    scrollToFirstRowOnChange?: boolean;
  };
  page?: PageType;
  isTableLoading?: boolean;
  onPageChange?: (page: number, pageSize?: number | undefined) => void;
}

const DataTableWrapper = <
  DataType extends Record<string, unknown>,
  SearchValuesType extends Record<string, unknown>
>() => {
  const DataTable: FC<TableProps<DataType, SearchValuesType>> = ({
    searchFields = [],
    onSearch,
    columns,
    searchInitialValues,
    onSearchValuesChange,
    dataSource = [],
    isTableLoading = true,
    scroll,
    page = {
      currentPage: 1,
      size: 0,
      count: 0,
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onPageChange = () => {},
  }) => {
    const TableSearch = TableSearchWrapper<SearchValuesType>();
    const { currentPage, size, count } = page;
    const paginationConfig = {
      showSizeChanger: false,
      showQuickJumper: true,
      showTotal: () => `共${count}条`,
      pageSize: size,
      current: currentPage,
      total: count,
      onChange: onPageChange,
    };
    return (
      <div className={styles["table-wrapper"]}>
        <TableSearch
          initialValues={searchInitialValues}
          searchFields={searchFields}
          onSearch={onSearch}
          onValuesChange={onSearchValuesChange}
        />
        <Table<DataType>
          columns={columns}
          dataSource={dataSource}
          pagination={paginationConfig}
          bordered={true}
          loading={isTableLoading}
          tableLayout="fixed"
          scroll={scroll ?? {}}
          rowKey={(record) => {
            if (record.key) {
              return (record.key as string) + Date.now();
            } else if (record.id) {
              return (record.id as string) + Date.now();
            } else if (record.pid) {
              return (record.pid as string) + Date.now();
            }
            return (record.uid as string) + Date.now();
          }}
        />
      </div>
    );
  };
  return DataTable;
};

export default DataTableWrapper;
