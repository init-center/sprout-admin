import React, { memo } from "react";
import styles from "./Loading.module.scss";

function Loading() {
  return (
    <div className={styles.loading}>
      <div className={styles.ball}></div>
    </div>
  );
}

export default memo(Loading);
