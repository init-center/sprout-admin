import { FC, memo } from "react";
import styles from "./Logo.module.scss";

interface LogoProps {
  isTitleShow?: boolean;
}

const Logo: FC<LogoProps> = ({ isTitleShow = true }) => {
  return (
    <div className={styles.logo}>
      <img
        className={styles.img}
        src="https://preview.pro.ant.design/static/logo.f0355d39.svg"
        alt="logo"
      />
      {isTitleShow && <h1 className={styles.title}>Sprout Admin</h1>}
    </div>
  );
};

export default memo(Logo);
