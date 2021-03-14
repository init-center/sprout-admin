import React, { FC, useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import ReactEcharts from "echarts-for-react";
import { Card, Statistic, Row, Col, message, Empty } from "antd";
import styles from "./Home.module.scss";
import {
  BaseAnalysisType,
  CategoriesPostsCountList,
  ComplexAnalysisList,
  PostAnalysisType,
  PostViewsRank,
  TagsPostsCountList,
} from "../../types";
import http, { ResponseData } from "../../utils/http/http";

const Home: FC = () => {
  const [userAnalysis, setUserAnalysis] = useState<BaseAnalysisType>({
    total: 0,
    recentIncreaseList: [],
    todayIncrease: 0,
  });

  const [commentAnalysis, setCommentAnalysis] = useState<BaseAnalysisType>({
    total: 0,
    recentIncreaseList: [],
    todayIncrease: 0,
  });

  const [viewsAnalysis, setViewsAnalysis] = useState<BaseAnalysisType>({
    total: 0,
    recentIncreaseList: [],
    todayIncrease: 0,
  });

  const [postAnalysis, setPostAnalysis] = useState<PostAnalysisType>({
    total: 0,
    average: 0,
    monthIncrease: 0,
  });

  const [complexAnalysis, setComplexAnalysis] = useState<ComplexAnalysisList>(
    []
  );

  const [postViewsRank, setPostViewsRank] = useState<PostViewsRank>([]);

  const [
    categoriesPostsCountList,
    setCategoriesPostsCountList,
  ] = useState<CategoriesPostsCountList>([]);

  const [
    tagsPostsCountList,
    setTagsPostsCountList,
  ] = useState<TagsPostsCountList>([]);

  const fetchUserAnalysis = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<BaseAnalysisType>>(
        `/admin/analysis/users`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setUserAnalysis(
          response.data.data ?? {
            total: 0,
            recentIncreaseList: [],
            todayIncrease: 0,
          }
        );
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const fetchCommentAnalysis = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<BaseAnalysisType>>(
        `/admin/analysis/comments`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setCommentAnalysis(
          response.data.data ?? {
            total: 0,
            recentIncreaseList: [],
            todayIncrease: 0,
          }
        );
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const fetchViewsAnalysis = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<BaseAnalysisType>>(
        `/admin/analysis/views`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setViewsAnalysis(
          response.data.data ?? {
            total: 0,
            recentIncreaseList: [],
            todayIncrease: 0,
          }
        );
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const fetchPostAnalysis = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<PostAnalysisType>>(
        `/admin/analysis/posts`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setPostAnalysis(
          response.data.data ?? {
            total: 0,
            average: 0,
            monthIncrease: 0,
          }
        );
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const fetchComplexAnalysis = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<ComplexAnalysisList>>(
        `/admin/analysis/complex`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setComplexAnalysis(response.data.data ?? []);
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const fetchPostViewsRank = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<PostViewsRank>>(
        `/admin/analysis/posts/viewsrank`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setPostViewsRank(response.data.data ?? []);
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const fetchCategoriesPostsCountList = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<CategoriesPostsCountList>>(
        `/admin/analysis/categories/postscount`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setCategoriesPostsCountList(response.data.data ?? []);
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  const fetchTagsPostsCountList = useCallback(async () => {
    try {
      const response = await http.get<ResponseData<TagsPostsCountList>>(
        `/admin/analysis/tags/postscount`
      );
      if (response.status === 200 && response.data.code === 2000) {
        setTagsPostsCountList(response.data.data ?? []);
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) {
        message.error(msg);
      }
    }
  }, []);

  useEffect(() => {
    fetchUserAnalysis();
    fetchCommentAnalysis();
    fetchViewsAnalysis();
    fetchPostAnalysis();
    fetchPostViewsRank();
    fetchCategoriesPostsCountList();
    fetchTagsPostsCountList();
    fetchComplexAnalysis();
  }, [
    fetchUserAnalysis,
    fetchCommentAnalysis,
    fetchPostAnalysis,
    fetchPostViewsRank,
    fetchCategoriesPostsCountList,
    fetchTagsPostsCountList,
    fetchViewsAnalysis,
    fetchComplexAnalysis,
  ]);

  const getViewsChartOptions = (): echarts.EChartOption => {
    const xData = viewsAnalysis.recentIncreaseList.map((item) => item.date);
    const seriesData = viewsAnalysis.recentIncreaseList.map(
      (item) => item.increase
    );
    return {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xData,
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          data: seriesData,
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
        top: 6,
        right: 6,
        bottom: 6,
        left: 6,
      },
    };
  };

  const getUsersChartOptions = (): echarts.EChartOption => {
    const xData = userAnalysis.recentIncreaseList.map((item) => item.date);
    const seriesData = userAnalysis.recentIncreaseList.map(
      (item) => item.increase
    );
    return {
      xAxis: {
        type: "category",
        data: xData,
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          data: seriesData,
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
    const xData = commentAnalysis.recentIncreaseList.map((item) => item.date);
    const seriesData = commentAnalysis.recentIncreaseList.map(
      (item) => item.increase
    );
    return {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xData,
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          data: seriesData,
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
        top: 6,
        right: 6,
        bottom: 6,
        left: 6,
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
          data: [postAnalysis.monthIncrease],
          type: "bar",
          barWidth: 10,
          itemStyle: {
            color: "#13c2c2",
          },
        },
        {
          stack: "文章数量",
          data: [postAnalysis.average],
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
        dimensions: ["月份", "访问量", "评论量", "用户量"],
        source: complexAnalysis,
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

  const getPostCategoriesChartOptions = (): echarts.EChartOption => {
    return {
      title: {
        text: "文章分类分布",
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
        data: categoriesPostsCountList.map((item) => item.name),
      },
      series: [
        {
          name: "文章占比",
          type: "pie",
          radius: "55%",
          center: ["50%", "65%"],
          data: categoriesPostsCountList,
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
        data: tagsPostsCountList.map((item) => item.name),
      },
      series: [
        {
          name: "文章占比",
          type: "pie",
          radius: "55%",
          center: ["50%", "65%"],
          data: tagsPostsCountList,
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
              <Statistic title="访问总量" value={viewsAnalysis.total} />
              <ReactEcharts
                className={styles["card-chart"]}
                option={getViewsChartOptions()}
              />
              <div className={styles["card-bottom"]}>
                {" "}
                今日访问量 {viewsAnalysis.todayIncrease} 次
              </div>
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
              <Statistic title="用户总量" value={userAnalysis.total} />
              <ReactEcharts
                className={styles["card-chart"]}
                option={getUsersChartOptions()}
              />
              <div className={styles["card-bottom"]}>
                今日新增用户 {userAnalysis.todayIncrease} 人
              </div>
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
              <Statistic title="评论总量" value={commentAnalysis.total} />
              <ReactEcharts
                className={styles["card-chart"]}
                option={getCommentsChartOptions()}
              />
              <div className={styles["card-bottom"]}>
                今日新增评论 {commentAnalysis.todayIncrease} 条
              </div>
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
              <Statistic title="文章总量" value={postAnalysis.total} />
              <ReactEcharts
                className={styles["card-chart"]}
                option={getPostTargetChartOptions()}
              />
              <div className={styles["card-bottom"]}>
                本月发表 {postAnalysis.monthIncrease} 篇， 月均{" "}
                {postAnalysis.average} 篇
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
              {postViewsRank.length > 0 ? (
                <ul className={styles["top-views-post-list"]}>
                  {postViewsRank.map((post, idx) => (
                    <li
                      className={styles["top-views-post-item"]}
                      key={post.pid}
                    >
                      <span className={styles["rank-number"]}>{idx + 1}</span>
                      <a
                        href={`https://init.center/posts/${post.pid}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {post.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty />
              )}
            </Col>
          </Row>
        </Card>
        <Card className={styles["post-tags-chart-box"]}>
          <Row className={styles["data-analysis-row"]}>
            <Col md={12} xs={24} sm={24} lg={12} xl={12}>
              <ReactEcharts
                className={styles["card-chart"]}
                option={getPostCategoriesChartOptions()}
              />
            </Col>
            <Col md={12} xs={24} sm={24} lg={12} xl={12}>
              <ReactEcharts
                className={styles["card-chart"]}
                option={getPostTagsChartOptions()}
              />
            </Col>
          </Row>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Home;
