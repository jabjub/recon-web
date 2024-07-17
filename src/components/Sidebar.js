import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./SidebarData";
import SubMenu from "./SubMenu";
import { IconContext } from "react-icons/lib";

const Nav = styled.div`
  background: #15171c;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: -webkit-sticky; /* For Safari */
  position: sticky;
  top: 0;
  z-index: 10; /* Ensures it stays on top of other content */
`;

const NavIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const SidebarNav = styled.nav`
  background: #15171c;
  width: 250px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: ${(props) => (props.open ? "0" : "-250px")}; /* Adjusted width */
  transition: 350ms;
  z-index: 10;
`;

const SidebarWrap = styled.div`
  width: 100%;
`;

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <>
      <IconContext.Provider value={{ color: "#38b000" }}>
        <Nav>
          <NavIcon to="#">
            <FaIcons.FaBars onClick={toggleSidebar} />
          </NavIcon>
          <h1
            style={{
              textAlign: "center",
              marginLeft: "200px",
              color: "#38b000",
              fontSize: "36px",
            }}
          >
            <b>ReconEnhance</b>
          </h1>
        </Nav>
        <SidebarNav open={sidebarOpen}>
          {" "}
          {/* Changed to 'open' */}
          <SidebarWrap>
            <NavIcon to="#">
              <AiIcons.AiOutlineClose onClick={toggleSidebar} />
            </NavIcon>
            {SidebarData.map((item, index) => {
              return <SubMenu item={item} key={index} />;
            })}
          </SidebarWrap>
        </SidebarNav>
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;
