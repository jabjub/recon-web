// Filename - components/SidebarData.js

import React from "react";
import { FaChartPie } from "react-icons/fa";
import { VscOutput } from "react-icons/vsc";
import { SiRetool } from "react-icons/si";

export const SidebarData = [
  {
    title: "Scan",
    path: "/", // Home path is also the Scan page
    icon: <SiRetool />,
  },
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <FaChartPie />,
  },
  {
    title: "Vulnerabilities",
    path: "/Vulnerabilities",
    icon: <VscOutput />,
  },
];
