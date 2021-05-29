import { enableES5, produce } from "immer";

export default function produces(...args) {
  enableES5();
  return produce(...args);
}
