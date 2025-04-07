import type { Block } from "@blocknote/core";
import { atom, useAtom } from "jotai";

export const blocksAtom = atom<Block[]>([]);

export const useBlocksAtom = () => {
  return useAtom(blocksAtom);
};
