import React, { useCallback } from "react";
import { useSelector } from "react-redux"; // react 와 redux 연결
import PropTypes from "prop-types";
import Link from "next/link";
import Router from "next/router";
import { Menu, Input, Row, Col } from "antd";

import styled, { createGlobalStyle } from "styled-components";
import LoginForm from "./LoginForm";
import UserProfile from "./UserProfile";
import useInput from "../hooks/useInput";

const SearchInput = styled(Input.Search)`
  vertical-align: middle;
`;

const Global = createGlobalStyle`
    .ant-row {
        margin-right: 0 !important;
        margin-left: 0 !important;
    }

    .ant col:first-child {
        padding-left: 0 !important;
    }

    .ant-col:last-child {
        padding-right: 0 !important;
    }import useInput from '../hooks/useInput';

`;

const AppLayout = ({ children }) => {
  const [searchInput, onChangeSearchInput] = useInput("");
  const { me } = useSelector((state) => state.user);

  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
  }, [searchInput]);
  return (
    <div>
      <div>
        <Global />
        <Menu mode="horizontal">
          <Menu.Item>
            <Link href="/">
              <a href="#/">노버드</a>
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/profile">
              <a href="#/">프로필</a>
            </Link>
          </Menu.Item>
          <Menu.Item>
            <SearchInput
              enterButton
              value={searchInput}
              onChange={onChangeSearchInput}
              onSearch={onSearch}
            />
          </Menu.Item>
          <Menu.Item>
            <Link href="/register">
              <a href="#/">회원가입</a>
            </Link>
          </Menu.Item>
        </Menu>
        <Row gutter={8}>
          <Col xs={24} md={6}>
            {me ? <UserProfile /> : <LoginForm />}
          </Col>
          <Col xs={24} md={12}>
            {children}
          </Col>
          <Col xs={24} md={6}>
            <a
              href="https://www.zerocho.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              Made by zerocho
            </a>
          </Col>
        </Row>
      </div>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;
