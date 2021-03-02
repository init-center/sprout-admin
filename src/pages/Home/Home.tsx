import React, { FC } from "react";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import ReactEcharts from "echarts-for-react";
import { Card, Statistic, Row, Col } from "antd";
import styles from "./Home.module.scss";

const Home: FC = () => {
  const getViewsChartOptions = (): echarts.EChartOption => {
    return {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          data: [820, 1932, 901, 2134, 3290, 1330, 2320],
          type: "line",
          smooth: true,
          lineStyle: {
            width: 0,
          },
          symbol: "circle",
          showSymbol: false,
          symbolSize: 1,
          areaStyle: {
            color: "#7e57c2",
            opacity: 1,
          },
          itemStyle: {
            color: "#7e57c2",
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
      ],
      tooltip: {
        show: true,
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#666",
        },
        extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);",
        axisPointer: {
          type: "none",
        },
      },
      grid: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    };
  };

  const getUsersChartOptions = (): echarts.EChartOption => {
    return {
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          data: [820, 1932, 901, 2134, 3290, 1330, 2320],
          type: "bar",
          itemStyle: {
            color: "#03a9f4",
          },
        },
      ],
      tooltip: {
        show: true,
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#666",
        },
        extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);",
        axisPointer: {
          type: "none",
        },
      },
      grid: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    };
  };

  const getCommentsChartOptions = (): echarts.EChartOption => {
    return {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          data: [820, 1932, 901, 2134, 3290, 1330, 2320],
          type: "line",
          smooth: true,
          symbol: "circle",
          showSymbol: false,
          symbolSize: 1,
          itemStyle: {
            color: "#E91E63",
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
      ],
      tooltip: {
        show: true,
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#666",
        },
        extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);",
        axisPointer: {
          type: "none",
        },
      },
      grid: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    };
  };

  const getPostTargetChartOptions = (): echarts.EChartOption => {
    return {
      xAxis: {
        type: "value",
        show: false,
      },
      yAxis: {
        type: "category",
        show: false,
      },
      series: [
        {
          stack: "文章数量",
          data: [160],
          type: "bar",
          barWidth: 10,
          itemStyle: {
            color: "#13c2c2",
          },
        },
        {
          stack: "文章数量",
          data: [200],
          type: "bar",
          itemStyle: {
            color: "#eee",
          },
        },
      ],
      grid: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
    };
  };

  const getDatasetChartOptions = (): echarts.EChartOption => {
    return {
      dataset: {
        dimensions: ["product", "访问量", "用户量", "评论量"],
        source: [
          { product: "八月", 访问量: 43.3, 用户量: 85.8, 评论量: 93.7 },
          { product: "九月", 访问量: 83.1, 用户量: 73.4, 评论量: 55.1 },
          { product: "十月", 访问量: 86.4, 用户量: 65.2, 评论量: 82.5 },
          { product: "十一月", 访问量: 72.4, 用户量: 53.9, 评论量: 39.1 },
          { product: "十二月", 访问量: 20.4, 用户量: 10.9, 评论量: 2.1 },
        ],
      },
      xAxis: {
        type: "category",
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false,
        },
      },
      series: [
        {
          type: "bar",
          itemStyle: {
            color: "#03a9f4",
          },
        },
        {
          type: "bar",
          itemStyle: {
            color: "#13c2c2",
          },
        },
        {
          type: "bar",
          itemStyle: {
            color: "#e91e63",
          },
        },
      ],
      legend: {
        right: "10%",
      },
      tooltip: {
        show: true,
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#666",
        },
        extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);",
        axisPointer: {
          type: "none",
        },
      },
    };
  };

  const getPostTagsChartOptions = (): echarts.EChartOption => {
    return {
      title: {
        text: "文章标签分布",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textStyle: {
          color: "#666",
        },
        extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "right",
        data: ["JavaScript", "Typescript", "Golang", "HTML", "CSS"],
      },
      series: [
        {
          name: "文章占比",
          type: "pie",
          radius: "55%",
          center: ["50%", "60%"],
          data: [
            { value: 335, name: "JavaScript" },
            { value: 310, name: "Typescript" },
            { value: 234, name: "Golang" },
            { value: 135, name: "HTML" },
            { value: 1548, name: "CSS" },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  };

  return (
    <AdminLayout>
      <div className={styles.home}>
        <Row className={styles["top-card-box"]}>
          <Col
            xl={6}
            sm={12}
            xs={24}
            md={12}
            lg={12}
            className={styles["card-wrapper"]}
          >
            <Card className={styles.card}>
              <Statistic title="访问总量" value={112893} />
              <ReactEcharts
                className={styles["card-chart"]}
                option={getViewsChartOptions()}
              />
              <div className={styles["card-bottom"]}> 今日访问量 123 次</div>
            </Card>
          </Col>
          <Col
            xl={6}
            sm={12}
            xs={24}
            md={12}
            lg={12}
            className={styles["card-wrapper"]}
          >
            <Card className={styles.card}>
              <Statistic title="用户总量" value={112893} />
              <ReactEcharts
                className={styles["card-chart"]}
                option={getUsersChartOptions()}
              />
              <div className={styles["card-bottom"]}> 今日新增用户 25 人</div>
            </Card>
          </Col>
          <Col
            xl={6}
            sm={12}
            xs={24}
            md={12}
            lg={12}
            className={styles["card-wrapper"]}
          >
            <Card className={styles.card}>
              <Statistic title="评论总量" value={112893} />
              <ReactEcharts
                className={styles["card-chart"]}
                option={getCommentsChartOptions()}
              />
              <div className={styles["card-bottom"]}> 今日新增评论 18 条</div>
            </Card>
          </Col>
          <Col
            xl={6}
            sm={12}
            xs={24}
            md={12}
            lg={12}
            className={styles["card-wrapper"]}
          >
            <Card className={styles.card}>
              <Statistic title="文章总量" value={112893} />
              <ReactEcharts
                className={styles["card-chart"]}
                option={getPostTargetChartOptions()}
              />
              <div className={styles["card-bottom"]}>
                本月发表 1 篇， 目标 2 篇
              </div>
            </Card>
          </Col>
        </Row>
        <Card className={styles["data-analysis-box"]}>
          <Row className={styles["data-analysis-row"]}>
            <Col md={12} xs={24} sm={24} lg={12} xl={16}>
              <h4 className={styles["data-analysis-title"]}>
                新增访问量/用户量/评论量
              </h4>
              <div className={styles["data-analysis-chart"]}>
                <ReactEcharts
                  className={styles["card-chart"]}
                  option={getDatasetChartOptions()}
                />
              </div>
            </Col>
            <Col md={12} xs={24} sm={24} lg={12} xl={8}>
              <h4 className={styles["data-analysis-title"]}>浏览量文章排名</h4>
              <ul className={styles["top-views-post-list"]}>
                <li className={styles["top-views-post-item"]}>
                  <span className={styles["rank-number"]}>1</span>
                  这是第一篇文章
                </li>
                <li className={styles["top-views-post-item"]}>
                  <span className={styles["rank-number"]}>2</span>
                  这是第二篇文章
                </li>
                <li className={styles["top-views-post-item"]}>
                  <span className={styles["rank-number"]}>3</span>
                  这是第三篇文章
                </li>
                <li className={styles["top-views-post-item"]}>
                  <span className={styles["rank-number"]}>4</span>
                  这是第四篇文章
                </li>
                <li className={styles["top-views-post-item"]}>
                  <span className={styles["rank-number"]}>5 </span>
                  这是第五篇文章
                </li>
                <li className={styles["top-views-post-item"]}>
                  <span className={styles["rank-number"]}>6</span>
                  这是第六篇文章
                </li>
                <li className={styles["top-views-post-item"]}>
                  <span className={styles["rank-number"]}>7</span>
                  这是第七篇文章
                </li>
              </ul>
            </Col>
          </Row>
        </Card>
        <Card className={styles["post-tags-chart-box"]}>
          <ReactEcharts
            className={styles["card-chart"]}
            option={getPostTagsChartOptions()}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Home;
