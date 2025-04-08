import type { Block } from "@blocknote/core";
import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai/utils";

const blocksAtomFamily = atomFamily(() => atom<Block[]>([]));

export const useBlocksAtom = (noteId: string) =>
  useAtom(blocksAtomFamily(noteId));
