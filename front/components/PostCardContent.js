import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";

const PostCardContent = ({ postData }) => {
  // 첫 번째 게시글 #해시테그 #익스프레스

  // slice : # 을 없에기 위하여 사용
  return (
    <div>
      {postData.split(/(#[^\s#]+)/g).map((v, i) => {
        if (v.match(/(#[^\s#]+)/)) {
          return (
            <Link href={`/hashtag/${v.slice(1)}`} key={i}>
              <a href="#/">{v}</a>
            </Link>
          );
        }
        return v;
      })}
    </div>
  );
};

PostCardContent.prototype = {
  postData: PropTypes.string.isRequired,
};

export default PostCardContent;
