import type { Block } from "@blocknote/core";
import type { TBlockItem } from "~/api/blocks";

export const convertFromBlockNoteFormat = (blocks: Block[]): TBlockItem[] => {
  const result: TBlockItem[] = [];

  blocks.forEach((block, index) => {
    result.push({
      id: block.id,
      type: block.type,
      content: JSON.stringify(block.content),
      props: JSON.stringify(block.props),
      position: index,
    });

    if (block.children && block.children.length > 0) {
      processChildren(block.children, result);
    }
  });

  return result;
};

const processChildren = (children: Block[], result: TBlockItem[]) => {
  children.forEach((child, index) => {
    const content = JSON.stringify(child.content);
    const props = JSON.stringify(child.props);

    result.push({
      id: child.id,
      type: child.type,
      content,
      props,
      position: index,
    });

    if (child.children && child.children.length > 0) {
      processChildren(child.children, result);
    }
  });
};

export const convertToBlockNoteFormat = (blocks: TBlockItem[]) => {
  const blocksByParent = new Map<string | null, TBlockItem[]>();

  blocks.forEach((block) => {
    const parentId = block.parent_id || null;
    if (!blocksByParent.has(parentId)) {
      blocksByParent.set(parentId, []);
    }
    blocksByParent.get(parentId)!.push(block);
  });

  const buildTree = (parentId: string | null): any[] => {
    const children = blocksByParent.get(parentId) || [];

    children.sort((a, b) => a?.position! - b?.position!);

    return children.map((block) => {
      let parsedContent;
      let persedProps;
      try {
        parsedContent = JSON.parse(block.content);
        persedProps = JSON.parse(block?.props || "[]");
      } catch (e) {
        console.error("Failed to parse block content:", block.content);
        parsedContent = [];
        persedProps = [];
      }

      const blockChildren = buildTree(block.id!);

      return {
        id: String(block.id),
        type: block.type,
        content: parsedContent,
        props: persedProps,
        children: blockChildren,
      };
    });
  };

  return buildTree(null);
};
