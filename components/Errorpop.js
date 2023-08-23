"use client";
import { css } from "@emotion/react";
import variable from "../styles/_var.module.scss";
import styles from "./Errorpop.module.scss";
/** @jsxImportSource @emotion/react */

export default function Errorpop({
  posX = 200,
  posY = 300,
  width = 200,
  cssOverrides,
}) {
  return (
    <div
      className={styles["error-pop--wrap"]}
      css={css`
        top: ${posY};
        left: ${posX};
        width: ${width};
      `}
    >
      <img
        className={styles["errorpop1--style"]}
        src="/errorPop1.png"
        css={cssOverrides}
      ></img>
    </div>
  );
}
