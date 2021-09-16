import React, { FC } from "react";
import { isEmpty } from "lodash";
import "./styles/index.css";
import "./styles/less.less";
import "./styles/sass.scss";

export const App: FC = () => {
  console.log("isEmpty", isEmpty(""));

  return (
    <div>
      app
      <div className="css">css</div>
      <div className="less">less</div>
      <div className="sass">sass</div>
    </div>
  );
};
