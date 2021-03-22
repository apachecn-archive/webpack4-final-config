import React, { FC } from "react";

import "./styles/index.css";
import "./styles/less.less";
import "./styles/sass.scss";

export const App: FC = () => {
  return (
    <div>
      app
      <div className="css">css</div>
      <div className="less">less</div>
      <div className="sass">sass</div>
    </div>
  );
};
