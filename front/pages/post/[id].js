import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { END } from "redux-saga";
import axios from "axios";
import { useSelector } from "react-redux";

import wrapper from "../../store/configureStore";
import { LOAD_MY_INFO_REQUEST } from "../../reducers/user";
import { LOAD_POST_REQUEST } from "../../reducers/post";
import AppLayout from "../../components/AppLayout";
import PostCard from "../../components/PostCard";

const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  const { singlePost } = useSelector((state) => state.post);

  /*
  if (ReadableStreamDefaultController.isFallback) {
    return <div>로딩중...</div>;
  }
  */

  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname}
          님의 글
        </title>
        <meta name="description" content={singlePost.content} />
        <meta property="og:title" content={singlePost.User.nickname} />
        <meta property="og:description" content={singlePost.content} />
        <meta
          property="og:image"
          content={
            singlePost.Images[0]
              ? singlePost.Images[0].src
              : `https://nodebird.com/favicon.ico`
          }
        />
        <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
      </Head>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

/*
export async function getStaticProps() {
  return {
    paths: [
      { params: { id: "1 " } },
      { params: { id: "2 " } },
      { params: { id: "3 " } },
    ],
    fallback: false,
  };
}
*/

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

    context.store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });

    context.store.dispatch({
      type: LOAD_POST_REQUEST,
      data: context.params.id, // useRouter 에서는 context.params.id or context.query.id 접근이 가능해서 다미나믹 라우팅 값을 전달 받을수 있다.
    });

    context.store.dispatch(END);
    await context.store.sagaTask.toPromise();
  }
);

export default Post;
