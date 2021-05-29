import { all, fork } from "redux-saga/effects";
import axios from "axios";
import userSaga from "./user";
import postSaga from "./post";

axios.defaults.baseURL = "http://localhost:3065";
// 서버에 쿠리전달할때 공통적으로 사용된다. cors 문제 해결
axios.defaults.withCredentials = true;
/** rootSaga를 하나만들고 안에다 작성한다.
 *  크리에이터 기능을 한다.
 *  fork or call 함수 실행한다.
 *  all은 fork or call 을 집합체를 동시에 실행해준다.
 *  all or fork or call 이런 함수 앞에 yield 무조건 들어가야한다.
 *  fork 는 비동기 함수이다. 결과값가 상관없이 밑에 코드를 실행된다
 *  call 은 동기 함수이다. 결과값을 기다려서 밑에 코드가 실행해준다.
 *  call 은 await 비슷한 역활은 한다.
 */

/**
 *  take === desfatch 동일 단점은 한번동작하면 끝이다.
 *  takeEvery 여러번 동작할수 있다.
 *  takeLatest 실수로 여러번 클릭해도 마지막 하나만 desfatch 된다.
 */

export default function* rootSaga() {
  yield all([fork(userSaga), fork(postSaga)]);
}
