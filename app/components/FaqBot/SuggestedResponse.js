"use client";

import styles from "./ChatWidget.module.css";

const SuggestedResponse = ({ text, onClick }) => {
  return (
    <button className={styles.suggestedResponse} onClick={() => onClick(text)}>
      {text}
    </button>
  );
};

export default SuggestedResponse;
