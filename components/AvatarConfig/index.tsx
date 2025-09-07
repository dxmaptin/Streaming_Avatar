import React, { useMemo, useState } from "react";

import { Input } from "../Input";
import { Select } from "../Select";

import { Field } from "./Field";

import { STT_LANGUAGE_LIST, AVATARS } from "@/app/lib/constants";
import { PRESET_AVATARS } from "@/app/lib/presets";

interface AvatarConfigProps {
  onConfigChange: (config: any) => void;
  config: any;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  onConfigChange,
  config,
}) => {
  const onChange = <T extends keyof any>(
    key: T,
    value: any,
  ) => {
    onConfigChange({ ...config, [key]: value });
  };
  const [showMore, setShowMore] = useState<boolean>(false);
  const PRESETS = (PRESET_AVATARS && PRESET_AVATARS.length > 0)
    ? PRESET_AVATARS
    : AVATARS;
  const hasPresets = PRESETS.length > 0;

  const selectedAvatar = useMemo(() => {
    if (!hasPresets)
      return { isCustom: true, name: "Custom Avatar ID", avatarId: null };
    const avatar = PRESETS.find((a: any) => a.avatar_id === config.avatarName) as any;
    if (!avatar)
      return { isCustom: true, name: "Custom Avatar ID", avatarId: null };
    return { isCustom: false, name: avatar.name, avatarId: avatar.avatar_id };
  }, [config.avatarName, hasPresets, PRESETS]);

  return (
    <div className="relative flex flex-col gap-4 w-[550px] py-8 max-h-full overflow-y-auto px-4">
      <Field label="Custom Knowledge Base ID">
        <Input
          placeholder="Enter custom knowledge base ID"
          value={config.knowledgeId}
          onChange={(value) => onChange("knowledgeId", value)}
        />
      </Field>
      <Field label="Avatar ID">
        {hasPresets ? (
          <Select
            isSelected={(option) =>
              typeof option === "string"
                ? !!selectedAvatar?.isCustom
                : (option as any).avatar_id === selectedAvatar?.avatarId
            }
            options={[...(PRESETS as any[]), "CUSTOM"] as any[]}
            placeholder="Select Avatar"
            renderOption={(option) => {
              return typeof option === "string" ? "Custom Avatar ID" : (option as any).name;
            }}
            value={
              selectedAvatar?.isCustom ? "Custom Avatar ID" : selectedAvatar?.name
            }
            onSelect={(option) => {
              if (typeof option === "string") {
                onChange("avatarName", "");
              } else {
                onChange("avatarName", (option as any).avatar_id);
              }
            }}
          />
        ) : (
          <Input
            placeholder="Enter avatar ID"
            value={config.avatarName}
            onChange={(value) => onChange("avatarName", value)}
          />
        )}
      </Field>
      {hasPresets && selectedAvatar?.isCustom && (
        <Field label="Custom Avatar ID">
          <Input
            placeholder="Enter custom avatar ID"
            value={config.avatarName}
            onChange={(value) => onChange("avatarName", value)}
          />
        </Field>
      )}
      <Field label="Language">
        <Select
          isSelected={(option) => option.value === config.language}
          options={STT_LANGUAGE_LIST}
          renderOption={(option) => option.label}
          value={
            STT_LANGUAGE_LIST.find((option) => option.value === config.language)
              ?.label
          }
          onSelect={(option) => onChange("language", option.value)}
        />
      </Field>
      
      {showMore && (
        <>
          <h1 className="text-zinc-100 w-full text-center mt-5">
            Voice Settings
          </h1>
          <Field label="Custom Voice ID">
            <Input
              placeholder="Enter custom voice ID"
              value={config.voice?.voiceId}
              onChange={(value) =>
                onChange("voice", { ...config.voice, voiceId: value })
              }
            />
          </Field>
          <h1 className="text-zinc-100 w-full text-center mt-5">
            STT Settings
          </h1>
          <div className="text-xs text-zinc-400">Video will be rendered by Beyond Presence (audio-to-video) after LiveKit connects and the agent speaks.</div>
        </>
      )}
      <button
        className="text-zinc-400 text-sm cursor-pointer w-full text-center bg-transparent"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Show less" : "Show more..."}
      </button>
    </div>
  );
};
