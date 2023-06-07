import { useEffect } from "react";
import { startNewConversation } from "../../state/conversations";
import { useAppDispatch } from "../../state/store";
import { useLiveQuery } from "dexie-react-hooks";
import { dbSelectChatConfigs } from "../../db/db-selectors";

const SHORTCUTS: Record<string, string> = {
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  KeyF: "f",
  Space: "Space",
};

export const useOpenChatConfigShortcut = () => {
  const dispatch = useAppDispatch();
  const chatConfigs = useLiveQuery(() => dbSelectChatConfigs(), []);

  useEffect(() => {
    if (chatConfigs == null) {
      return;
    }

    const getChatConfigId = (key: string): number | "default" | null => {
      const shortcut = SHORTCUTS[key];
      if (shortcut == null) {
        return null;
      }
      if (shortcut === "Space") {
        return "default";
      }
      const triggerChatConfigs = chatConfigs.filter(
        (c) => c.shortcut === shortcut
      );
      if (triggerChatConfigs.length === 0) {
        return null;
      }
      // TODO(gab): don't allow setting same shortcuts in settings
      if (triggerChatConfigs.length > 1) {
        window.alert(
          `Multiple shortcuts for '${shortcut}' is set. Keep only one!`
        );
      }
      return triggerChatConfigs[0].id;
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (!e.altKey) {
        return;
      }
      const chatConfigId = getChatConfigId(e.code);
      if (chatConfigId == null) {
        return;
      }
      dispatch(
        startNewConversation({
          openInNewPane: e.ctrlKey,
          chatConfig: chatConfigId === "default" ? undefined : chatConfigId,
        })
      );
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [dispatch, chatConfigs]);
};
