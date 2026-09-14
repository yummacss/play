"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import MonacoEditor from "@/components/panels/editor";
import Preview from "@/components/panels/preview";
import { embedCode } from "@/constants/code";
import { OpenNewWindow } from "@/icons";
import { getEmbedCodeFromUrl } from "@/utils/share";

const Embed: React.FC = () => {
  const [code, setCode] = useState<string>(embedCode);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fromUrl = getEmbedCodeFromUrl();
    if (fromUrl) setCode(fromUrl);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="d-f ai-c jc-c h-dvh bg-surface c-white">
        <div className="fs-lg">Loading…</div>
      </div>
    );
  }

  return (
    <div className="d-f fd-c h-dvh bg-page">
      <div className="d-f fd-c o-h f-1 @md:fd-r">
        <div className="o-h h-50% @md:h-100% @md:w-50%">
          <MonacoEditor code={code} onChange={setCode} />
        </div>

        <div className="btw-1 bc-border h-50% @md:btw-0 @md:blw-1 @md:h-100% @md:w-50%">
          <Preview ref={iframeRef} code={code} />
        </div>
      </div>

      <a
        href={`/?code=${encodeURIComponent(code)}`}
        target="_blank"
        rel="noreferrer"
        className="d-f ai-c jc-c g-2 px-3 h-8 btw-1 bc-border bg-page c-accent-dim fs-xs fw-500 td-none"
      >
        <OpenNewWindow className="w-4 h-4" />
        Open in the Yumma CSS playground
      </a>
    </div>
  );
};

export default Embed;
