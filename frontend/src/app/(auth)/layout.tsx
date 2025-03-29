import { type PropsWithChildren } from "react";

type Props = PropsWithChildren;

export default function layout({ children }: Props) {
  return <div>{children}</div>;
}
