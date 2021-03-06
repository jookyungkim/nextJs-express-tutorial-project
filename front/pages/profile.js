import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Router from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { END } from "redux-saga";
import axios from "axios";
import useSWR from "swr";

import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";

import { LOAD_POSTS_REQUEST } from "../reducers/post";
import { LOAD_MY_INFO_REQUEST } from "../reducers/user";
import wrapper from "../store/configureStore";
import { backUrl } from "../config/config";

import {
  LOAD_FOLLOWERS_REQUEST,
  LOAD_FOLLOWINGS_REQUEST,
} from "../reducers/user";

const fetcher = (url) =>
  axios.get(url, {}, { withCredentials: true }).then((result) => result.data);

const Profile = () => {
  const dispatch = useDispatch();

  const { me } = useSelector((state) => state.user);
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);

  const { data: followersData, error: followerError } = useSWR(
    `${backUrl}/user/followers?limit=${followersLimit}`,
    fetcher
  );
  const { data: followingsData, error: followingError } = useSWR(
    `${backUrl}/user/followings?limit=${followingsLimit}`,
    fetcher
  );

  useEffect(() => {
    if (!(me && me.id)) {
      Router.push("/");
    }
  }, [me && me.id]);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, []);

  /*
  useEffect(() => {
    dispatch({
      type: LOAD_FOLLOWERS_REQUEST,
    });

    dispatch({
      type: LOAD_FOLLOWINGS_REQUEST,
    });
  }, []);
 */

  if (!me) {
    return "내 정보 로딩중...";
  }

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return <div> 팔로잉/팔요워 로딩 중 에러가 발생합니다. </div>;
  }

  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList
          header="팔로잉"
          data={followingsData}
          onClickMore={loadMoreFollowings}
          loading={!followingsData && !followingError}
        />
        <FollowList
          header="팔로워"
          data={followersData}
          onClickMore={loadMoreFollowers}
          loading={!followersData && !followerError}
        />
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  async (context) => {
    // **** 매우중요 ****
    // 쿠키를 프론트 서버에서 벡엔드 서버로 보내준다. 브라우저는 간섭을 못한다.
    // 실제 내 pc 쿠키가 있을때만 넣어주고 없을때는 "" 초기화 해주기
    const cookie = context.req ? context.req.headers.cookie : "";
    axios.defaults.headers.Cookie = "";
    if (context.req && cookie) {
      axios.defaults.headers.Cookie = cookie;
    }

    console.log("profile-getServerSideProps-cookie", cookie);

    context.store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });

    context.store.dispatch(END);
    await context.store.sagaTask.toPromise();
  }
);

// 프런트 서버에서만 실행되는 부분

export default Profile;
